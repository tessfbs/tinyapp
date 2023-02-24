//*PACKAGES*\\
const cookieSession = require('cookie-session');
const express = require("express");
const bcrypt = require("bcryptjs");
const {getUserByEmail, generateRandomString} = require('./helper');
const methodOverride = require('method-override');

const app = express(); //creates a new Express application that can be used to handle incoming requests and generate responses

const PORT = 8080; // default port 8080, which holds the port number on which the server will listen

app.set("view engine", "ejs"); //tells the Express app to use EJS as its templating engine

//tells the Express app to parse incoming requests with urlencoded payloads and expose the resulting object on req.body.
app.use(express.urlencoded({ extended: true }));

app.use(methodOverride('X-HTTP-Method-Override'))

app.use(cookieSession({
  name: 'session',
  keys: ['test'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

//*DATABASES*\\
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userId: "aJ48lW",
    visitors: [],
    counter: 0,
    uniqueCounter:0,
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userId: "user2RandomID",
    visitors: [],
    counter: 0,
    uniqueCounter:0,
  },
};

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: bcrypt.hashSync('12345',10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync('54321',10),
  },
};

const UrlsVisitors = [];

//*ROUTES*\\

//GET /
app.get("/", (req, res) => {
  const templateVars = {urls: urlDatabase, users, user_id: req.session.user_id};
  const userId = templateVars.user_id;
  if (userId) {
    return res.redirect('/urls');
  } else {
    return res.redirect('/login');
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
  const userId = templateVars.user_id;
  if (userId) {
    res.render("urls_index",templateVars);
  } else {
    res.render('urls_message', templateVars);
  }
});

//GET /urls/new
app.get("/urls/new", (req, res) => {
  const templateVars = {urls: urlDatabase, users, user_id: req.session.user_id};
  if (!templateVars.user_id) {
    res.redirect('/login');
  } else {
    res.render("urls_new", templateVars);
  }
});

//GET /urls/:id
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], users, user_id: req.session.user_id, urls: urlDatabase, counter:visitors, UrlsVisitors: UrlsVisitors, counterUnique: unique}
  const urlID = req.params.id;
  const userId = templateVars.user_id;
  
  if (!userId) {
    return res.render('urls_message', templateVars);
  }
  if ((userId) && !urlDatabase[urlID]) {
    return res.send('ERROR: This Url is not valid');
  }
  if ((userId) && urlDatabase[urlID].userId === userId) {
    res.render("urls_show", templateVars);
  } else {
    return res.send('ERROR: You can not edit this Url');
  }
});

//POST /urls
app.post("/urls", (req, res) => {
  let templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], users, user_id: req.session.user_id, urls: urlDatabase };
  const userId = templateVars.user_id;

  if (!userId) {
    res.render('urls_message',templateVars);
  } else {
    const randomString = generateRandomString();
    urlDatabase[randomString] = {
      longURL: req.body.longURL,
      userId: userId,
      counter: 0,
      uniqueCounter:0,
      visitors: [],
    };
    console.log(urlDatabase, users);
    res.redirect(`/urls/${randomString}`);
    // urlDatabase[randomString][userId] = userId
    // res.status(200).send("ok"); // Respond with 'Ok' (we will replace this)

  }
});

//GET /message
app.get("/message", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], users, user_id: req.session.user_id, urls: urlDatabase };

  res.render('urls_message', templateVars);
});

//Redirect any request to "/u/:id" to its longURL
let visitors = 0;
let unique = 0;
app.get("/u/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], users, user_id: req.session.user_id, urls: urlDatabase, counter:visitors, UrlsVisitors: UrlsVisitors, counterUnique: unique}
  const urlID = req.params.id;
  const userId = templateVars.user_id;
  const longURL = urlDatabase[req.params.id].longURL;
  urlDatabase[urlID].counter++

  
  const date = new Date().toString();
  if(!req.session.uniqueVisitorId){
    req.session.uniqueVisitorId = generateRandomString();
    urlDatabase[urlID].uniqueCounter++;
    urlDatabase[urlID].visitors = {id: req.session.uniqueVisitorId, date:date};
  }
  
  const newVisitor = {id: req.session.uniqueVisitorId, date:date}
  urlDatabase[urlID].visitors.push(newVisitor)
  console.log(urlDatabase)

  if (!urlDatabase[urlID]) {
    return res.send('ERROR: This Url is not valid');
  }
  return res.redirect(longURL);

});

//delete an url
app.post("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], users, user_id: req.session.user_id, urls: urlDatabase };
  const urlID = req.params.id;
  const userId = templateVars.user_id;
  if (!userId) {
    return res.render('urls_message', templateVars);
  }
  if ((userId) && urlDatabase[urlID].userId === userId) {
    delete urlDatabase[urlID];
    return res.redirect(`/urls`);
  } else {
    return res.send('You cannot delete this url');
  }
});

//update URL
app.post("/u/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], users, user_id: req.session.user_id, urls: urlDatabase };
  const urlID = req.params.id;
  const userId = templateVars.user_id;
  const newUrl = req.body.newUrl;

  if (!userId) {
    return res.render('urls_message', templateVars);
  }
  if ((userId) && urlDatabase[urlID].userId === userId) {
    urlDatabase[req.params.id].longURL = newUrl;
    res.redirect(`/urls`);
  } else {
    return res.send('You cannot edit this url');
  }

});

//GET /login
app.get("/login", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], users, user_id: req.session.user_id };
  if (templateVars.user_id) {
    res.redirect('/urls');
  }
  res.render("urls_login", templateVars);
});

//post /login and save cookie
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email,users);
  const userId = user.id;
  if (!userId) {
    return res.status(400).send('Please provide an email AND password');
  }
  if (bcrypt.compareSync(password,users[userId].password) && users[userId].email === email) {
    req.session.user_id = userId;
    res.redirect("/urls");
  } else {
    res.status(400).send('ERROR: Email and/or Pasword do not match');
  }
});

//post /logout
app.post("/logout", (req, res) => {
  req.session = null; // destroy the session
  res.clearCookie('session'); // clear the session cookie
  res.redirect('/login');
});

//get /register and save cookie
app.get("/register", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], users, user_id: req.session.user_id };
  if (templateVars.user_id) {
    res.redirect('/urls');
  } else {
    res.render("urls_register", templateVars);
  }
});

//post /register
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password);
  // console.log(password)
  // Check for empty email or password
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  
  // Check if email is already in use
  const user = getUserByEmail(email,users);
  const emailInUse = user.email;
  if (emailInUse) {
    return res.status(400).json({ error: 'Email already in use.' });
  } else {
    users[id] = {id, email: email, password: password};
    req.session.user_id = id;
    console.log(users);
    res.redirect("/urls");
  }

});


//Start the server by calling the app.listen() method, passing in the PORT constant as the first argument and a callback function that logs a message to the console when the server is ready to receive requests:
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




