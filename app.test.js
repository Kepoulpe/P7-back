const request = require('supertest');
const app = require('./app');
const mongoose = require("mongoose");
const user = require("./models/user");
const jwt = require("jsonwebtoken");

let userLoginResponseBody;

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
      .send({email: 'moreno.n@hotmail.fr', userName: 'Nicolas', password: "#Ni58695o", isAdmin: true})
      .set('Accept', 'application/json')
      .then(response => {
        expect(response.statusCode).toBe(201);
        expect(response.headers["content-type"]).toEqual("application/json; charset=utf-8");
        expect(response.body).toStrictEqual({msg : 'user created'});
      })
  });
  // test user login route
  test("given an admin user, when he logs in with correct inputs, then it should return a 200 status code and response body `isAdmin` should be true", () => {
    return request(app) 
      .post("/api/auth/login")
      .send({email: 'moreno.n@hotmail.fr', password: "#Ni58695o"})
      .set('Accept', 'application/json')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toEqual("application/json; charset=utf-8");
        expect(response.body.isAdmin).toBe(true);
        userLoginResponseBody = response.body;
      })
  });

  // test for create one post route
  test("given an existing user, when he creates a post, then it should return a 201 status code and {msg: post created}", async () => {
    return request(app) 
      .post("/api/posts")
      .set('Authorization', 'Bearer ' + userLoginResponseBody.token)
      .set('Accept', 'application/json')
      .send({
        userId:  userLoginResponseBody.userId,
        content : "test post"
      })
      .then(response => {
        expect(response.statusCode).toBe(201);
        expect(response.headers["content-type"]).toEqual("application/json; charset=utf-8");
        console.log(response.body);
        expect(response.body).toStrictEqual({
          msg: 'post created'
        });
      })
  });


  test("given an existing user, when he sends a request to delete his account, then it should return a 200 status code and payload {msg: 'Utilisateur supprimé'}", async () => {
    return request(app) 
      .post("/api/auth/delete")
      .send({userId: userLoginResponseBody.userId})
      .set('Authorization', 'Bearer ' + userLoginResponseBody.token)
      .set('Accept', 'application/json')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toEqual("application/json; charset=utf-8");
        expect(response.body.msg).toStrictEqual('Utilisateur supprimé');
      })
  });

});