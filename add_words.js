const fs = require('fs');
// server.js
const express = require('express');
const app = express();

// Middleware to parse URL-encoded data from HTML forms
app.use(express.urlencoded({ extended: true }));

// Route to handle the form submission
app.post('/submit-data', (req, res) => {
    const name = req.body.userName; // 'userName' matches the name attribute in HTML
    console.log("Received Name:", name);
    res.send(`Data received: ${name}`);
});

app.listen(3000, () => console.log('Server running at http://localhost:3000'));

const content = '"word",';

fs.writeFile('words.js', content, 'utf8', (err) => {
});
