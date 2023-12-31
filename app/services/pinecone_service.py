import pinecone
from app.services.openai_service import get_embedding
import os

# Pinecone API key from .env
PINECONE_API_KEY = os.environ.get('PINECONE_API_KEY')

# Initialize Pinecone with API key, environment, and max dimension allowed for free tier
pinecone.init(api_key=PINECONE_API_KEY, environment='gcp-starter')
EMBEDDING_DIMENSION = 1536

# Create an index with vector embeddings of the content from user supplied context
# Upload to the Pinecone vector database, using cosine for similarity
def embed_chunks_and_upload_to_pinecone(chunks, index_name):
    if index_name in pinecone.list_indexes():
        pinecone.delete_index(name=index_name)

    pinecone.create_index(name=index_name,
                          dimension=EMBEDDING_DIMENSION, metric='cosine')
    index = pinecone.Index(index_name)
    embeddings_with_ids = []
    for i, chunk in enumerate(chunks):
        embedding = get_embedding(chunk)
        embeddings_with_ids.append((str(i), embedding, chunk))
    upserts = [(id, vec, {"chunk_text": text})
               for id, vec, text in embeddings_with_ids]
    index.upsert(vectors=upserts)

# Get top 30 most similar chunks of text that are most related to the query
def get_most_similar_chunks_for_query(query, index_name):
    question_embedding = get_embedding(query)
    index = pinecone.Index(index_name)
    query_results = index.query(
        question_embedding, top_k=30, include_metadata=True)
    context_chunks = [x['metadata']['chunk_text']
                      for x in query_results['matches']]
    return context_chunks

# Delete the one Pinecone index for new usage
def delete_index(index_name):
    pinecone.delete_index(name=index_name)
    print(f"Index {index_name} deleted successfully")
