const request = require('supertest');
const app = require('./app');
const mongoose = require("mongoose");
const user = require("./models/user");

beforeAll(async () => {
  try {
    mongoose.connect(process.env.MONGODB_TEST_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('connected to test db success');
  } catch (error) {
    console.log(error);
    console.error('connected to test db error');
  }
});

afterAll((done) => {
  mongoose.disconnect(done);
});

 // test suite for routes
describe("test / route", () => {
  
  test("it should return a 200 status code when using GET", () => {
    return request(app) 
      .get("/")
      .set('Accept', 'application/json')
      .then(response => {
        expect(response.statusCode).toBe(200);
      });
  });

  test("it should return {msg: 'it works', data: null} when using GET", () => {
    return request(app) 
      .get("/")
      .set('Accept', 'application/json')
      .then(response => {
        expect(response.body).toStrictEqual({msg: 'it works', data: null});
      });
  });

  test("given a visitor, when he creates an account with correct inputs, then it should return 201 status code and {msg : 'user created'}", () => {
    return request(app) 
      .post("/api/auth/signup")
      .send({email: 'yactouat@hotmail.com', password: "my_super_password"})
      .set('Accept', 'application/json')
      .then(response => {
        expect(response.statusCode).toBe(201);
        expect(response.headers["content-type"]).toEqual("application/json; charset=utf-8");
        expect(response.body).toStrictEqual({msg : 'user created'});
      })
  });

});