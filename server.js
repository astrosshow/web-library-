import express from 'express';
import multer from 'multer';
import path from 'path';
import cors from 'cors';
import mongoose from 'mongoose';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Resolve __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection
const mongoURI = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority`;
mongoose.connect(mongoURI).then(() => console.log('Connected to MongoDB'));

const pdfSchema = new mongoose.Schema({
    title: String,
    s3Key: String,
    s3Url: String,
    uploadDate: { type: Date, default: Date.now }
});

const PDF = mongoose.model('PDF', pdfSchema);

// AWS S3 connection
const s3 = new S3Client({
    region: process.env.AWS_REGION,
});

const uploadToS3 = async (file) => {
    const s3Params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: `${uuidv4()}_${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    try {
        const command = new PutObjectCommand(s3Params);
        await s3.send(command);

        return {
            Key: s3Params.Key,
            Location: `https://${s3Params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Params.Key}`
        };
    } catch (error) {
        console.error('Error uploading to S3:', error);
        throw error;
    }
};

// CORS middleware to pass access control check
app.use(cors({
    origin: 'http://localhost:63342', // Allow 63342 origin
    methods: ['GET', 'POST'], // Specify allowed methods
    allowedHeaders: ['Content-Type', 'x-ijt'] // Allow specific headers
}));

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from the uploads folder
app.use('/uploads', express.static('uploads'));

// Serve node_modules to the frontend
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

// Set up multer storage configuration for storing files
const storage = multer.memoryStorage();
const upload = multer({
    storage
});

// Handles HTTP POST request for PDF uploads
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send("Invalid media type");
    }

    try {
        const s3Response = await uploadToS3(req.file);
        const newPDF = new PDF({
            title: req.file.originalname.replace('.pdf', ''),
            s3Key: s3Response.Key,
            s3Url: s3Response.Location
        });

        await newPDF.save();
        res.json({ message: "Upload Successful", filePath: s3Response.Location });
    } catch (error) {
        console.error('Error during file upload:', error);
        res.status(500).send('Failed to upload PDF file');
    }
});

// Fetch all PDFs from the database
app.get('/pdfs', async (req, res) => {
    try {
        const pdfs = await PDF.find();
        res.json(pdfs);
    } catch (error) {
        res.status(500).send('Failed to fetch PDFs');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});
