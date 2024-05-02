const http = require('http');
const fs = require('fs');
const path = require('path');
const { createUser, getAllUsers, authUser } = require('./user');
const { createBook, getAllBooks, updateBook, loanBook, returnBook, deleteBook } = require('./books');


const libraryDBPath = path.join(__dirname, "db", 'library.json');
let libraryDB = [];

const PORT = 3000
const hostname = '0.0.0.0';

const requestHandler = function (req, res) {

  res.setHeader("Content-Type", "application/json");

  if (req.url === '/user/create' && req.method === 'POST') {
    createUser(req, res);
  } else if (req.url === '/user/get' && req.method === 'GET') {
    getAllUsers(req, res);
  } else if (req.url === '/user/auth' && req.method === 'POST') {
    authUser(req, res);
  } else if (req.url === '/book/create' && req.method === 'POST') {
    createBook(req, res);
  }  else if (req.url === '/book/get' && req.method === 'GET') {
    getAllBooks(req, res)
  } else if (req.url === '/book/update' && req.method === 'PUT') {
    updateBook(req, res)
  } else if (req.url === "/book/loan" && (req.method === "POST" || req.method === "PUT")) {
    loanBook(req, res);
  } else if (req.url === "/book/return" && req.method === "POST") {
    returnBook(req, res);
  } else if (req.url.startsWith('/book') && req.method === 'DELETE') {
    deleteBook(req, res);
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({
        message: 'Method Not Supported'
    }));
  }

}

// Create server
const server = http.createServer(requestHandler)

server.listen(PORT, hostname, () => {
    libraryDB = JSON.parse(fs.readFileSync(libraryDBPath, 'utf8'));
    console.log(`Server is listening on http://${hostname}:${PORT}`)
})