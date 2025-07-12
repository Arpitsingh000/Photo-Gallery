const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Local data storage path
const dataFilePath = path.join(__dirname, 'photos.json');

// Initialize photos data
let photos = [];

// Load existing photos data if available
if (fs.existsSync(dataFilePath)) {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    photos = JSON.parse(data);
    console.log(`Loaded ${photos.length} photos from local storage`);
  } catch (error) {
    console.error('Error loading photos data:', error);
    // Initialize with empty array if there's an error
    photos = [];
  }
} else {
  // Create empty photos file if it doesn't exist
  fs.writeFileSync(dataFilePath, JSON.stringify([]), 'utf8');
  console.log('Created new photos data file');
}

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
  }
});

const upload = multer({ storage: storage });

// Function to save photos data to file
const savePhotosData = () => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(photos), 'utf8');
    console.log('Photos data saved successfully');
  } catch (error) {
    console.error('Error saving photos data:', error);
  }
};

// Routes
app.get('/api/photos', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    // Filter photos by search term if provided
    let filteredPhotos = photos;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPhotos = photos.filter(photo => 
        photo.title && photo.title.toLowerCase().includes(searchLower)
      );
    }

    // Sort by createdAt in descending order
    filteredPhotos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination
    const paginatedPhotos = filteredPhotos.slice(skip, skip + limit);

    res.json(paginatedPhotos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/photos', upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const { title, description } = req.body;
    const url = `/uploads/${req.file.filename}`;

    const photo = {
      _id: Date.now().toString(), // Generate a unique ID
      title: title || 'Untitled',
      description: description || '',
      url,
      createdAt: new Date().toISOString()
    };

    // Add to photos array
    photos.unshift(photo);
    
    // Save to file
    savePhotosData();
    
    res.status(201).json(photo);
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(400).json({ message: error.message });
  }
});

// Log when files are requested from uploads directory
app.use('/uploads', (req, res, next) => {
  console.log(`File requested: ${req.path}`);
  console.log(`Full URL: ${req.protocol}://${req.get('host')}${req.originalUrl}`);
  next();
});

// Serve uploaded files with proper CORS headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  // Log the file path being requested
  const filePath = path.join(__dirname, 'uploads', req.path);
  console.log(`Attempting to serve file: ${filePath}`);
  console.log(`File exists: ${fs.existsSync(filePath)}`);
  
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Add a route to check if a file exists
app.get('/api/check-file', (req, res) => {
  const filePath = req.query.path;
  if (!filePath) {
    return res.status(400).json({ exists: false, message: 'No file path provided' });
  }
  
  const fullPath = path.join(__dirname, filePath.replace(/^\/+/, ''));
  const exists = fs.existsSync(fullPath);
  
  console.log(`Checking file: ${fullPath}, exists: ${exists}`);
  res.json({ exists, path: fullPath });
});

// Add a route to get a single photo by ID
app.get('/api/photos/:id', (req, res) => {
  try {
    const photo = photos.find(p => p._id === req.params.id);
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    res.json(photo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a route to delete a photo
app.delete('/api/photos/:id', (req, res) => {
  try {
    const photoIndex = photos.findIndex(p => p._id === req.params.id);
    
    if (photoIndex === -1) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    
    // Get the photo to be deleted
    const deletedPhoto = photos[photoIndex];
    
    // Remove the photo from the array
    photos.splice(photoIndex, 1);
    
    // Save the updated photos array
    savePhotosData();
    
    // Try to delete the actual file from uploads directory
    try {
      const filename = deletedPhoto.url.split('/').pop();
      const filePath = path.join(uploadsDir, filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Deleted file: ${filePath}`);
      }
    } catch (fileError) {
      console.error('Error deleting file:', fileError);
      // Continue even if file deletion fails
    }
    
    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Uploads directory: ${uploadsDir}`);
});