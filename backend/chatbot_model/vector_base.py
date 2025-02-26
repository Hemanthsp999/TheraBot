from datasets import load_dataset
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

# Load dataset
dataset = load_dataset("Amod/mental_health_counseling_conversations")
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")


def extract_dataset_to_vector_store(dataset: load_dataset):

    docs = [item["Context"] for item in dataset["train"]]
    response = [item["Response"] for item in dataset["train"]]

    print(f"Total Size of Context: {len(docs)}, and Response: {len(response)}")

    vector_db = FAISS.from_texts(docs, embedding_model)

    vector_db.save_local("/home/hexa/ai_bhrtya/backend/mental_health_faiss_index")


extract_dataset_to_vector_store(dataset)
