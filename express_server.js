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
    dateCreated: '20/2/2023'
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userId: "user2RandomID",
    visitors: [],
    counter: 0,
    uniqueCounter:0,
    dateCreated: '18/2/2023'
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

//*ROUTES*\\

// GET /urls.json
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

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

// GET /urls
app.get("/urls", (req,res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], users, user_id: req.session.user_id, urls: urlDatabase}
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
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], users, user_id: req.session.user_id, urls: urlDatabase}
  const urlID = req.params.id;
  const userId = templateVars.user_id;
  
  //if a URL for the given ID does not exist:
  if(!urlDatabase[urlID]){
    return res.status(400).send('ERROR: This Url does not exist');
  }
  //if user is not logged in
  if (!userId) {
    return res.render('urls_message', templateVars);
  }
  //if user is logged it but does not own the URL with the given ID:
  if ((userId) && urlDatabase[urlID].userId !== userId) {
    return res.status(400).send('ERROR: You are not the owner of this Url');
  }
  //if user is logged in and owns the URL for the given ID:
  if ((userId) && urlDatabase[urlID].userId === userId) {
    res.render("urls_show", templateVars);
  } else {
    return res.status(400).send('ERROR: You do not have access to this Url');
  }
});

//GET /u/:id (Redirect any request to "/u/:id" to its longURL)
app.get("/u/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], users, user_id: req.session.user_id, urls: urlDatabase}
  const urlID = req.params.id;
  const userId = templateVars.user_id;
  const longURL = urlDatabase[req.params.id].longURL;

  //keep track of how many times a given short URL is visited 
  urlDatabase[urlID].counter++

  //keep track of how many UNIQUE visitors visit each url
  const date = new Date().toString();
  if(!req.session.uniqueVisitorId){
    req.session.uniqueVisitorId = generateRandomString();
    urlDatabase[urlID].uniqueCounter++;
  }
  
  //keep track of every visit (timestamp, and a generated visitor_id) and display the list on the URL edit page
  const newVisitor = {id: req.session.uniqueVisitorId, date:date}
  urlDatabase[urlID].visitors.push(newVisitor)
  console.log(urlDatabase)

  //if URL for the given ID does not exist:
  if (!urlDatabase[urlID]) {
    return res.status(400).send('ERROR: This Url is not valid');
  }
  //if URL for the given ID exists:
  return res.redirect(longURL);

});

//POST /urls (create a new Url)
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
      dateCreated: `${new Date().getDate()}/${new Date().getMonth()+1}/${new Date().getFullYear()}`
    };
    console.log(urlDatabase, users);
    res.redirect(`/urls/${randomString}`);
    // urlDatabase[randomString][userId] = userId
    // res.status(200).send("ok"); // Respond with 'Ok' (we will replace this)

  }
});

//POST /urls/:id (Edit URL)
app.post("/u/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], users, user_id: req.session.user_id, urls: urlDatabase };
  const urlID = req.params.id;
  const userId = templateVars.user_id;
  const newUrl = req.body.newUrl;

  //if user is not logged in:
  if (!userId) {
    return res.render('urls_message', templateVars);
  }
  //if user is logged in and owns the URL for the given ID:
  if ((userId) && urlDatabase[urlID].userId === userId) {
    urlDatabase[req.params.id].longURL = newUrl;
    res.redirect(`/urls`);
  } 
  //if user is logged it but does not own the URL for the given ID:
  if ((userId) && urlDatabase[urlID].userId !== userId) {
    return res.render('urls_message', templateVars);
  } else {
    return res.status(400).send('You cannot edit this url');
  }

});

//POST /urls/:id (Delete URL)
app.post("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], users, user_id: req.session.user_id, urls: urlDatabase };
  const urlID = req.params.id;
  const userId = templateVars.user_id;

  //if user is not logged in:
  if (!userId) {
    return res.render('urls_message', templateVars);
  }
  //if user is logged in and owns the URL for the given ID:
  if ((userId) && urlDatabase[urlID].userId === userId) {
    delete urlDatabase[urlID];
    return res.redirect(`/urls`);
  }
  //if user is logged it but does not own the URL for the given ID:
  if ((userId) && urlDatabase[urlID].userId !== userId) {
    delete urlDatabase[urlID];
    return res.render('urls_message', templateVars);
  } else {
    return res.status(400).send('You cannot delete this url');
  }
});

//GET /login
app.get("/login", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], users, user_id: req.session.user_id };

  //if user is logged in:
  if (templateVars.user_id) {
    res.redirect('/urls');
  }
  //if user is not logged in:
  res.render("urls_login", templateVars);
});

//get /register and save cookie
app.get("/register", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], users, user_id: req.session.user_id };

  //if user is logged in:
  if (templateVars.user_id) {
    res.redirect('/urls');
  } else {
    res.render("urls_register", templateVars);
  }
});

//post /login and save cookie
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email,users);
  const userId = user.id;
  
  //if email or password are empty:
  if (!userId || !password) {
    return res.status(400).send('ERROR: Please provide Email AND Pasword');
  }
  //if email and password params match an existing user:
  if (bcrypt.compareSync(password,users[userId].password) && users[userId].email === email) {
    req.session.user_id = userId;
    res.redirect("/urls");
  } //if email and password params don't match an existing user:
  else {
    res.status(400).send('ERROR: Your email and password do not match. Please try again.');
  }
});

 //post /register
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password);
  
  //if email or password are empty:
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  
  // If email is already in use
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

//post /logout
app.post("/logout", (req, res) => {
  req.session = null; // destroy the session
  res.clearCookie('session'); // clear the session cookie
  res.redirect('/login');
});

//GET /message
app.get("/message", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], users, user_id: req.session.user_id, urls: urlDatabase };

  res.render('urls_message', templateVars);
});


//Start the server by calling the app.listen() method, passing in the PORT constant as the first argument and a callback function that logs a message to the console when the server is ready to receive requests:
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




