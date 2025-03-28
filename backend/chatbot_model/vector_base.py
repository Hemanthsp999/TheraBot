from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

from datasets import load_dataset

ds = load_dataset("Amod/mental_health_counseling_conversations")

'''context = [content for content in ds['train']['Context']]
response = [resp for resp in ds['train']['Response']]
'''
context = ds['train']['Context']
response = ds['train']['Response']

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2",
    model_kwargs={'device': 'cuda'}
)
metadatas = [{"response": resp} for resp in response]
db = FAISS.from_texts(context, embeddings, metadatas=metadatas)
db.save_local("/home/hexa/ai_bhrtya/backend/chatbot_model/faiss/")


