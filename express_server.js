const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const { Template } = require('ejs');
const express = require("express");
const bcrypt = require("bcryptjs");
const {lookupObj, getUserByEmail, urlsForUser, generateRandomString} = require('./helper')


const app = express(); //creates a new Express application that can be used to handle incoming requests and generate responses

const PORT = 8080; // default port 8080, which holds the port number on which the server will listen

app.set("view engine", "ejs"); //tells the Express app to use EJS as its templating engine

//tells the Express app to parse incoming requests with urlencoded payloads and expose the resulting object on req.body.
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser())

app.use(cookieSession({
  name: 'session',
  keys: ['test'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID",
  },
};

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: "12345",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "54321",
  },
};

//GET /
app.get("/", (req, res) => {
  const templateVars = {urls: urlDatabase, users, user_id: req.session.user_id};
  const userID = templateVars.user_id
  if(userID){
    return res.redirect('/urls')
  } else {
    return res.redirect('/login')
  }
});

// GET /urls.json
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//GET /hello
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// GET /urls
app.get("/urls", (req,res) => { 
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], users, user_id: req.session.user_id, urls: urlDatabase };
  const urlID = req.params.id;
  const userID = templateVars.user_id
  if(userID){
    res.render("urls_index",templateVars);
  } else {
    res.render('urls_message', templateVars)
  }
});

//GET /urls/new
app.get("/urls/new", (req, res) => {
  const templateVars = {urls: urlDatabase, users, user_id: req.session.user_id};
  if(!templateVars.user_id){
    res.redirect('/login')
  } else {
    res.render("urls_new", templateVars);
  }
});

//GET /urls/:id 
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], users, user_id: req.session.user_id, urls: urlDatabase };
  const urlID = req.params.id;
  const userID = templateVars.user_id
  
  if(!userID){
    return res.render('urls_message', templateVars)
  } 
   if((userID) && !urlDatabase[urlID]){
    return res.send('ERROR: This Url is not valid')
  }
  if((userID) && urlDatabase[urlID].userID === userID){
    res.render("urls_show", templateVars);
  }else {
    return res.send('ERROR: You can not edit this Url')
  }
});

//POST /urls
app.post("/urls", (req, res) => {
  let templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], users, user_id: req.session.user_id, urls: urlDatabase };
  const userID = templateVars.user_id

  if(!userID){
    res.render('urls_message',templateVars)
  } else {
    const randomString = generateRandomString()
        urlDatabase[randomString] = {
      longURL: req.body.longURL,
      userID: userID,
    };
    console.log(urlDatabase, users)
    res.redirect(`/urls/${randomString}`)
    // urlDatabase[randomString][userID] = userID
    // res.status(200).send("ok"); // Respond with 'Ok' (we will replace this)

  }
});

//GET /message
app.get("/message", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], users, user_id: req.session.user_id, urls: urlDatabase };

  res.render('urls_message', templateVars)
});
//Redirect any request to "/u/:id" to its longURL
app.get("/u/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], users, user_id: req.session.user_id, urls: urlDatabase };
  const urlID = req.params.id;
  const userID = templateVars.user_id
  const longURL = urlDatabase[req.params.id].longURL;

  if(!userID){
    return res.render('urls_message', templateVars)
  } 
   if((userID) && !urlDatabase[urlID]){
    return res.send('ERROR: This Url is not valid')
  }
  if((userID) && urlDatabase[urlID].userID === userID){
    res.redirect(longURL);
  }else {
    return res.send('ERROR: You can not edit this Url')
  }
});

//delete an url
app.post("/urls/:id/delete", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], users, user_id: req.session.user_id, urls: urlDatabase };
  const urlID = req.params.id;
  const userID = templateVars.user_id
  
  console.log(urlDatabase[urlID].userID)
  console.log(userID)
  if(!userID){
    return res.render('urls_message', templateVars)
  } 
  if((userID) && urlDatabase[urlID].userID === userID){
    delete urlDatabase[urlID]
    return res.redirect(`/urls`)
    } else {
      return res.send('You cannot delete this url')
    }
})

//update URL
app.post("/u/:id/update", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], users, user_id: req.session.user_id, urls: urlDatabase };
  const urlID = req.params.id;
  const userID = templateVars.user_id
  const newUrl = req.body.newUrl

  if(!userID){
    return res.render('urls_message', templateVars)
  } 
  if((userID) && urlDatabase[urlID].userID === userID){
    urlDatabase[req.params.id].longURL = newUrl;
    res.redirect(`/urls/${req.params.id}`)
    } else {
      return res.send('You cannot edit this url')
    }

})

//post /login and save cookie
app.post("/login", (req, res) => {
  const email = req.body.email
  const password = req.body.password
  const user = getUserByEmail(email,users)
  const userId = user.id
  console.log(userId)
  if(!userId){
    return res.status(400).send('Please provide an email AND password')
  }
  if(bcrypt.compareSync(password,users[userId].password) && users[userId].email === email){
    req.session.user_id = userId
    res.redirect("/urls")
  } else {
    res.send('ERROR: Email and/or Pasword do not match')
  }
})

//post /logout
app.post("/logout", (req, res) => {
  req.session = null; // destroy the session
  res.clearCookie('session'); // clear the session cookie
  res.redirect('/login');
})

//get /register
app.get("/register", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], users, user_id: req.session.user_id };
  if(templateVars.user_id){
    res.redirect('/urls')
  } else {
    res.render("urls_register", templateVars);
  }
});

//post /register
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email
  const password = bcrypt.hashSync(req.body.password)
  // console.log(password)
  // Check for empty email or password
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  
  // Check if email is already in use
  const user = getUserByEmail(email,users)
  const emailInUse = user.email
  if(emailInUse){
    return res.status(400).json({ error: 'Email already in use.' });
  }
  else {
    users[id] = {id, email: email, password: password}
    req.session.user_id = id
    console.log(users)
    res.redirect("/urls")
  }

})

//GET /login

app.get("/login", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], users, user_id: req.session.user_id };
  if(templateVars.user_id){
    res.redirect('/urls')
  } else {
  }
  res.render("urls_login", templateVars);
});


//Start the server by calling the app.listen() method, passing in the PORT constant as the first argument and a callback function that logs a message to the console when the server is ready to receive requests:
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




