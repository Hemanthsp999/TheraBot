from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

# Load FAISS directory
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# for file_path don't give relative path always go for absolute path
vector_db = FAISS.load_local("/home/hexa/ai_bhrtya/backend/mental_health_faiss_index/",
                             embedding_model, allow_dangerous_deserialization=True)

retriever = vector_db.as_retriever()

query = "I'm going through some things with my feelings and "
retrieved_docs = retriever.get_relevant_documents(query)

# Print retrieved results
print("\n Retrieved Contexts:")
for idx, doc in enumerate(retrieved_docs):
    print(f"{idx+1}. {doc.page_content}")

best_match = retrieved_docs[0].page_content  # Best-matching retrieved document
matched_doc = vector_db.docstore.search(best_match)

print("\n🧠 Matched FAISS Document:", matched_doc)

