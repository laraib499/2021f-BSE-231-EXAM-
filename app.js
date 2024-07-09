const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Book model
const Book = mongoose.model('Book', {
  title: String,
  author: String,
  genre: String,
  year: Number
});

// Express middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route to add a book
app.post('/books', async (req, res) => {
  try {
    const newBook = await Book.create(req.body);
    res.status(201).json(newBook);
    sendEmail(newBook);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Route to get all books
app.get('/books', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Function to send email
async function sendEmail(book) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-password'
    }
  });

  let mailOptions = {
    from: 'your-email@gmail.com',
    to: 'recipient-email@example.com',
    subject: 'Book Added to Library',
    text: `The book "${book.title}" by ${book.author} has been added to the library.`
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

// Serve static files
app.use(express.static('public'));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
