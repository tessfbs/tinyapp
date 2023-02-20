const express = require("express");

const app = express(); //creates a new Express application that can be used to handle incoming requests and generate responses

const PORT = 8080; // default port 8080, which holds the port number on which the server will listen

//Define an object urlDatabase which maps short URLs to their corresponding full URLs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

//Start the server by calling the app.listen() method, passing in the PORT constant as the first argument and a callback function that logs a message to the console when the server is ready to receive requests:
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});