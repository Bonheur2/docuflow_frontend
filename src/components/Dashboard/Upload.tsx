import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Upload.css';

const DocumentUpload = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit');
      e.target.value = null;
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title) {
      setError('Title and file are required');
      return;
    }

    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description || '');

    try {
      console.log("Attempting to upload document...", {
        title,
        description,
        file: file.name,
        size: file.size
      });

      // Create Basic Authentication header

      const username = localStorage.getItem('username');
      const password = localStorage.getItem('password');

      const credentials = btoa(`${username}:${password}`); 

     

      const response = await axios.post('http://localhost:8080/document/new', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Basic ${credentials}`
        },
        withCredentials: true,
        timeout: 30000,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        }
      });

      console.log("Upload successful:", response.data);
      navigate('/dashboard');
    } catch (err) {
      console.error("Upload error details:", {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        request: !!err.request,
        response: !!err.response,
        headers: err.config?.headers
      });


      if (err.code === 'ECONNABORTED') {
        setError('Upload timed out. Please try again with a smaller file or check your connection.');
      } else if (err.message === 'Network Error') {
        setError('Network error: Server may be down or unreachable. Please check your connection and verify the server is running.');
      } else if (err.response) {

        setError(`Server error: ${err.response.status} ${err.response.data.message || err.response.statusText}`);
      } else {
        setError(`Upload failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };


  const checkServerConnection = async () => {
    try {

      const username = localStorage.getItem('username');
      const password = localStorage.getItem('password');

      const credentials = btoa(`${username}:${password}`);

      await axios.get('http://localhost:8080/document/test', {
        timeout: 5000,
        headers: {
          'Authorization': `Basic ${credentials}`
        },
        withCredentials: true
      });
      return true;
    } catch (err) {
      console.log("Server health check failed:", err.message);
      return false;
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload New Document</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title*</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength="100"
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength="500"
            rows="4"
          />
        </div>
        <div className="form-group">
          <label htmlFor="file">Document File* (Max 10MB)</label>
          <input
            id="file"
            type="file"
            onChange={handleFileChange}
            required
            accept=".pdf,.doc,.docx,.txt,.rtf,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
          />
          <div className="file-types">
            Accepted file types: PDF, Word, Excel, PowerPoint, Text, Images
          </div>
        </div>

        {loading && (
          <div className="progress-container">
            <div
              className="progress-bar"
              style={{ width: `${progress}%` }}
            >
              {progress}%
            </div>
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            disabled={loading}
            className="cancel-button"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !file || !title}
            className="submit-button"
          >
            {loading ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocumentUpload;