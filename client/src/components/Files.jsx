import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function Files({ projectId }) {
  const [files, setFiles] = useState([]);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [previewVersion, setPreviewVersion] = useState(null);
  const [previewContent, setPreviewContent] = useState(null);
  
  useEffect(() => {
    if (projectId) fetchFiles();
  }, [projectId]);

  const fetchFiles = async () => {
    try {
      const res = await api.get(`/files/project/${projectId}`);
      setFiles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!fileToUpload || !projectId) return;
    
    const formData = new FormData();
    formData.append('file', fileToUpload);
    
    try {
      await api.post(`/files/project/${projectId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFileToUpload(null);
      fetchFiles();
    } catch (err) {
      alert('Upload failed');
    }
  };

  const downloadFile = async (versionId, filename) => {
    try {
      const res = await api.get(`/files/download/${versionId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
    }
  };

  const previewFile = async (versionId, filename) => {
    setPreviewVersion({ id: versionId, name: filename });
    
    const ext = filename.split('.').pop().toLowerCase();
    
    // For images, we can just point an img tag directly to the URL using the token
    if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext)) {
      setPreviewContent({ type: 'image', url: `/api/files/download/${versionId}?preview=true` });
      return;
    }
    
    // For PDF, we can use iframe
    if (ext === 'pdf') {
      setPreviewContent({ type: 'pdf', url: `/api/files/download/${versionId}?preview=true` });
      return;
    }

    // For code/text files, fetch the text and render syntax highlighter
    if (['js', 'jsx', 'ts', 'tsx', 'py', 'c', 'cpp', 'h', 'txt', 'json', 'md', 'html', 'css'].includes(ext)) {
      try {
        const res = await api.get(`/files/download/${versionId}?preview=true`);
        setPreviewContent({ type: 'code', content: typeof res.data === 'object' ? JSON.stringify(res.data, null, 2) : res.data, language: ext });
      } catch (err) {
        setPreviewContent({ type: 'error', message: 'Failed to load preview' });
      }
      return;
    }

    // Unsupported preview
    setPreviewContent({ type: 'unsupported' });
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Project Files</h2>
      
      <form onSubmit={handleUpload} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        <input 
          type="file" 
          onChange={(e) => setFileToUpload(e.target.files[0])}
          style={{ color: 'white' }}
        />
        <button type="submit" className="btn btn-primary" disabled={!fileToUpload}>Upload</button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {files.map(f => (
          <div key={f.id} className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: 0 }}>{f.name}</h4>
              <small style={{ color: 'var(--text-muted)' }}>Version {f.version_number} • Uploaded by {f.uploader_name}</small>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }} onClick={() => previewFile(f.latest_version_id, f.name)}>Preview</button>
              <button className="btn btn-primary" onClick={() => downloadFile(f.latest_version_id, f.name)}>Download</button>
            </div>
          </div>
        ))}
        {files.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No files uploaded yet.</p>}
      </div>

      {previewVersion && previewContent && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', 
          justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '2rem'
        }}>
          <div className="glass-panel" style={{ width: '80%', height: '80%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
              <h3>{previewVersion.name}</h3>
              <button onClick={() => { setPreviewVersion(null); setPreviewContent(null); }} className="btn" style={{ background: '#ef4444', color: 'white' }}>Close</button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', background: previewContent.type === 'image' || previewContent.type === 'pdf' ? '#fff' : 'transparent' }}>
              {previewContent.type === 'image' && (
                <img src={previewContent.url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="preview" loading="lazy" />
              )}
              {previewContent.type === 'pdf' && (
                <iframe src={previewContent.url} style={{ width: '100%', height: '100%', border: 'none' }} title="pdf preview" />
              )}
              {previewContent.type === 'code' && (
                <SyntaxHighlighter language={previewContent.language} style={vscDarkPlus} customStyle={{ margin: 0, height: '100%' }}>
                  {previewContent.content}
                </SyntaxHighlighter>
              )}
              {previewContent.type === 'unsupported' && (
                <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                  <p>Preview not supported for this file type. Please download to view.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
