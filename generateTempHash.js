// Import the bcryptjs library
const bcrypt = require("bcryptjs");

// Define your password
const password = "password123";

// Generate a bcrypt hash for the password
const saltRounds = 9; // Salt rounds determine the strength of the hash
const hash = bcrypt.hashSync(password, bcrypt.genSaltSync(9));
console.log(hash);
