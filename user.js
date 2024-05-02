const fs = require('fs');
const path = require('path');

const userPath = path.join(__dirname, "db", 'users.json');
let usersDB = []

// Create A User
const createUser = (req, res) => {
  const body = [];

  // Chunks the data
  req.on("data", (chunk) => {
    body.push(chunk);
  });

  req.on("end", () => {
    const parsedBody = Buffer.concat(body).toString();
    const newUser = JSON.parse(parsedBody);

    fs.readFile(userPath, "utf8", (err, data) => {
      if (err) {
        console.log(err)
        res.writeHead(400)
        res.end("An error occured")
      }

      // Read existing users from the file
      const oldUsers = JSON.parse(data)

      // Check if the user already exists
      const existingUser = oldUsers.some(user => user.username === newUser.username && user.email === newUser.email);
      if (existingUser) {
        res.writeHead(400)
        res.end(JSON.stringify({
          message: 'User already exists'
        }))
      } else {
        // Add the new user to the existing users
        if (!Array.isArray(oldUsers)) {
          oldUsers = []
        }
        oldUsers.push(newUser)

        fs.writeFile(userPath, JSON.stringify(oldUsers), (err) => {
          if (err) {
            console.log(err);
            res.writeHead(500);
            res.end(JSON.stringify({
              message: 'Internal Server Error. Could not save book to database.'
            }));
          }

          res.end(JSON.stringify(newUser));
        });
      }
    })
  });
};

// Get All Users
function getAllUsers(req, res) {
  fs.readFile(userPath, "utf8", (err, data) => {
    if (err) {
      console.log(err)
      res.writeHead(400)
      res.end("An error occured")
    }

    res.end(data)
  })
}

// AUTHENTICATE USER
const authUser = (req, res) => {
  const body = [];

  req.on("data", (chunk) => {
    body.push(chunk);
  });

  req.on("end", () => {
    const parsedBody = Buffer.concat(body).toString();
    const auth = JSON.parse(parsedBody);

    fs.readFile(userPath, "utf8", (err, data) => {
      if (err) {
        console.log(err)
        res.writeHead(400)
        res.end("An error occured")
      }

      const usersDB = JSON.parse(data);

      // Find the user in the database
      const user = usersDB.find(
        (user) =>
          user.username === auth.username &&
          user.password === auth.password
      );

      if (!user) {
        res.writeHead(401); // Unauthorized
        res.end(
          JSON.stringify({
            message: "Username or password incorrect",
          })
        );
        return;
      }

      

      res.writeHead(200); // OK
      res.end(
        JSON.stringify({
          message: "Successful",
          user: user,
        })
      );
    });
  });
};

module.exports = {
  getAllUsers,
  createUser,
  authUser
}