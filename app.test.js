const request = require('supertest');
const app = require('./app');
const mongoose = require("mongoose");

beforeAll(async () => {
  try {
    mongoose.connect("mongodb://root:example@localhost:27017/" , {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('connected to test db success');
    mongoose.connection.useDb("jest-test");
  } catch (error) {
    console.log(err);
    console.error('connected to test db error');
  }
});

afterAll((done) => {
    mongoose.disconnect(done);
});

describe("test / route", () => {
  
  test("it should return a 200 status code when using GET", () => {
    return request(app) 
      .get("/")
      .then(response => {
        expect(response.statusCode).toBe(200);
      });
  });

  test("it should return {msg: 'it works', data: null} when using GET", () => {
    return request(app) 
      .get("/")
      .then(response => {
        expect(response.body).toStrictEqual({msg: 'it works', data: null});
      });
  });

});