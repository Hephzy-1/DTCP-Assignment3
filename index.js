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


// //RETREIVE ALL USERS ==> GET /users
// const getAllUsers = function (req, res) {
//   fs.readFile(libraryDBPath, "utf8", (err, users)=> {
//     if (err){
//       console.log(err)
//       res.writeHead(400)
//       res.end("An error occured")
//     }

//     res.end(books);

//   })
// }


// CREATE A BOOK ==> POST: /users

// const createUser = function (req, res) {
//   const body = [];

//   req.on('data', (chunk) => { // data event is fired when the server receives data from the client
//     body.push(chunk); // push each data received to the body array
//   });

//   req.on('end', () => {
//     const parsedBody = Buffer.concat(body).toString(); // concatenate raw data into a single buffer string
//     const newBook = JSON.parse(parsedBody); // parse the buffer string into a JSON object

//     // get ID of last book in the database
//     const lastBook = libraryDB[libraryDB.length - 1];
//     const lastBookId = lastBook.id;
//     newBook.id = lastBookId + 1;

//     //save to db
//     libraryDB.push(newBook);
//     fs.writeFile(libraryDBPath, JSON.stringify(libraryDB), (err) => {
//       if (err) {
//         console.log(err);
//         res.writeHead(500);
//         res.end(JSON.stringify({
//           message: 'Internal Server Error. Could not save book to database.'
//         }));
//       }

//       res.end(JSON.stringify(newBook));
//     });
//   });
// }

// // UPDATE A BOOK ==> PUT: /books
// const updateBook = function (req, res) {
//     const body = [];

//     req.on('data', (chunk) => { // data event is fired when the server receives data from the client
//         body.push(chunk); // push each data received to the body array
//     });

//     req.on('end', () => {
//         const parsedBody = Buffer.concat(body).toString(); // concatenate raw data into a single buffer string
//         const bookToUpdate = JSON.parse(parsedBody); // parse the buffer string into a JSON object

//         // find the book in the database
//         const bookIndex = libraryDB.findIndex((book) => {
//             return book.id === bookToUpdate.id;
//         });

//         // Return 404 if book not found
//         if (bookIndex === -1) {
//             res.writeHead(404);
//             res.end(JSON.stringify({
//                 message: 'Book not found'
//             }));
//             return;
//         }

//         // update the book in the database
//         libraryDB[bookIndex] = {...libraryDB[bookIndex], ...bookToUpdate}; 

//         // save to db
//         fs.writeFile(libraryDBPath, JSON.stringify(libraryDB), (err) => {
//             if (err) {
//                 console.log(err);
//                 res.writeHead(500);
//                 res.end(JSON.stringify({
//                     message: 'Internal Server Error. Could not update book in database.'
//                 }));
//             }

//             res.end(JSON.stringify(bookToUpdate));
//         });
//     });
// }

// // DELETE A BOOK ==> DELETE: /books
// const deleteBook = function (req, res) {
//     const bookId = req.url.split('/')[2];
    
//     // Remove book from database
//     const bookIndex = libraryDB.findIndex((book) => {
//         return book.id === parseInt(bookId);
//     })

//     if (bookIndex === -1) {
//         res.writeHead(404);
//         res.end(JSON.stringify({
//             message: 'Book not found'
//         }));

//         return;
//     }

//     libraryDB.splice(bookIndex, 1); // remove the book from the database using the index

//     // update the db
//     fs.writeFile(libraryDBPath, JSON.stringify(libraryDB), (err) => {
//         if (err) {
//             console.log(err);
//             res.writeHead(500);
//             res.end(JSON.stringify({
//                 message: 'Internal Server Error. Could not delete book from database.'
//             }));
//         }

//         res.end(JSON.stringify({
//             message: 'Book deleted'
//         }));
//     });

// }

// Create server
const server = http.createServer(requestHandler)

server.listen(PORT, hostname, () => {
    libraryDB = JSON.parse(fs.readFileSync(libraryDBPath, 'utf8'));
    console.log(`Server is listening on ${hostname}:${PORT}`)
})