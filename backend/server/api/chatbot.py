from rest_framework.response import Response
from langchain.chains.conversation.memory import ConversationBufferMemory
from operator import itemgetter
from io import BytesIO
from rest_framework import status
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_ollama import ChatOllama
import time
import librosa
import whisper
import numpy as np

whisper_model = whisper.load_model("tiny")

SYSTEM_TEMPLATE = """
        You are an AI Therapist named TheraBot. You provide efficient solution for users mental health issues.
        And also highlight most important solution.
        If user has sucide thought, then you should remember them that they've family members they waiting for them. And think throughly before answering this question.
        Don't answer other than mental health issues.

        Context information is below.
        {context}

        Chat history:
            {chat_history}

        Human: {input}
        AI:"""

transformer_model_name = "sentence-transformers/all-miniLM-L6-v2"
embedding_model = HuggingFaceEmbeddings(model_name=transformer_model_name)

# path to vector database
folder_path = "/home/hexa/ai_bhrtya/backend/chatbot_model/faiss/"
vector_db = FAISS.load_local(folder_path=folder_path,
                             embeddings=embedding_model, allow_dangerous_deserialization=True)
model_name = "llama3.2"  # Llama-3.2 LLM Model
temperature = 0.5
whisper_model = whisper.load_model("tiny")
llm = ChatOllama(model=model_name, temperature=temperature)
vector_db = vector_db
str_out_put_parser = StrOutputParser()
retriever = vector_db.as_retriever(
    search_kwargs={"k": 3},
)


def setup_rag_chain(self):
    # metadata = retriever.metadata

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", SYSTEM_TEMPLATE),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
        ]
    )

    rag_chain = (
        {
            "context": itemgetter("input") | retriever | self.format_docs,
            "input": lambda x: x["input"],
            "chat_history": lambda x: x.get("chat_history", []),
        }
        | prompt
        | llm
        | str_out_put_parser
    )

    return rag_chain


class Chatbot():

    # NOTE It only tracks current session after expiriation of session the memory will be wiped out
    conversation_memories = {}
    rag_chain = None

    def __init__(self, **kwargs):
        if Chatbot.rag_chain is None:
            Chatbot.rag_chain = setup_rag_chain(self)

    @staticmethod
    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    def get_memory_for_user(self, user_id):
        """Get or create a memory instance for a specific user"""
        if user_id not in self.conversation_memories:
            self.conversation_memories[user_id] = ConversationBufferMemory(
                return_messages=True
            )
            print(f"Session history: {self.conversation_memories[user_id]}")
        return self.conversation_memories[user_id]

    def conversation(self, request):
        query = request.data.get('query', "").strip()
        audio_file = request.FILES.get("audio", None)
        print(f"audio file is received: {audio_file}")

        user_id = request.user.id if request.user.is_authenticated else request.session.session_key

        # Get memory for this specific user
        memory = self.get_memory_for_user(user_id)

        # Retrieve chat history from memory
        chat_history = memory.load_memory_variables({}).get("history", [])

        if not (query or audio_file):
            return Response({"error": "Query is missing"}, status=status.HTTP_400_BAD_REQUEST)

        # Process audio if provided
        if audio_file:
            audio_bytes = audio_file.read()
            audio_stream = BytesIO(audio_bytes)
            # Load the audio file into a NumPy array
            audio, sr = librosa.load(audio_stream, sr=16000)  # Whisper expects 16kHz audio
            # convert into array
            audio = np.array(audio, dtype=np.float32)
            audio = whisper.pad_or_trim(audio)
            result = whisper_model.transcribe(audio)
            print(f"Decoded Audio: {result['text']}")
            query = result['text']

        # Use the RAG chain with proper input structure
        start = time.time()
        response = Chatbot.rag_chain.invoke({"input": query, "chat_history": chat_history})
        end = time.time() - start
        print(f"Final response time of Bot: {end}")

        # add user_question and bot_response into chat_memory
        memory.chat_memory.add_user_message(query)
        memory.chat_memory.add_ai_message(response)

        return response
