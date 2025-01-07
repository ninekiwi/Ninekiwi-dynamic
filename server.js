// const express = require('express');
const express = require('express');  
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Import Gemini SDK

const app = express();
const port = process.env.PORT || 3000;

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Middleware to parse JSON
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Gemini AI Configuration
const genAI = new GoogleGenerativeAI("AIzaSyARtwMOt8j822f7a6_M3yoMtoEZ6TGcNeQ"); // Replace with your API key

// Serve the form.html file
app.get('/form', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'form.html'));
});

// Handle form data and generate AI response
app.post('/generate-report', async (req, res) => {
    try {
        const formData = req.body;
        
        // Prepare input for the Gemini API
        const prompt = `Generate a detailed summary report based on the following data:\n${JSON.stringify(formData)}`;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);

        // Extract text response from Gemini
        const reportText = result.response.text();

        // Generate PDF using jsPDF
        const { jsPDF } = require('jspdf');
        const doc = new jsPDF();
        doc.text(reportText, 10, 10);

        // Send PDF to the client
        const pdfBuffer = doc.output();
        res.setHeader('Content-Type', 'application/pdf');
        res.send(Buffer.from(pdfBuffer));

    } catch (error) {
        console.error('Error processing Gemini API:', error);
        res.status(500).send('Failed to generate report');
    }
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
