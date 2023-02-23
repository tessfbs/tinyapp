function lookupObj(obj, key, value){
  for(let id in obj){
    console.log(obj[id][key])
    if(obj[id][key] === value)
    return id
  }
  return false
}


function getUserByEmail(email,database) {
  let user = {}
  for(let id in database){
    if(database[id].email === email){
      user = {id, email, password:database[id].password}
    }
  }
  return user
}


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

function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

module.exports = {lookupObj, getUserByEmail, urlsForUser, generateRandomString}
// const bcrypt = require("bcryptjs");
// const password = "purple-monkey-dinosaur"; // found in the req.body object
// const hashedPassword = bcrypt.hashSync(password, 10);
// console.log(hashedPassword)