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

// Task 10: Get all books using Promise / Async-Await
public_users.get('/', function (req, res) {
    const getBooks = new Promise((resolve, reject) => {
        if (books) {
            resolve(books);
        } else {
            reject("Unable to retrieve books");
        }
    });

    getBooks
        .then((bookList) => res.status(200).send(JSON.stringify(bookList, null, 4)))
        .catch((error) => res.status(500).json({ message: error }));
});

// Task 11: Get book details based on ISBN using Async-Await with Promises
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;

    const getBookByISBN = () => {
        return new Promise((resolve, reject) => {
            if (books[isbn]) {
                resolve(books[isbn]);
            } else {
                reject("Book not found");
            }
        });
    };

    try {
        const book = await getBookByISBN();
        return res.status(200).send(JSON.stringify(book, null, 4));
    } catch (error) {
        return res.status(404).json({ message: error });
    }
});

// Task 12: Get book details based on author using Promise callbacks
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;

    const getBooksByAuthor = new Promise((resolve, reject) => {
        const bookKeys = Object.keys(books);
        const matchingBooks = [];

        bookKeys.forEach((key) => {
            if (books[key].author.toLowerCase() === author.toLowerCase()) {
                matchingBooks.push({
                    isbn: key,
                    author: books[key].author,
                    title: books[key].title,
                    reviews: books[key].reviews
                });
            }
        });

        if (matchingBooks.length > 0) {
            resolve(matchingBooks);
        } else {
            reject("No books found for this author");
        }
    });

    getBooksByAuthor
        .then((matchingBooks) => res.status(200).send(JSON.stringify(matchingBooks, null, 4)))
        .catch((error) => res.status(404).json({ message: error }));
});

// Task 13: Get book details based on title using Async-Await
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;

    const getBooksByTitle = () => {
        return new Promise((resolve, reject) => {
            const bookKeys = Object.keys(books);
            const matchingBooks = [];

            bookKeys.forEach((key) => {
                if (books[key].title.toLowerCase() === title.toLowerCase()) {
                    matchingBooks.push({
                        isbn: key,
                        author: books[key].author,
                        title: books[key].title,
                        reviews: books[key].reviews
                    });
                }
            });

            if (matchingBooks.length > 0) {
                resolve(matchingBooks);
            } else {
                reject("No books found with this title");
            }
        });
    };

    try {
        const matchingBooks = await getBooksByTitle();
        return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
    } catch (error) {
        return res.status(404).json({ message: error });
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