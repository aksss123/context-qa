from . import api_blueprint
from flask import request, Response, stream_with_context, jsonify, json
import requests
import sseclient
from app.services import openai_service, pinecone_service, scraping_service
from app.utils.helper_functions import chunk_text

# Name of the Pinecone index
PINECONE_INDEX_NAME = 'index123'

# Get website or pdf text, get vector embeddings, and store in Pinecone
@api_blueprint.route('/embed-and-store', methods=['POST'])
def embed_and_store():
    url = request.json['url']
    if url:
        url_text = scraping_service.scrape_website(url)
        chunks = chunk_text(url_text)
    else:
        bucket_name = request.json['S3_BUCKET']
        file_name = request.json['fileName']
        pdf_text = scraping_service.scrape_pdf(bucket_name, file_name)
        chunks = chunk_text(pdf_text)
    pinecone_service.embed_chunks_and_upload_to_pinecone(
        chunks, PINECONE_INDEX_NAME)
    response_json = {
        "message": "Chunks embedded and stored successfully"
    }
    return jsonify(response_json)


# Get most similar context chunks from Pinecone to generate a response
# Response is returned using SSE from OpenAI completions API
@api_blueprint.route('/handle-query', methods=['POST'])
def handle_query():
    question = request.json['question']
    chat_history = request.json['chatHistory']
    context_chunks = pinecone_service.get_most_similar_chunks_for_query(
        question, PINECONE_INDEX_NAME)
    headers, data = openai_service.construct_llm_payload(
        question, context_chunks, chat_history)

    def generate():
        url = 'https://api.openai.com/v1/chat/completions'
        response = requests.post(url, headers=headers,
                                 data=json.dumps(data), stream=True)
        client = sseclient.SSEClient(response)
        for event in client.events():
            if event.data != '[DONE]':
                try:
                    text = json.loads(event.data)[
                        'choices'][0]['delta']['content']
                    yield (text)
                except:
                    yield ('')
    return Response(stream_with_context(generate()))


# Delete Pinecone index
@api_blueprint.route('/delete-index', methods=['POST'])
def delete_index():
    pinecone_service.delete_index(PINECONE_INDEX_NAME)
    return jsonify({"message": f"Index {PINECONE_INDEX_NAME} deleted successfully"})
