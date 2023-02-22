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

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

function lookupObj(obj, key, value){
  for(let id in obj){
    console.log(obj[id][key])
    if(obj[id][key] === value)
    return true
  }
  return false
}

function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function lookupObj(obj, key, value){
  for(let id in obj){
    console.log(obj[id][key])
    if(obj[id][key] === value)
    return id
  }
  return false
}
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
  const templateVars = {urls: urlDatabase, users, user_id: req.cookies["user_id"]};
  res.render("urls_index",templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {urls: urlDatabase, users, user_id: req.cookies["user_id"]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], users, user_id: req.cookies["user_id"] };
    console.log("hello")
    res.render("urls_show", templateVars);

});

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
  const email = req.body.email
  const password = req.body.password
  const userId = lookupObj(users,"email",email)
  console.log(userId)
  if(!userId){
    res.send('ERROR')
  }
  if(users[userId].password === password && users[userId].email === email){
    res.cookie('user_id', userId)
    res.redirect("/urls")
  } else {
    res.send('ERROR')
  }
})

//post /logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect("/login")
})

//get /register
app.get("/register", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], users, user_id: req.cookies["user_id"] };
    res.render("urls_register", templateVars);
});

//post /register
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email
  const password = req.body.password
  console.log(email)
  // // Check for empty email or password
  // if (!email || !password) {
  //   return res.status(400).json({ error: 'Email and password are required.' });
  // }
  
  // // Check if email is already in use
  // const emailInUse = lookupObj(users, "email", email)
  // if(emailInUse){
  //   return res.status(400).json({ error: 'Email already in use.' });
  // }
  // else {
  // }
    users[id] = {id, email: email, password: password}
    res.cookie('user_id', id)
    console.log(users)
    res.redirect("/urls")

})

//GET /login

app.get("/login", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], users, user_id: req.cookies["user_id"] };
    res.render("urls_login", templateVars);
});




//Start the server by calling the app.listen() method, passing in the PORT constant as the first argument and a callback function that logs a message to the console when the server is ready to receive requests:
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

console.log(users)

console.log(users)
console.log(users)
console.log(users)



