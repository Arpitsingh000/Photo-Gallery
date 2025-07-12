import React, { useState } from 'react';
import axios from 'axios';
import './ImageModal.css';

function ImageModal({ photo, onClose, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  if (!photo) return null;

  const imageUrl = photo.url.startsWith('http')
    ? photo.url
    : `https://photo-gallery-hu3i.onrender.com${photo.url}`;


  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError(null);

      await axios.delete(`https://photo-gallery-hu3i.onrender.com/api/photos/${photo._id}`);


      // Close the modal and notify parent component
      onClose();
      if (onDelete) {
        onDelete(photo._id);
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      setDeleteError('Failed to delete photo. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>

        <div className="modal-image-container">
          <div className="modal-loading"></div>
          <img
            src={imageUrl}
            alt={photo.title || 'Full size image'}
            className="modal-image"
            onLoad={(e) => {
              console.log('Modal image loaded successfully:', imageUrl);
              // Remove loading indicator when image loads
              const loadingEl = e.target.previousSibling;
              if (loadingEl && loadingEl.classList.contains('modal-loading')) {
                loadingEl.style.display = 'none';
              }

              // Adjust modal content based on image dimensions
              const img = e.target;
              const modalContent = img.closest('.modal-content');
              const aspectRatio = img.naturalWidth / img.naturalHeight;

              // Apply appropriate class based on aspect ratio
              if (aspectRatio > 1.7) { // Very wide images
                modalContent.classList.add('modal-wide');
              } else if (aspectRatio < 0.7) { // Tall/portrait images
                modalContent.classList.add('modal-tall');
              } else { // Standard images
                modalContent.classList.add('modal-standard');
              }
            }}
            onError={(e) => {
              console.error('Modal image failed to load:', imageUrl);

              // Check if the file exists on the server
              axios.get(`https://photo-gallery-hu3i.onrender.com/api/check-file?path=${photo.url}`)

                .then(response => {
                  console.log('Modal file check result:', response.data);
                })
                .catch(error => {
                  console.error('Error checking modal file:', error);
                });

              e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
              e.target.alt = 'Failed to load image';
              // Remove loading indicator on error too
              const loadingEl = e.target.previousSibling;
              if (loadingEl && loadingEl.classList.contains('modal-loading')) {
                loadingEl.style.display = 'none';
              }
            }}
          />
        </div>

        <div className="modal-info">
          {photo.title && <h2 className="modal-title">{photo.title}</h2>}
          {photo.description && <p className="modal-description">{photo.description}</p>}

          <div className="modal-actions">
            <button
              className="delete-button"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Photo'}
            </button>
          </div>

          {deleteError && <div className="delete-error">{deleteError}</div>}
        </div>
      </div>
    </div>
  );
}

export default ImageModal;