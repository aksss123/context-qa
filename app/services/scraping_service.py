import requests
from bs4 import BeautifulSoup
import boto3
import fitz

# Return all text from a website at the URL
def scrape_website(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    text = soup.get_text(separator='\n')
    return text

# Return all text from PDF stored in S3 bucket
def scrape_pdf(bucket_name, object_key):
    s3 = boto3.client('s3')

    temp_pdf_path = '/tmp/temp.pdf'
    s3.download_file(bucket_name, object_key, temp_pdf_path)

    text = ''
    with fitz.open(temp_pdf_path) as pdf_document:
        for page_number in range(pdf_document.page_count):
            page = pdf_document.load_page(page_number)
            text += page.get_text()

    return text
