from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

# Load FAISS directory
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# for file_path don't give relative path always go for absolute path
vector_db = FAISS.load_local("/home/hexa/ai_bhrtya/backend/chatbot_model/faiss/",
                             embedding_model, allow_dangerous_deserialization=True)

retriever = vector_db.as_retriever()


query = "why everythin happens to me only. First i lost my job and now i've been diagnoised with aids."

retrieved_docs = retriever.invoke(query)
ans = vector_db.similarity_search_with_score(query, k=5)

# Print retrieved results
print("\n Retrieved Contexts:")
for idx, doc in enumerate(retrieved_docs):
    print(f"{idx+1}. {doc.page_content}")

best_match = retrieved_docs[0].page_content  # Best-matching retrieved document
matched_doc = vector_db.docstore.search(best_match)

print("\n🧠 Matched FAISS Document:", matched_doc)

for res, score in ans:
    print(f"\nMetadata: {res.metadata}")  # Debugging step
    if 'response' in res.metadata:
        print(f"Similarity Search: [SIM{score:.3f}] {res.page_content} {res.metadata['response']}")
    else:
        print("⚠️ No response metadata found!")

