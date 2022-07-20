const request = require('supertest');
const app = require('./app');
const mongoose = require("mongoose");
const user = require("./models/user");
const jwt = require("jsonwebtoken");

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
  // test basic route
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
  // test user signup route
  test("given a visitor, when he creates an account with correct inputs, then it should return 201 status code and {msg : 'user created'}", () => {
    return request(app) 
      .post("/api/auth/signup")
      .send({email: 'moreno.n@hotmail.fr', password: "#Ni58695o", isAdmin: 1})
      .set('Accept', 'application/json')
      .then(response => {
        expect(response.statusCode).toBe(201);
        expect(response.headers["content-type"]).toEqual("application/json; charset=utf-8");
        expect(response.body).toStrictEqual({msg : 'user created'});
      })
  });
  // test user login route
  test("given a user, when he login with correct inputs, then it should return 200 status code and {userId: user._id,token: jwt.sign({userId : user._id},process.env.RANDOM_SECRET_TOKEN,{ expiresIn: '24h'})}", () => {
    return request(app) 
      .post("/api/auth/login")
      .send({email: 'moreno.n@hotmail.fr', password: "#Ni58695o"})
      .set('Accept', 'application/json')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toEqual("application/json; charset=utf-8");
        console.log(response.body);
        expect(response.body).toStrictEqual({
          userId: response.body.userId,
          token: jwt.sign(
              {userId : response.body.userId},
              process.env.RANDOM_SECRET_TOKEN,
              { expiresIn: '24h'}
          ),
          isAdmin: response.body.isAdmin
      });
      })
  });

});