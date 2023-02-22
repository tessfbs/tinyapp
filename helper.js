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
console.log(lookupObj(users, "email", "user2@example.com"))
