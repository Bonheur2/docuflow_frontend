import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Get username from localStorage
  const username = localStorage.getItem('username') || 'User';

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Function to fetch documents from the backend
  const fetchDocuments = useCallback(async () => {
    setLoading(true);

    try {
      const username = localStorage.getItem('username');
      const password = localStorage.getItem('password');

      const credentials = btoa(`${username}:${password}`);

      const response = await axios.get('http://localhost:8080/document', {
        headers: {
          'Authorization': `Basic ${credentials}`
        },
        withCredentials: true
      });

      const data = response.data;

      if (Array.isArray(data)) {
        setDocuments(data);
        setTotalPages(Math.ceil(data.length / itemsPerPage) || 1);
      } else {
        throw new Error('Unexpected response format from API');
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching documents:', err);
      const errorMessage = err.response?.data?.message || 'Failed to fetch documents';
      setError(errorMessage);
      setDocuments([]);

      // Handle unauthorized access
      if (err.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleUpload = () => {
    navigate('/documents/upload');
  };

  const handleDocumentClick = (id) => {
    navigate(`/documents/${id}`);
  };

  const handleStatusChange = async (id, newStatus, e) => {
    e.stopPropagation();

    try {
      // Get stored credentials
      const username = localStorage.getItem('username');
      const password = localStorage.getItem('password');

      // Create Basic Authentication header
      const credentials = btoa(`${username}:${password}`);

      // Update to match your controller's endpoint format
      await axios.put(`http://localhost:8080/document/${id}/status`, null, {
        headers: {
          'Authorization': `Basic ${credentials}`
        },
        params: { status: newStatus },
        withCredentials: true
      });

      // Update local state
      setDocuments(documents.map(doc =>
        doc.id === id ? { ...doc, status: newStatus } : doc
      ));

      // Show success message
      // setError(`Document status updated to ${newStatus.replace('_', ' ').toLowerCase()}`);

      // Clear message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);

    } catch (err) {
      // setError('Failed to update document status');
      console.error('Status update error:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    localStorage.removeItem('authenticated');
    navigate('/api/auth/login');
  };

  const handleDocumentDownload = (id, e) => {
    e.stopPropagation();

    const username = localStorage.getItem('username');
    const password = localStorage.getItem('password');

    const credentials = btoa(`${username}:${password}`);

    window.open(`http://localhost:8080/document/${id}/file`, '_blank');
  };

  const normalizeCase = (str) => {
    return str ? str.toUpperCase() : '';
  };

  const filteredDocuments = documents.filter(doc => {
    // First filter by status
    const docStatus = normalizeCase(doc.status);
    const tabStatus = activeTab === 'all' ? 'all' : normalizeCase(activeTab);
    const statusMatch = tabStatus === 'all' || docStatus === tabStatus;

    // Then filter by search term
    const searchMatch = searchTerm === '' ||
      (doc.title && doc.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()));

    return statusMatch && searchMatch;
  });

  const currentDocuments = filteredDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setTotalPages(Math.ceil(filteredDocuments.length / itemsPerPage) || 1);
    if (currentPage > Math.ceil(filteredDocuments.length / itemsPerPage)) {
      setCurrentPage(1);
    }
  }, [filteredDocuments.length, currentPage]);

  const getStatusLabel = (status) => {
    if (!status) return 'Unknown';
    return status.replace('_', ' ');
  };

  if (loading && documents.length === 0) {
    return <div className="loading-container"><div className="loading">Loading documents...</div></div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>DocuFlow Dashboard</h1>
        <div className="user-actions">
          <span className="welcome-message">Welcome, {username}</span>
          <button onClick={handleUpload} className="upload-button">
            Upload New Document
          </button>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      {error && (
        <div className={`error-banner ${error.includes('updated') ? 'success' : ''}`}>
          {error}
        </div>
      )}

      <div className="dashboard-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search documents..."
            onChange={handleSearch}
            value={searchTerm}
          />
        </div>

        <div className="status-tabs">
          {['all', 'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map(tab => (
            <button
              key={tab}
              className={`tab ${activeTab === tab.toLowerCase() ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.toLowerCase())}
            >
              {tab === 'all' ? 'All' : getStatusLabel(tab)}
            </button>
          ))}
        </div>
      </div>

      <div className="document-list">
        {loading && <div className="overlay-loading">Refreshing...</div>}

        {currentDocuments.length === 0 ? (
          <div className="empty-state">
            {searchTerm || activeTab !== 'all'
              ? 'No documents match your criteria'
              : 'No documents found. Upload a new document to get started!'}
          </div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentDocuments.map(doc => (
                  <tr key={doc.id} onClick={() => handleDocumentClick(doc.id)}>
                    <td className="doc-title">
                      {doc.title || 'Untitled'}
                    </td>
                    <td>{doc.description || 'No description'}</td>
                    <td>
                      <span className={`status-badge ${doc.status?.toLowerCase() || 'draft'}`}>
                        {getStatusLabel(doc.status)}
                      </span>
                    </td>
                    <td>{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td className="action-buttons" onClick={(e) => e.stopPropagation()}>
                      {doc.status === 'DRAFT' && (
                        <button
                          onClick={(e) => handleStatusChange(doc.id, 'SUBMITTED', e)}
                          className="action-button submit"
                        >
                          Submit
                        </button>
                      )}
                      {doc.status === 'UNDER_REVIEW' && (
                        <>
                          <button
                            onClick={(e) => handleStatusChange(doc.id, 'APPROVED', e)}
                            className="action-button approve"
                          >
                            Approve
                          </button>
                          <button
                            onClick={(e) => handleStatusChange(doc.id, 'REJECTED', e)}
                            className="action-button reject"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={(e) => handleDocumentDownload(doc.id, e)}
                        className="action-button download"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;