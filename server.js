const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

// CORS middleware to pass access control check
app.use(cors({
    origin: 'http://localhost:63342', // Allow 63342 origin
    methods: ['Get', 'POST'], // Specify allowed methods
    allowedHeaders: ['Content-Type', 'x-ijt'] // Allow specific headers
}));

app.use(express.static(path.join(__dirname, 'public')));

// Set up multer storage configuration for storing files

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const datestamp = Date.now();
        cb(null, file.originalname + '_' + datestamp + '.pdf');
    }
})

// Filter uploaded media to ensure they're PDFs
const filter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Not a valid PDF file'), false);
    }
}

const upload = multer({storage, fileFilter: filter});

/**
 * Serve static frontend files
 * .use() request files from folder 'public'
 */
app.use('/uploads', express.static('uploads'));

// Handles HTTP POST request for PDF uploads
app.post('/upload', upload.single('file'), (req, res) => {
    if (req.file) {
        res.json({ message: "Upload Successful", filePath: `/uploads/${req.file.filename}` })
    } else {
        res.status(400).send("Invalid media type");
    }
})

// Start the server
app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
})