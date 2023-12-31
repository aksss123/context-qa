import os
import json
import requests
from openai import OpenAI
from app.utils.helper_functions import build_prompt, construct_messages_list

# OpenAI API key from .env
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')

# Embedding model and GPT model to use
OPENAI_EMBEDDING_MODEL = 'text-embedding-ada-002'
CHATGPT_MODEL = 'gpt-4-1106-preview'

# Make a request to OpenAI to get vector embeddings for the given chunk
def get_embedding(chunk):
    url = 'https://api.openai.com/v1/embeddings'
    headers = {
        'content-type': 'application/json; charset=utf-8',
        'Authorization': f"Bearer {OPENAI_API_KEY}"
    }
    data = {
        'model': OPENAI_EMBEDDING_MODEL,
        'input': chunk
    }
    response = requests.post(url, headers=headers, data=json.dumps(data))
    response_json = response.json()
    embedding = response_json["data"][0]["embedding"]
    return embedding

# Return headers and data to make request to chat completion API
# Builds prompt based on the user query, context, and chat history
def construct_llm_payload(question, context_chunks, chat_history):
    prompt = build_prompt(question, context_chunks)
    print("\n==== PROMPT ====\n")
    print(prompt)

    messages = construct_messages_list(chat_history, prompt)

    headers = {
        'content-type': 'application/json; charset=utf-8',
        'Authorization': f"Bearer {OPENAI_API_KEY}"
    }
    data = {
        'model': CHATGPT_MODEL,
        'messages': messages,
        'temperature': 0,
        'max_tokens': 1000,
        'stream': True
    }

    return headers, data
