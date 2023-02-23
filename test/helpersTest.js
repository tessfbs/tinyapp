const { assert } = require('chai');

const { getUserByEmail } = require('../helper');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(user.id,expectedUserID)
  });

  it('should return a user object when it is provided with an email that exists in teh the database', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.isObject(user,testUsers[expectedUserID])
  });

  it('should return undefined if we pass in an email that is not in our users database ', function() {
    const user = getUserByEmail("user1234@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.isUndefined(user.id)
  });

});