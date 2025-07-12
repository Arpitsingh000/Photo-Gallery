import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import UploadForm from './UploadForm';
import './Gallery.css';
import ImageModal from './ImageModal';

function Gallery({ newUploadedPhoto }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [deleteStatus, setDeleteStatus] = useState(null);

  const fetchPhotos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:5000/api/photos?page=${page}&search=${searchQuery}`);
      
      if (response.data.length === 0) {
        setHasMore(false);
      } else {
        setPhotos(prev => page === 1 ? response.data : [...prev, ...response.data]);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
      setError('Failed to load photos. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);
  
  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);
  
  // Handle new uploaded photo from sidebar
  useEffect(() => {
    if (newUploadedPhoto) {
      setPhotos(prevPhotos => [newUploadedPhoto, ...prevPhotos]);
    }
  }, [newUploadedPhoto]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
    setHasMore(true); // Reset hasMore when searching
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const openPhotoModal = (photo) => {
    setSelectedPhoto(photo);
  };
  
  const closePhotoModal = () => {
    setSelectedPhoto(null);
  };
  
  const handleDeletePhoto = (photoId) => {
    // Remove the deleted photo from the state
    setPhotos(prevPhotos => prevPhotos.filter(photo => photo._id !== photoId));
    
    // Show success message
    setDeleteStatus({ type: 'success', message: 'Photo deleted successfully' });
    
    // Clear the message after 3 seconds
    setTimeout(() => {
      setDeleteStatus(null);
    }, 3000);
  };

  // Group photos into categories for Netflix-style rows
  const getPhotosByCategory = () => {
    if (photos.length === 0) return [];
    
    // If search is active, just show all results in one row
    if (searchQuery) {
      return [{
        title: 'Search Results',
        photos: photos
      }];
    }
    
    // Create rows
    const categories = [];
    
    // Add all photos in a row
    categories.push({
      title: 'All Photos',
      photos: photos
    });
    
    return categories;
  };

  
  const photoCategories = getPhotosByCategory();

  return (
    <div className="gallery">
      <div className="search-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search photos..."
            value={searchQuery}
            onChange={handleSearch}
            className="search-input"
          />
          <button className="search-button">🔍</button>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {photoCategories.length > 0 ? (
        photoCategories.map((category, categoryIndex) => (
          <div key={categoryIndex}>
            <h2 className="row-title">{category.title}</h2>
            <div className="photo-grid">
              {category.photos.map((photo, index) => (
                <div 
                  key={photo._id || `${categoryIndex}-${index}`} 
                  className="photo-item"
                  onClick={() => openPhotoModal(photo)}
                >
                  {/* Add image loading state */}
                  <div className="image-loading"></div>
                  <img 
                    src={photo.url.startsWith('http') ? photo.url : `http://localhost:5000${photo.url}`} 
                    alt={photo.title || 'Gallery image'}
                    onLoad={(e) => {
                      console.log('Image loaded successfully:', photo.url);
                      // Remove loading indicator when image loads
                      const loadingEl = e.target.previousSibling;
                      if (loadingEl && loadingEl.classList.contains('image-loading')) {
                        loadingEl.style.display = 'none';
                      }
                      
                      // Adjust container based on image dimensions
                      const img = e.target;
                      const container = img.parentElement;
                      const aspectRatio = img.naturalWidth / img.naturalHeight;
                      
                      // Apply custom class based on aspect ratio
                      if (aspectRatio > 1.7) { // Very wide images
                        container.classList.add('photo-item-wide');
                      } else if (aspectRatio < 0.7) { // Tall/portrait images
                        container.classList.add('photo-item-tall');
                      } else if (aspectRatio > 1.3 && aspectRatio <= 1.7) { // Moderately wide images
                        container.classList.add('photo-item-landscape');
                      } else { // Standard/square-ish images
                        container.classList.add('photo-item-standard');
                      }
                    }}
                    onError={(e) => {
                      console.error('Image failed to load:', photo.url);
                      
                      // Check if the file exists on the server
                      axios.get(`http://localhost:5000/api/check-file?path=${photo.url}`)
                        .then(response => {
                          console.log('File check result:', response.data);
                        })
                        .catch(error => {
                          console.error('Error checking file:', error);
                        });
                      
                      e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                      e.target.alt = 'Failed to load image';
                      // Remove loading indicator on error too
                      const loadingEl = e.target.previousSibling;
                      if (loadingEl && loadingEl.classList.contains('image-loading')) {
                        loadingEl.style.display = 'none';
                      }
                    }}
                  />
                  {photo.title && <div className="photo-title">{photo.title}</div>}
                  <div className="photo-overlay">
                    <div className="view-icon">🔍</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : !loading && (
        <div className="no-photos">No photos found. Open the menu to upload some!</div>
      )}
      
      {loading && <div className="loading">Loading...</div>}
      
      {!loading && hasMore && photos.length > 0 && (
        <button onClick={loadMore} className="load-more">
          Load More
        </button>
      )}
      
      {!hasMore && photos.length > 0 && (
        <div className="end-message">You've reached the end of the gallery</div>
      )}
      
      {/* Image Modal for fullscreen view */}
      {selectedPhoto && (
        <ImageModal 
          photo={selectedPhoto} 
          onClose={closePhotoModal}
          onDelete={handleDeletePhoto}
        />
      )}
      
      {/* Delete status message */}
      {deleteStatus && (
        <div className={`status-message ${deleteStatus.type}`}>
          {deleteStatus.message}
        </div>
      )}
    </div>
  );
}

export default Gallery;