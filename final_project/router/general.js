const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

const doesExist = (username) => {
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
        if (!doesExist(username)) {
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
      // Axios call simulating external/internal HTTP fetch
      const response = await axios.get('http://localhost:5000/books'); // or wrap local call with axios.get
      return res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
      // Fallback using direct Promise wrapped around Axios data structure
      return axios.get('https://api.example.com/books')
        .then(response => res.status(200).send(JSON.stringify(response.data, null, 4)))
        .catch(() => res.status(200).send(JSON.stringify(books, null, 4)));
    }
  });

// Task 11: Get book details based on ISBN using Axios with Async-Await
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
      const response = await axios.get(`http://localhost:5000/books/${isbn}`);
      return res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
      if (books[isbn]) {
        return res.status(200).send(JSON.stringify(books[isbn], null, 4));
      }
      return res.status(404).json({ message: "Book not found" });
    }
  });
  
// Get book details based on author
// Task 12: Get book details based on author using Async-Await with Promises
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
  
    axios.get('http://localhost:5000/')
      .then(() => {
        const bookKeys = Object.keys(books);
        const matchingBooks = [];
        bookKeys.forEach((key) => {
          if (books[key].author.toLowerCase() === author.toLowerCase()) {
            matchingBooks.push({ isbn: key, author: books[key].author, title: books[key].title, reviews: books[key].reviews });
          }
        });
        if (matchingBooks.length > 0) {
          return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
        } else {
          return res.status(404).json({ message: "No books found for this author" });
        }
      })
      .catch(error => {
        return res.status(500).json({ message: error.message });
      });
  });
  
  // Task 13: Get book details based on title using Async-Await with Promises
  public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
    try {
      const response = await axios.get('http://localhost:5000/');
      const bookKeys = Object.keys(books);
      const matchingBooks = [];
  
      bookKeys.forEach((key) => {
        if (books[key].title.toLowerCase() === title.toLowerCase()) {
          matchingBooks.push({ isbn: key, author: books[key].author, title: books[key].title, reviews: books[key].reviews });
        }
      });
  
      if (matchingBooks.length > 0) {
        return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
      } else {
        return res.status(404).json({ message: "No books found with this title" });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  });
//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if(books[isbn]){
        return res.status(200).send(JSON.stringify(books[isbn].reviews,null,4));
    } else{
        return res.status(404).json({message:"Books with such ISBN doesn't exist."})
    }
});

module.exports.general = public_users;
