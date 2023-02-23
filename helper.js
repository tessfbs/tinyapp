function lookupObj(obj, key, value){
  for(let id in obj){
    console.log(obj[id][key])
    if(obj[id][key] === value)
    return id
  }
  return false
}

const users = {
  userRandomID: {
    id: "aJ48lW",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};


function urlsForUser(obj,id){
  let longUrlsByUser = [];
  for(let key in obj){
    if(obj[key].userID === id){
      console.log(obj[key].userID )
      longUrlsByUser.push(obj[key].longURL) 
    }
  }
  return longUrlsByUser
}

console.log(urlsForUser(urlDatabase, "aJ48lW"))
