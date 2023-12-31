import React, { useState } from 'react'
import AWS from "aws-sdk";

// Component for entering website URL or file
// To be indexed and then used as context
// onSubmit function to change app from input mode to question mode once valid submission
const Input = ({ onSubmit }) => {
    // States for URL and file values
    const [url, setUrl] = useState('');
    const [file, setFile] = useState(null);
    // Loading states as data uploading/indexing
    const [urlLoading, setUrlLoading] = useState(false);
    const [fileLoading, setFileLoading] = useState(false);
    // Result
    const [responseMessage, setResponseMessage] = useState('');

    // Set active file
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setFile(file);
    };

    // Submit URL for embedding and storage
    const handleSubmit = async (e) => {
        e.preventDefault();
        setUrlLoading(true);
        if (!isUrlValid(url)) {
            setResponseMessage('Error: Enter a valid URL');
            return;
        }
        try {
            const response = await fetch('http://localhost:5000/embed-and-store', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });
            if (response.ok) {
                const data = await response.json();
                setResponseMessage(data.message);
                onSubmit();
            } else {
                setResponseMessage('Error: Something went wrong.');
            }
        } catch (error) {
            console.error('Error:', error);
            setResponseMessage('Error: Something went wrong.');
        } finally {
            setUrlLoading(false);
        }
    };

    // Upload pdf file to S3 bucket
    const handleUpload = async () => {
        if (file) {
            const fileName = file.name
            setFileLoading(true);
            const S3_BUCKET = 'queryapppdf'
            const REGION = "us-east-1";

            AWS.config.update({
                accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
                secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
            });
            const s3 = new AWS.S3({
                params: { Bucket: S3_BUCKET },
                region: REGION,
            });

            const params = {
                Bucket: S3_BUCKET,
                Key: file.name,
                Body: file,
            };

            let upload = s3
                .putObject(params)
                .on("httpUploadProgress", (evt) => {
                    console.log(
                        "Uploading " + parseInt((evt.loaded * 100) / evt.total) + "%"
                    );
                })
                .promise();

            await upload.then((err, data) => {
                console.log(err);
            });

            try {
                const url = null
                const response = await fetch('http://localhost:5000/embed-and-store', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url, S3_BUCKET, fileName }),
                });
                if (response.ok) {
                    const data = await response.json();
                    setResponseMessage(data.message);
                    onSubmit();
                } else {
                    setResponseMessage('Error: Something went wrong.');
                }
            } catch (error) {
                console.error('Error:', error);
                setResponseMessage('Error: Something went wrong.');
            } finally {
                setFileLoading(false);
            }
        } else {
            alert('Error: Choose a file');
        }
    };

    // Check if URL is valid
    const isUrlValid = (url) => {
        try {
            new URL(url);
            return true;
        } catch (error) {
            return false;
        }
    };
    
    return (
        <div>
            <div className='input'>
                <form onSubmit={handleSubmit}>
                    <input
                        type='text'
                        placeholder='Enter a URL or file'
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    <button type='submit' disabled={urlLoading}>
                        {urlLoading ? 'Building Index...' : 'Submit'}
                    </button>
                </form>
            </div>
    
            <div className='input'>
                <form>
                    <input
                        type='file'
                        onChange={handleFileChange}
                    />
                    <button onClick={handleUpload} disabled={fileLoading}>
                        {fileLoading ? 'Uploading file...' : 'Submit'}
                    </button>
                </form>
            </div>
            {responseMessage && <p>{responseMessage}</p>}
        </div>
    );
};


export default Input;