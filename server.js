const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve the uploaded files

// Serve the form.html file
app.get('/form', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'form.html'));
});

// Handle PDF upload and save
app.post('/save-pdf', upload.single('pdf'), (req, res) => {
    const tempPath = req.file.path;
    const targetPath = path.join(__dirname, 'uploads', req.file.originalname);

    fs.rename(tempPath, targetPath, err => {
        if (err) {
            console.error('Failed to save PDF:', err);
            return res.status(500).send('Failed to save PDF');
        }
        res.status(200).json({ message: 'PDF saved successfully', pdfUrl: `/uploads/${req.file.originalname}` });
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
