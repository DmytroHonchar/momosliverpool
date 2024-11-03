// server/server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const cors = require('cors');
const helmet = require('helmet');


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(express.json()); // For parsing application/json
app.use(cors());
app.use(helmet());

// Serve static files from public and src folders
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/src', express.static(path.join(__dirname, '..', 'src')));

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'", 'https://www.google.com', 'https://maps.googleapis.com'],
            scriptSrc: ["'self'", 'https://maps.googleapis.com'],
            frameSrc: ["'self'", 'https://www.google.com', 'https://maps.googleapis.com', 'https://www.google.com/maps/embed/'],
            imgSrc: ["'self'", 'https://maps.gstatic.com', 'https://maps.googleapis.com'],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://maps.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        },
    })
);

// Nodemailer configuration
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Contact form endpoint
app.post('/contact', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).send('All fields are required');
    }

    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        replyTo: email,
        subject: 'New Contact Form Submission',
        text: `You have a new message from ${name} (${email}):\n\n${message}`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
});


// Serve HTML files
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'home.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'about.html')));
app.get('/menu', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'menu.html')));
app.get('/delivery', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'delivery.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'contact.html')));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
