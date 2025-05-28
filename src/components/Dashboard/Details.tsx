import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './Details.css'; 

const DocumentDetail = () => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  // Get authentication credentials
  const username = localStorage.getItem('username');
  const password = localStorage.getItem('password');
  
  const getAuthHeader = () => {
    // Create Basic Authentication header
    const credentials = btoa(`${username}:${password}`);
    return { Authorization: `Basic ${credentials}` };
  };

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/document/${id}`, {
          headers: getAuthHeader(),
          withCredentials: true
        });
        setDocument(response.data);
        setTitle(response.data.title);
        setDescription(response.data.description || '');
        setLoading(false);
      } catch (err) {
        console.error("Error fetching document:", err);
        setError(
          err.response?.data?.message || 
          'Failed to fetch document details. Please check if the server is running.'
        );
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  const handleUpdate = async () => {
    if (!title.trim()) {
      setError('Title cannot be empty');
      return;
    }
    
    setActionLoading(true);
    setError('');
    
    try {
      const response = await axios.put(
        `http://localhost:8080/document/${id}`, 
        null,
        {
          headers: getAuthHeader(),
          withCredentials: true,
          params: { title, description }
        }
      );
      setDocument(response.data);
      setEditing(false);
    } catch (err) {
      console.error("Error updating document:", err);
      setError(
        err.response?.data?.message || 
        'Failed to update document. Please try again later.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setActionLoading(true);
    setError('');
    
    try {
      const response = await axios.put(
        `http://localhost:8080/document/${id}/status`, 
        null,
        {
          headers: getAuthHeader(),
          withCredentials: true,
          params: { status: newStatus }
        }
      );
      setDocument(response.data);
    } catch (err) {
      console.error("Error changing status:", err);
      setError(
        err.response?.data?.message || 
        'Failed to update document status. Please try again later.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setActionLoading(true);
      const response = await axios.get(`http://localhost:8080/document/${id}/file`, {
        headers: getAuthHeader(),
        responseType: 'blob',
        withCredentials: true
      });
      
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.fileName || `document-${id}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading file:", err);
      setError(
        err.response?.data?.message || 
        'Failed to download document. Please try again later.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      setActionLoading(true);
      setError('');
      
      try {
        await axios.delete(`http://localhost:8080/document/${id}`, {
          headers: getAuthHeader(),
          withCredentials: true
        });
        navigate('/dashboard');
      } catch (err) {
        console.error("Error deleting document:", err);
        setError(
          err.response?.data?.message || 
          'Failed to delete document. Please try again later.'
        );
        setActionLoading(false);
      }
    }
  };

  if (loading) return <div className="loading">Loading document details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!document) return <div className="error">Document not found</div>;

  return (
    <div className="document-detail">
      <div className="document-header">
        <div>
          {editing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document title"
              maxLength="100"
            />
          ) : (
            <h2>{document.title}</h2>
          )}
        </div>
        <span className={`status-badge ${document.status.toLowerCase()}`}>
          {document.status}
        </span>
      </div>

      <div className="document-meta">
        <div><strong>File Name:</strong> {document.fileName}</div>
        <div><strong>Created by:</strong> {document.owner}</div>
        <div><strong>Created at:</strong> {new Date(document.createdAt).toLocaleString()}</div>
        {document.updatedAt && (
          <div><strong>Last updated:</strong> {new Date(document.updatedAt).toLocaleString()}</div>
        )}
      </div>

      <div className="document-description">
        <h3>Description</h3>
        {editing ? (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description for this document (optional)"
            maxLength="500"
          />
        ) : (
          <p>{document.description || 'No description provided'}</p>
        )}
      </div>

      {actionLoading && (
        <div className="action-loading">
          Processing your request...
        </div>
      )}

      <div className="document-actions">
        {editing ? (
          <>
            <button onClick={handleUpdate} disabled={actionLoading || !title.trim()}>
              Save Changes
            </button>
            <button onClick={() => {
              setEditing(false);
              setTitle(document.title);
              setDescription(document.description || '');
              setError('');
            }} disabled={actionLoading}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setEditing(true)} disabled={actionLoading}>
              Edit
            </button>
            <button onClick={handleDownload} disabled={actionLoading}>
              Download
            </button>
            {document.status === 'DRAFT' && (
              <button 
                onClick={() => handleStatusChange('SUBMITTED')}
                className="action-button submit"
                disabled={actionLoading}
              >
                Submit for Review
              </button>
            )}
            {document.status === 'UNDER_REVIEW' && (
              <>
                <button 
                  onClick={() => handleStatusChange('APPROVED')}
                  className="action-button approve"
                  disabled={actionLoading}
                >
                  Approve
                </button>
                <button 
                  onClick={() => handleStatusChange('REJECTED')}
                  className="action-button reject"
                  disabled={actionLoading}
                >
                  Reject
                </button>
              </>
            )}
            <button 
              onClick={handleDelete} 
              className="delete-button"
              disabled={actionLoading}
            >
              Delete Document
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentDetail;