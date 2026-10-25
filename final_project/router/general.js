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
    return userswithsamename.length > 0;
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
public_users.get('/books_internal', function (req, res) {
    return res.status(200).json(books);
});
// Task 10: Get all books using Promise / Async-Await
public_users.get('/', function (req, res) {
    axios.get('http://localhost:5000/books_internal')
        .then((response) => {
            return res.status(200).json(response.data);
        })
        .catch((error) => {
            return res.status(500).json({
                message: "Unable to retrieve books",
                error: error.message
            });
        });
});
// Task 11: Get book details based on ISBN using Async-Await with Promises
public_users.get('/isbn/:isbn', async function (req, res) {
    try {
        const isbn = req.params.isbn;

        const response = await axios.get(
            'http://localhost:5000/books_internal'
        );

        const books = response.data;

        if (books[isbn]) {
            return res.status(200).json(books[isbn]);
        }

        return res.status(404).json({
            message: "Book not found"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Unable to retrieve book details",
            error: error.message
        });
    }
});

// Task 12: Get book details based on author using Promise callbacks
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;

    axios.get('http://localhost:5000/books_internal')
        .then((response) => {
            const books = response.data;

            const matchingBooks = Object.keys(books)
                .filter((isbn) =>
                    books[isbn].author.toLowerCase() === author.toLowerCase()
                )
                .map((isbn) => ({
                    isbn: isbn,
                    author: books[isbn].author,
                    title: books[isbn].title,
                    reviews: books[isbn].reviews
                }));

            if (matchingBooks.length > 0) {
                return res.status(200).json(matchingBooks);
            }

            return res.status(404).json({
                message: "No books found for this author"
            });
        })
        .catch((error) => {
            return res.status(500).json({
                message: "Unable to retrieve books",
                error: error.message
            });
        });
});
// Task 13: Get book details based on title using Async-Await
public_users.get('/title/:title', async function (req, res) {
    try {
        const title = req.params.title;

        const response = await axios.get(
            'http://localhost:5000/books_internal'
        );

        const books = response.data;

        const matchingBooks = Object.keys(books)
            .filter((isbn) =>
                books[isbn].title.toLowerCase() === title.toLowerCase()
            )
            .map((isbn) => ({
                isbn: isbn,
                author: books[isbn].author,
                title: books[isbn].title,
                reviews: books[isbn].reviews
            }));

        if (matchingBooks.length > 0) {
            return res.status(200).json(matchingBooks);
        }

        return res.status(404).json({
            message: "No books found with this title"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Unable to retrieve books",
            error: error.message
        });
    }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
    } else {
        return res.status(404).json({ message: "Books with such ISBN doesn't exist." });
    }
});

module.exports.general = public_users;