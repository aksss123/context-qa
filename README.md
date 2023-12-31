# Augmenting LLM performance using Retrieval Augmented Generation
This project is an attempt at improving ChatGPT's question answering performance on things that it was not trained on. For example, documents that aren't publically available, events after its knowledge cutoff, etc.

The app takes in user context in the form of a URL or PDF file. If the user inputs a URL, the text is scraped using ```BeautifulSoup```. If the user uploads a PDF, the file is uploaded to an AWS S3 bucket and scraped using ```PyMuPDF```. The text from either user input is turned into a vector embedding using the ```OpenAI Embeddings API``` and stored in a ```Pinecone vector database```. The user then inputs a query. This query is vectorized and the most relevant text is pulled from the vector database and used to prompt the ```OpenAI Chat Completion API``` to answer the user query with context.

## Detailed flow
The app running in the browser allows the user to provide a website URL or PDF file to serve as the 
knowledge base that the bot can answer questions about. The app functions as follows:

1. Context building
    1. User inputs a URL or PDF file
    2. App scrapes website/PDF
    3. Text is broken down into more manageable chunks
    3. Chunks are embedded using OpenAI *text-embedding-ada-002* model
    4. Embeddings are uploaded to Pinecone vector database

![Context building](/figures/context-building.png)


2. Q&A
    1. User inputs a query
    2. Use OpenAI *text-embedding-ada-002* model to embed the query
    3. Retrieve top relevant context chunks from Pinecone vector database
    4. Build a prompt using the relevant context
    5. Display OpenAI GPT-4 chat completion API response

![Q&A](/figures/qa.png)

## Getting started
These instructions will get you a copy of the project up and running on your machine for testing purposes.

### Packages/modules
In the **QueryApp** directory, run the following command to install the necessary python modules.

```pip install -r requirements.txt```

Switch to the **client** directory and run the following command to install the necessary node modules.

```npm install```

### API keys
Create an **.env** file in the **QueryApp** directory and insert values as below:
```
OPENAI_API_KEY=<YOUR VALUE HERE>
PINECONE_API_KEY=<YOUR VALUE HERE>
FLASK_ENV=development
```

Create an **.env** file in the **client** directory and insert values as below:
```
REACT_APP_AWS_ACCESS_KEY=<YOUR VALUE HERE>
REACT_APP_AWS_SECRET_ACCESS_KEY=<YOUR VALUE HERE>
```

## Running
Open a terminal, cd to the **QueryApp** directory, and run the following command to start the backend:

```python3 run.py```

Open another terminal, cd to the **client** directory and run the following command to start the frontend:

```npm start```

Navigate to ```localhost:3000``` to see the app up and running!

### Demo
 [How Tesla, BMW, Ford, GM and Mercedes driver assist systems compare](https://techcrunch.com/2023/12/28/how-tesla-bmw-ford-gm-and-mercedes-driver-assist-systems-compare/?guccounter=1)

![Add context view](/figures/context.png)

![Chat view](/figures/chat.png)

## Acknowledgements
* [Prompt Engineering Guide](https://www.promptingguide.ai/techniques/rag)
* [OpenAI Cookbook](https://cookbook.openai.com/examples/question_answering_using_embeddings)
* [Ashwin Kumar](https://shwinda.medium.com/build-a-full-stack-llm-application-with-openai-flask-react-and-pinecone-part-1-f3844429a5ef)
* [LangChain](https://python.langchain.com/docs/use_cases/question_answering/)

## License
### The MIT License (MIT)

> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

