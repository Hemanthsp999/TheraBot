import os
from tqdm.auto import tqdm
import faiss
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from TextPipeline import pdf_handler

# dataset_path = "/home/hexa/ai_bhrtya/backend/chatbot_model/mental_dataset.pdf"


class Vector_Database():
    def __init__(self):

        self.model_name = "sentence-transformers/all-MiniLM-L6-v2"
        self.model_kwargs = {'device': 'cuda'}
        # self.embeddings_kwargs = {'normalize_embeddings': False}
        self.embeddings = HuggingFaceEmbeddings(
            model_name=self.model_name,
            model_kwargs=self.model_kwargs,
        )
        self.file_path = "/home/hexa/ai_bhrtya/backend/chatbot_model/faiss_index_file/"  # target folder
        self.d = 384  # dimension of embeddings
        self.db = None

    def Initialize_(self):
        print("Initializing or Loading Faiss vector db ...")

        if os.path.exists(self.file_path):
            print('Loading ...')
            self.db = FAISS.load_local(self.file_path, self.embeddings,
                                       allow_dangerous_deserialization=True)
        else:
            print("No file found, So please wait while processing !...")
            self.db = faiss.IndexFlatL2(self.d)
            print(f"vector_db is initialized with Dimensionality: {self.d}")

    def add_to_vectors(self, chunks: list[str]):
        try:
            print("Initializing chunks_to_vectors process")
            text = [chunk['sentence_chunks']
                    for chunk in tqdm(chunks, desc="Appending chunks to text_var")]

            self.db = FAISS.from_texts(texts=text, embedding=self.embeddings)

        except Exception as e:
            print(f"Something went wrong: {e}")

    def save_vectors(self, target_folder: str):
        try:
            print(f"Saving into {target_folder}")
            self.db.save_local(target_folder)
            return f"Successfully saved to {target_folder}"
        except Exception as e:
            return f"Something went wrong: {e}"


# Add the texts to Vector Database
class add_chunks_to_vector():
    def __init__(self):
        self.tools = pdf_handler()
        self.db_tools = Vector_Database()
        self.data_path = "/home/hexa/ai_bhrtya/backend/chatbot_model/mental_dataset.pdf"

    def main(self):
        read_dataset = self.tools.open_and_process(self.data_path)

        make_sentence = self.tools._to_sentence(read_dataset)
        txt_splitter = self.tools.custom_text_splitter(
            make_sentence, split_size=30, chunk_overlap=15)

        struct_sentence = self.tools.structure_chunks(chunks=txt_splitter)

        self.db_tools.Initialize_()

        self.db_tools.add_to_vectors(struct_sentence)

        self.db_tools.save_vectors(
            self.file_path)


chunks = add_chunks_to_vector()
chunks.main()
