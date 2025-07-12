import React from 'react';
import UploadForm from './UploadForm';
import './Sidebar.css';

function Sidebar({ isOpen, onClose, onPhotoUploaded }) {
  return (
    <>
      {/* Overlay that appears behind the sidebar */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      
      {/* Sidebar content */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <button className="sidebar-close" onClick={onClose}>&times;</button>
        
        <div className="sidebar-header">
          <h2>Photo Gallery</h2>
        </div>
        
        <div className="sidebar-content">
          <div className="sidebar-section">
            <h3>Upload New Photo</h3>
            <UploadForm onPhotoUploaded={(photo) => {
              onPhotoUploaded(photo);
              onClose(); // Close sidebar after successful upload
            }} />
          </div>
          
          <div className="sidebar-section">
            <h3>About</h3>
            <p>This photo gallery allows you to upload, browse, and share your favorite photos.</p>
          </div>
          
          <div className="sidebar-section">
            <h3>Contact</h3>
            <p>For support or inquiries, please contact us at:</p>
            <p><a href="mailto:thearpitsinghchauhan@gmail.com">support</a></p>
          </div>
        </div>
        
        <div className="sidebar-footer">
          <p>&copy; {new Date().getFullYear()} Photo Gallery</p>
        </div>
      </div>
    </>
  );
}

export default Sidebar;