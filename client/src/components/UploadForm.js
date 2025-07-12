import React, { useState } from 'react';
import axios from 'axios';
import './UploadForm.css';

function UploadForm({ onPhotoUploaded }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // Create preview
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setError(null);
    setUploading(true);

    const formData = new FormData();
    formData.append('photo', file);
    formData.append('title', title);
    formData.append('description', description);

    try {
      const response = await axios.post('https://photo-gallery-hu3i.onrender.com/api/photos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
      setPreview(null);

      // Notify parent component
      if (onPhotoUploaded) {
        onPhotoUploaded(response.data);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      setError('Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-form-container">
      <h2>Upload a Photo</h2>

      {error && <div className="upload-error">{error}</div>}

      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="photo">Select Photo</label>
          <input
            type="file"
            id="photo"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />

          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Preview" />
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title (optional)"
            disabled={uploading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a description (optional)"
            disabled={uploading}
          />
        </div>

        <button
          type="submit"
          className="upload-button"
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Photo'}
        </button>
      </form>
    </div>
  );
}

export default UploadForm;