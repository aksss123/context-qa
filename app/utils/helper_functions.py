# Max length limit for prompt
PROMPT_LIMIT = 10000

# Split text into smaller chunks and return a list
def chunk_text(text, chunk_size=500):
    sentences = text.split('. ')
    chunks = []
    current_chunk = ""
    for sentence in sentences:
        if len(current_chunk) + len(sentence) <= chunk_size:
            current_chunk += sentence + '. '
        else:
            chunks.append(current_chunk)
            current_chunk = sentence + '. '
    if current_chunk:
        chunks.append(current_chunk)
    return chunks

# Build a prompt for OpenAI completions API
# Contains instructions and relevant context
# Makes sure response is in markdown format
def build_prompt(query, context_chunks):
    prompt_start = (
        "Answer the question based on the context below. If you don't know the answer based on the context provided below, just make a best guess. Return just the answer to the question, don't add anything else. Don't start your response with the word 'Answer:'. Make sure your response is in markdown format\n\n" +
        "Context:\n"
    )
    prompt_end = (
        f"\n\nQuestion: {query}\nAnswer:"
    )
    prompt = ""
    for i in range(1, len(context_chunks)):
        if len("\n\n---\n\n".join(context_chunks[:i])) >= PROMPT_LIMIT:
            prompt = (
                prompt_start +
                "\n\n---\n\n".join(context_chunks[:i-1]) +
                prompt_end
            )
            break
        elif i == len(context_chunks)-1:
            prompt = (
                prompt_start +
                "\n\n---\n\n".join(context_chunks) +
                prompt_end
            )
    return prompt

# Create a message list with all chats and insert prompt at the end
def construct_messages_list(chat_history, prompt):
    messages = [{"role": "system", "content": "You are a helpful assistant."}]
    for message in chat_history:
        if message['isBot']:
            messages.append({"role": "system", "content": message["text"]})
        else:
            messages.append({"role": "user", "content": message["text"]})
    messages[-1]["content"] = prompt
    return messages
