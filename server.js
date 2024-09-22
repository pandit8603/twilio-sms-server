const express = require('express');
const cors = require('cors');
const contacts = require('./contacts.json');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

app.use(cors());
app.use(express.json());

let sentMessages = [];

// Get all contacts
app.get('/api/contacts', (req, res) => {
    res.json(contacts);
});

// Get contact by ID
app.get('/api/contacts/:id', (req, res) => {
    const contact = contacts.find(c => c.id == req.params.id);
    if (contact) {
        res.json(contact);
    } else {
        res.status(404).json({ message: "Contact not found" });
    }
});

// Send SMS
app.post('/api/send-message', (req, res) => {
    const { id, message } = req.body;
    const contact = contacts.find(c => c.id == id);

    if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const smsMessage = message.replace('123456', otp.toString());

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);

    client.messages.create({
        body: message,
        from: '+12133220857', // Your Twilio number
        to: contact.phone
    }).then(message => {
        console.log("🚀 ~ app.post ~ message:", message);
        sentMessages.push({
            contact: `${contact.firstName} ${contact.lastName}`,
            time: new Date(),
            otp: otp
        });
        res.json({ message: "SMS sent successfully" });
    }).catch(err => {
        res.status(500).json({ message: "Failed to send SMS", error: err.message });
    });
});

// Get all sent messages
app.get('/api/messages', (req, res) => {
    res.json(sentMessages.sort((a, b) => b.time - a.time));
});

app.listen(3001, () => {
    console.log('Server running on port 3001');
});
