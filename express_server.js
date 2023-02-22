const cookieParser = require('cookie-parser')

const express = require("express");

const app = express(); //creates a new Express application that can be used to handle incoming requests and generate responses

const PORT = 8080; // default port 8080, which holds the port number on which the server will listen

app.set("view engine", "ejs"); //tells the Express app to use EJS as its templating engine

//Define an object urlDatabase which maps short URLs to their corresponding full URLs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//tells the Express app to parse incoming requests with urlencoded payloads and expose the resulting object on req.body.
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser())


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req,res) => { 
  const templateVars = {urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index",templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  console.log("hello")
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
//response when the form is submitted
app.post("/urls", (req, res) => {
  const randomString = generateRandomString()
  urlDatabase[randomString] = req.body.longURL;
  // console.log(urlDatabase)
  // console.log(req.body); // Log the POST request body to the console
  res.redirect(`/urls/${randomString}`)
  // res.status(200).send("ok"); // Respond with 'Ok' (we will replace this)
});

//Redirect any request to "/u/:id" to its longURL
app.get("/u/:id", (req, res) => {
  console.log(urlDatabase[req.params.id])
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//delete an url
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  // console.log(req.params.id)
  res.redirect(`/urls`)
})

//update URL
app.post("/u/:id/update", (req, res) => {
  const newUrl = req.body.newUrl
  urlDatabase[req.params.id] = newUrl;
  res.redirect(`/urls/${req.params.id}`)
})

//post /login and save cookie
app.post("/login", (req, res) => {
  const cookieName = req.body.username
  res.cookie('username', cookieName)
  res.redirect("/urls")
})

//post /logout
app.post("/logout", (req, res) => {
  res.clearCookie('username')
  res.redirect("/urls")
})



//Start the server by calling the app.listen() method, passing in the PORT constant as the first argument and a callback function that logs a message to the console when the server is ready to receive requests:
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});