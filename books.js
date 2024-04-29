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

      const oldBooks = JSON.parse(data)
      const allBooks = [...oldBooks, newBook]

      fs.writeFile(libraryPath, JSON.stringify(allBooks), (err) => {
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
        res.end("Update successfull!");
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

    // find the book in the database
    const bookIndex = libraryDB.findIndex((book) => {
      return book.id === loanDetails.bookId;
    });

    // Return 404 if book not found
    if (bookIndex === -1) {
      res.writeHead(404);
      res.end(
        JSON.stringify({
          message: "Book not found",
        })
      );
      return;
    }
    // Check if the book is already loaned out
    if (libraryDB[bookIndex].isLoanedOut) {
      res.writeHead(400);
      res.end(
        JSON.stringify({
          message: "Book is already loaned out",
        })
      );
      return;
    }

    // update the book in the database
    libraryDB[bookIndex].isLoanedOut = true;
    libraryDB[bookIndex].loanee = loanDetails.loanee;

    // save to db
    fs.writeFile(libraryPath, JSON.stringify(libraryDB), (err) => {
      if (err) {
        console.log(err);
        res.writeHead(500);
        res.end(
          JSON.stringify({
            message:
              "Internal Server Error. Could not loan out book in database.",
          })
        );
      }

      res.end(JSON.stringify(libraryDB[bookIndex]));
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

    // find the book in the database
    const bookIndex = libraryDB.findIndex((book) => {
      return book.id === returnDetails.bookId;
    });

    // Return 404 if book not found
    if (bookIndex === -1) {
      res.writeHead(404);
      res.end(
        JSON.stringify({
          message: "Book not found",
        })
      );
      return;
    }

    // Check if the book is actually loaned out
    if (!libraryDB[bookIndex].isLoanedOut) {
      res.writeHead(400); // Bad Request
      res.end(
        JSON.stringify({
          message: "The book is not currently loaned out",
        })
      );
      return;
    }

    // Update the book in the database to mark it as returned
    libraryDB[bookIndex].isLoanedOut = false;
    libraryDB[bookIndex].loanee = "";
    libraryDB[bookIndex].loanDate = "";

    // Save to database
    fs.writeFile(libraryPath, JSON.stringify(libraryDB), (err) => {
      if (err) {
        console.log(err);
        res.writeHead(500);
        res.end(
          JSON.stringify({
            message:
              "Internal Server Error. Could not update book in database.",
          })
        );
      }

      res.end(JSON.stringify(libraryDB[bookIndex]));
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
        res.end("Deletion successfull!");
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