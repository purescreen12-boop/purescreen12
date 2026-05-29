import express from 'express';
import multer from 'multer';
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    ListObjectsCommand,
} from '@aws-sdk/client-s3';
import "dotenv/config";

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "af-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const app = express();
const port = process.env.PORT || 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

async function uploadToS3(file) {
    const key = `uploads/${Date.now()}-${file.originalname}`;
    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
    });
    try {
        await s3Client.send(command);
        return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || "af-south-1"}.amazonaws.com/${key}`;
    } catch (err) {
        throw err;
    }
}

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const fileUrl = await uploadToS3(req.file);
        res.json({ message: 'File uploaded successfully', url: fileUrl });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});