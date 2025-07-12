import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Gallery from './components/Gallery';
import Sidebar from './components/Sidebar';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newUploadedPhoto, setNewUploadedPhoto] = useState(null);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const handlePhotoUploaded = (photo) => {
    setNewUploadedPhoto(photo);
  };
  
  return (
    <Router>
      <div className="App">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          onPhotoUploaded={handlePhotoUploaded}
        />
        
        <header className="header">
          <button className="hamburger-button" onClick={toggleSidebar}>
            <span className="hamburger-icon"></span>
          </button>
          <h1>Photo Gallery</h1>
          <p className="header-subtitle">Upload, browse, and share your favorite photos</p>
        </header>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={
              <Gallery newUploadedPhoto={newUploadedPhoto} />
            } />
          </Routes>
        </main>
        
        <footer className="footer">
          <p>&copy; {new Date().getFullYear()} Photo Gallery. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
