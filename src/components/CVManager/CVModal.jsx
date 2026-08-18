import React, { useState, useEffect, useRef, useCallback } from 'react';
import CVPdfViewer from './CVPdfViewer';

const ADMIN_PIN = '7890';
const DEFAULT_CV_PATH = process.env.PUBLIC_URL + '/Raja_Chatterjee_CV.pdf';
const DEFAULT_CV_NAME = 'Raja_Chatterjee_CV.pdf';

function dataUrlToBlobUrl(dataUrl) {
  const [header, base64] = dataUrl.split(',');
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return URL.createObjectURL(new Blob([bytes], { type: mime }));
}

function triggerDownload(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function CVModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('preview');
  const [cvUrl, setCvUrl] = useState(DEFAULT_CV_PATH);
  const [pinVerified, setPinVerified] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);
  const blobUrlRef = useRef(null);

  const revokeBlobUrl = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  const getViewableUrl = useCallback(() => {
    if (cvUrl.startsWith('data:')) {
      revokeBlobUrl();
      blobUrlRef.current = dataUrlToBlobUrl(cvUrl);
      return blobUrlRef.current;
    }
    return cvUrl;
  }, [cvUrl, revokeBlobUrl]);

  useEffect(() => {
    const savedCV = localStorage.getItem('custom_raja_cv_base64');
    const savedName = localStorage.getItem('custom_raja_cv_name');
    if (savedCV) {
      setCvUrl(savedCV);
      if (savedName) setUploadedFileName(savedName);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setActiveTab('preview');
    } else {
      document.body.style.overflow = '';
      setShowPinModal(false);
      setPinInput('');
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => () => revokeBlobUrl(), [revokeBlobUrl]);

  const processFile = useCallback((file) => {
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setUploadStatus('Please select a valid PDF file (.pdf)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus('File too large. Please use a PDF under 10 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target.result;
      setCvUrl(base64Data);
      setUploadedFileName(file.name);
      localStorage.setItem('custom_raja_cv_base64', base64Data);
      localStorage.setItem('custom_raja_cv_name', file.name);
      setUploadStatus(`Successfully updated active CV to: ${file.name}`);
      setActiveTab('preview');
    };
    reader.onerror = () => {
      setUploadStatus('Failed to read file. Please try again.');
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    processFile(file);
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    processFile(event.dataTransfer.files?.[0]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleDownload = () => {
    const filename = uploadedFileName || DEFAULT_CV_NAME;
    triggerDownload(getViewableUrl(), filename);
  };

  const handleOpenInNewTab = () => {
    window.open(getViewableUrl(), '_blank', 'noopener,noreferrer');
  };

  const handleResetToDefault = () => {
    localStorage.removeItem('custom_raja_cv_base64');
    localStorage.removeItem('custom_raja_cv_name');
    revokeBlobUrl();
    setCvUrl(DEFAULT_CV_PATH);
    setUploadedFileName('');
    setUploadStatus('Reset to default repository CV.');
    setActiveTab('preview');
  };

  const requestAdminAccess = () => {
    if (pinVerified) {
      setActiveTab('upload');
    } else {
      setShowPinModal(true);
      setPinInput('');
      setUploadStatus('');
    }
  };

  const verifyPin = () => {
    if (pinInput === ADMIN_PIN) {
      setPinVerified(true);
      setShowPinModal(false);
      setActiveTab('upload');
      setUploadStatus('');
    } else {
      setUploadStatus('Incorrect PIN. Access denied.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cv-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="CV Viewer">
      <div className="cv-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="cv-modal-header">
          <div className="cv-header-title">
            <span className="doc-icon" aria-hidden="true">📄</span>
            <div>
              <h3>Raja Chatterjee — Curriculum Vitae</h3>
              <p>Technical Delivery Leader & Digital Builder (18+ Years Experience)</p>
            </div>
          </div>

          <div className="cv-header-actions">
            <button type="button" className="cv-download-btn" onClick={handleDownload}>
              <span aria-hidden="true">↓</span> Download PDF
            </button>
            <button type="button" className="cv-open-tab-btn" onClick={handleOpenInNewTab}>
              Open in New Tab
            </button>
            <button type="button" className="cv-close-btn" onClick={onClose} aria-label="Close">✕</button>
          </div>
        </div>

        <div className="cv-modal-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            <span aria-hidden="true">👁</span> View CV Preview
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={requestAdminAccess}
          >
            <span aria-hidden="true">⚙</span> Admin: Upload Latest CV
          </button>
        </div>

        <div className="cv-modal-content">
          {showPinModal && (
            <div className="pin-prompt-container">
              <h3>Admin Access Required</h3>
              <p className="pin-hint">Enter your admin PIN to upload a new CV.</p>
              <input
                type="password"
                inputMode="numeric"
                autoComplete="off"
                placeholder="Enter PIN"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && verifyPin()}
                className="pin-input"
              />
              <div className="pin-actions">
                <button type="button" className="pin-verify-btn" onClick={verifyPin}>
                  Verify PIN
                </button>
                <button
                  type="button"
                  className="pin-cancel-btn"
                  onClick={() => { setShowPinModal(false); setUploadStatus(''); }}
                >
                  Cancel
                </button>
              </div>
              {uploadStatus && <div className="upload-status-msg error">{uploadStatus}</div>}
            </div>
          )}

          {!showPinModal && activeTab === 'preview' && (
            <div className="cv-preview-panel">
              <CVPdfViewer url={cvUrl} key={cvUrl} />
            </div>
          )}

          {!showPinModal && activeTab === 'upload' && pinVerified && (
            <div className="cv-upload-panel">
              <div
                className={`upload-box ${isDragging ? 'dragging' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="upload-icon" aria-hidden="true">📁</div>
                <h4>Upload New Curriculum Vitae</h4>
                <p>
                  Tap the button below to select a PDF from your device, or drag and drop on desktop.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleFileUpload}
                  className="cv-file-input-hidden"
                  aria-label="Choose PDF file"
                />

                <button type="button" className="file-select-btn" onClick={openFilePicker}>
                  Choose PDF File
                </button>

                {uploadedFileName && (
                  <div className="current-file-badge">
                    <span>Active File:</span> <strong>{uploadedFileName}</strong>
                  </div>
                )}

                {uploadStatus && (
                  <div className={`upload-status-msg ${uploadStatus.includes('denied') || uploadStatus.includes('Failed') || uploadStatus.includes('too large') || uploadStatus.includes('valid') ? 'error' : ''}`}>
                    {uploadStatus}
                  </div>
                )}
              </div>

              <div className="repo-sync-guide">
                <h5>📌 Permanent Git Deployment Guide</h5>
                <ol>
                  <li>Save your updated CV as <code>Raja_Chatterjee_CV.pdf</code>.</li>
                  <li>Replace the file at <code>public/Raja_Chatterjee_CV.pdf</code> in your project repository.</li>
                  <li>Commit and push to GitHub (or run <code>yarn deploy</code>) to publish for all recruiters!</li>
                </ol>
                {uploadedFileName && (
                  <button type="button" className="reset-default-btn" onClick={handleResetToDefault}>
                    Restore Default Repo CV
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
