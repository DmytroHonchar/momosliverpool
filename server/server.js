// server/server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const cors = require('cors');
const helmet = require('helmet');
const validator = require('validator');
const rateLimit = require('express-rate-limit');


const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

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


// Rate limiting for contact form submissions only
const contactFormLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many submissions from this IP, please try again after 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Serve the contact form page (GET request) without rate limiting
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'contact.html'));
});

// Handle contact form submissions (POST request) with rate limiting
app.post('/contact', contactFormLimiter, async (req, res) => {
    let { name, email, message, phone } = req.body;

    // Honeypot check
    if (phone) {
        console.log('Bot detected through honeypot field.');
        return res.status(400).send('Bot detected. Submission rejected.');
    }

    // Check if all fields are present
    if (!name || !email || !message) {
        return res.status(400).send('All fields are required');
    }

    // Sanitize inputs
    name = validator.escape(name.trim());
    email = validator.normalizeEmail(email.trim());
    message = validator.escape(message.trim());

    // Validate email
    if (!validator.isEmail(email)) {
        return res.status(400).send('Invalid email address');
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        replyTo: email,
        subject: 'New Contact Form Submission',
        text: `You have a new message from ${name} (${email}):\n\n${message}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
});

// Serve other HTML files
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'home.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'about.html')));
app.get('/menu', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'menu.html')));
app.get('/delivery', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'delivery.html')));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));