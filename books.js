const fs = require('fs');
const path = require('path');

const libraryPath = path.join(__dirname, "db", 'library.json');
const libraryDB = []

// CREATE/REGISTER A BOOK
const createBook = (req, res) => {
  const body = [];

  req.on("data", (chunk) => {
    body.push(chunk);
  });

  req.on("end", () => {
    const parsedBody = Buffer.concat(body).toString();
    const newBook = JSON.parse(parsedBody);
  
    fs.readFile(libraryPath, "utf8", (err, data) => {
      if (err) {
        console.log(err)
        res.writeHead(400)
        res.end("An error occured")
      }
  
      let oldBooks = JSON.parse(data)
      if (!Array.isArray(oldBooks)) {
        oldBooks = []
      }
      oldBooks.push(newBook) // Add the new book to the oldBooks array
  
      fs.writeFile(libraryPath, JSON.stringify(oldBooks), (err) => { // Write back to the same file
        if (err) {
          console.log(err);
          res.writeHead(500);
          res.end(JSON.stringify({
            message: 'Internal Server Error. Could not save book to database.'
          }));
        }
  
        res.end(JSON.stringify(newBook));
      });
  
    })
  });
};

// Get All Books
function getAllBooks(req, res) {
  fs.readFile(libraryPath, "utf8", (err, data) => {
    if (err) {
      console.log(err)
      res.writeHead(400)
      res.end("An error occured")
    }

    res.end(data)
  })
}

// Update Book
function updateBook(req, res) {
  const library = []

  req.on("data", (chunk) => {
    library.push(chunk)
  })

  req.on("end", () => {
    const parsedBook = Buffer.concat(library).toString()
    const detailsToUpdate = JSON.parse(parsedBook)
    const bookId = detailsToUpdate.id

    fs.readFile(libraryPath, "utf8", (err, library) => {
      if (err) {
        console.log(err)
        res.writeHead(400)
        res.end("An error occured")
      }

      const booksObj = JSON.parse(library)

      const bookIndex = booksObj.findIndex(book => book.id === bookId)

      if (bookIndex === -1) {
        res.writeHead(404)
        res.end("Book with the specified id not found!")
        return
      }

      const updatedBook = { ...booksObj[bookIndex], ...detailsToUpdate }
      booksObj[bookIndex] = updatedBook

      fs.writeFile(libraryPath, JSON.stringify(booksObj), (err) => {
        if (err) {
          console.log(err);
          res.writeHead(500);
          res.end(JSON.stringify({
            message: 'Internal Server Error. Could not save Book to database.'
          }));
        }

        res.writeHead(200)
        res.end("Update successful!");
      });

    })

  })
}

// Loan Book
const loanBook = (req, res) => {
  const body = [];

  req.on("data", (chunk) => {
    body.push(chunk);
  });

  req.on("end", () => {
    const parsedBody = Buffer.concat(body).toString();
    const loanDetails = JSON.parse(parsedBody);

    fs.readFile(libraryPath, "utf8", (err, data) => {
      if (err) {
        console.log(err);
        res.writeHead(400);
        res.end("An error occurred");
      }

      let oldBooks = JSON.parse(data);
      if (!Array.isArray(oldBooks)) {
        oldBooks = []; // Initialize an empty array if oldBooks is not an array
      }

      console.log(`Searching for book with id ${loanDetails.bookId} in`, oldBooks);

      const bookIndex = oldBooks.findIndex((book) => book.id === parseInt(loanDetails.bookId, 10));

      if (bookIndex === -1) {
        res.writeHead(404);
        res.end(JSON.stringify({ message: "Book not found" }));
        return;
      }

      if (oldBooks[bookIndex].isLoanedOut) {
        res.writeHead(400);
        res.end(JSON.stringify({ message: "Book is already loaned out" }));
        return;
      }

      oldBooks[bookIndex].isLoanedOut = true;
      oldBooks[bookIndex].loanee = loanDetails.loanee;

      fs.writeFile(libraryPath, JSON.stringify(oldBooks), (err) => {
        if (err) {
          console.log(err);
          res.writeHead(500);
          res.end(
            JSON.stringify({
              message: "Internal Server Error. Could not loan out book in database.",
            })
          );
        }

        res.end(JSON.stringify({ message: "Book loaned out successfully" }));
      });
    });
  });
};

// Return Book
const returnBook = (req, res) => {
  const body = [];

  req.on("data", (chunk) => {
    body.push(chunk);
  });

  req.on("end", () => {
    const parsedBody = Buffer.concat(body).toString();
    const returnDetails = JSON.parse(parsedBody);

    fs.readFile(libraryPath, "utf8", (err, data) => {
      if (err) {
        console.log(err);
        res.writeHead(400);
        res.end("An error occurred");
      }

      let oldBooks = JSON.parse(data);
      if (!Array.isArray(oldBooks)) {
        oldBooks = []; // Initialize an empty array if oldBooks is not an array
      }

      const bookIndex = oldBooks.findIndex((book) => book.id === returnDetails.bookId);

      if (bookIndex === -1) {
        res.writeHead(404);
        res.end(JSON.stringify({ message: "Book not found" }));
        return;
      }

      if (!oldBooks[bookIndex].isLoanedOut) {
        res.writeHead(400);
        res.end(JSON.stringify({ message: "Book is not loaned out" }));
        return;
      }

      oldBooks[bookIndex].isLoanedOut = false;
      oldBooks[bookIndex].loanee = "";

      fs.writeFile(libraryPath, JSON.stringify(oldBooks), (err) => {
        if (err) {
          console.log(err);
          res.writeHead(500);
          res.end(
            JSON.stringify({
              message: "Internal Server Error. Could not return book to database.",
            })
          );
        }

        res.end(JSON.stringify({ message: "Book returned successfully" }));
      });
    });
  });
};

// Delete Book
function deleteBook(req, res) {
  const library = []

  req.on("data", (chunk) => {
    library.push(chunk)
  })

  req.on("end", () => {
    const parsedBook = Buffer.concat(library).toString()
    const detailsToUpdate = JSON.parse(parsedBook)
    const BookId = detailsToUpdate.id

    fs.readFile(libraryPath, "utf8", (err, library) => {
      if (err) {
        console.log(err)
        res.writeHead(400)
        res.end("An error occured")
      }

      const BooksObj = JSON.parse(library)

      const BookIndex = BooksObj.findIndex(Book => Book.id === BookId)

      if (BookIndex === -1) {
        res.writeHead(404)
        res.end("Book with the specified id not found!")
        return
      }

      // DELETE FUNCTION
      BooksObj.splice(BookIndex, 1)

      fs.writeFile(libraryPath, JSON.stringify(BooksObj), (err) => {
        if (err) {
          console.log(err);
          res.writeHead(500);
          res.end(JSON.stringify({
            message: 'Internal Server Error. Could not save Book to database.'
          }));
        }

        res.writeHead(200)
        res.end("Deletion successful!");
      });

    })

  })
}

module.exports = {
  createBook,
  getAllBooks,
  updateBook,
  loanBook,
  returnBook,
  deleteBook
}