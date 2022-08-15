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
        expect(response.body).toStrictEqual({ msg: 'it works', data: null });
      });
  });
  // test user signup route
  test("given a visitor, when he creates an account with correct inputs, then it should return 201 status code and {msg : 'user created'}", () => {
    return request(app)
      .post("/api/auth/signup")
      .send({ email: 'moreno.n@hotmail.fr', userName: 'Nicolas', password: "#Ni58695o", isAdmin: true })
      .set('Accept', 'application/json')
      .then(response => {
        expect(response.statusCode).toBe(201);
        expect(response.headers["content-type"]).toEqual("application/json; charset=utf-8");
        expect(response.body).toStrictEqual({ msg: 'user created' });
      })
  });
  // test user login route
  test("given an admin user, when he logs in with correct inputs, then it should return a 200 status code and response body `isAdmin` should be true", () => {
    return request(app)
      .post("/api/auth/login")
      .send({ email: 'moreno.n@hotmail.fr', password: "#Ni58695o" })
      .set('Accept', 'application/json')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toEqual("application/json; charset=utf-8");
        expect(response.body.isAdmin).toBe(true);
        userLoginResponseBody = response.body;
      })
  });

  test("given an existing user, when he creates a post without a picture, then it should return a 201 status code and the expected payload", async () => {
    return request(app)
      .post("/api/posts")
      .set('Authorization', 'Bearer ' + userLoginResponseBody.token)
      .set('Accept', 'application/json')
      .send({
        userId: userLoginResponseBody.userId,
        content: "test post"
      })
      .then(response => {
        expect(response.statusCode).toBe(201);
        expect(response.headers["content-type"]).toEqual("application/json; charset=utf-8");
        expect(response.body.msg).toStrictEqual("Post créé");
        expect(response.body.success).toBeTruthy();
        expect(response.body.data.content).toStrictEqual("test post");
        testPostId = response.body._id
      })
  });
  test("given an existing user, when he delete a post created by himself a post without a picture, then it should return a 201 status code and the expected payload", async () => {
    return request(app)
      .delete("/api/posts:id")
      .set('Authorization', 'Bearer ' + userLoginResponseBody.token)
      .set('Accept', 'application/json')
      .query({id : testPostId})
      .then(response => {
        expect(response.statusCode).toBe(201);
        expect(response.headers["content-type"]).toEqual("application/json; charset=utf-8");
        expect(response.body.msg).toStrictEqual("Post supprimé");
        expect(response.body.success).toBeTruthy();
      })
  });

  // test("given an existing user, when he creates a post with a picture, then it should return a 201 status code and the expected payload", async () => {
  //   return request(app)
  //     .post("/api/posts")
  //     .set('Authorization', 'Bearer ' + userLoginResponseBody.token)
  //     .set('Accept', 'multipart/form-data')
  //     // TODO send form data with supertest ./test.png https://stackoverflow.com/questions/52359964/how-to-send-a-formdata-object-with-supertest
  //     .attach('testPic', test.png)
  //     .then(response => {
  //       expect(response.statusCode).toBe(201);
  //       expect(response.headers["content-type"]).toEqual("application/json; charset=utf-8");
  //       expect(response.body).toStrictEqual({
  //         data: posts,
  //         msg: "Post créé",
  //         success: true
  //       });
  //     })
  // });

  test('given a user with a fake JWT token, when he creates a post, then it should return a 401 status code and the expected response payload', async () => {
    return request(app)
      .post("/api/posts")
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwiY29udGVudCI6IllPTE8gSSdtIGEgaGFja2VyIn0.mNt9fPfJ3OGVg2fpRkDdzBCm7J_M-ZeOPwP4Rd9Lxmw')
      .set('Accept', 'application/json')
      .send({
        userId: userLoginResponseBody.userId,
        content: "test post"
      })
      .then(response => {
        expect(response.statusCode).toBe(401);
        expect(response.headers["content-type"]).toEqual("application/json; charset=utf-8");
        expect(response.body).toStrictEqual({
          data: null,
          msg: "Utilisateur non valide",
          success: false
        });
      });
  });

  test("creating test post for get all posts test", async () => {
    return request(app)
      .post("/api/posts")
      .set('Authorization', 'Bearer ' + userLoginResponseBody.token)
      .set('Accept', 'application/json')
      .send({
        userId: userLoginResponseBody.userId,
        content: "test post1"
      })
      .then(response => {
        expect(response.statusCode).toBe(201);
        expect(response.headers["content-type"]).toEqual("application/json; charset=utf-8");
        expect(response.body.msg).toStrictEqual("Post créé");
        expect(response.body.success).toBeTruthy();
        expect(response.body.data.content).toStrictEqual("test post1");
        postIdtest1 = response.body._id
        postTestContent1 = response.body.content
      })
  });

  test("creating test post for get all posts test", async () => {
    return request(app)
      .post("/api/posts")
      .set('Authorization', 'Bearer ' + userLoginResponseBody.token)
      .set('Accept', 'application/json')
      .send({
        userId: userLoginResponseBody.userId,
        content: "test post2"
      })
      .then(response => {
        expect(response.statusCode).toBe(201);
        expect(response.headers["content-type"]).toEqual("application/json; charset=utf-8");
        expect(response.body.msg).toStrictEqual("Post créé");
        expect(response.body.success).toBeTruthy();
        expect(response.body.data.content).toStrictEqual("test post2");
        postIdtest2 = response.body._id
        postTestContent2 = response.body.content
      })
  });

  // test("given an existing user, when he open lobby page, then it should return a 200 status code an object with all the posts", async () => {
  //   // TODO create 2 posts beforehand

  //   // TODO get the ids of the posts created

  //   // TODO define what the expected response should be
  //   const expected = {
  //     data: [
  //       {
  //         _id: postIdtest1,// TODO from actual posts you created
  //         // other fields
  //         content: postTestContent1
  //       },
  //       {
  //         _id: postIdtest2, // TODO from actual posts you created
  //         // other fields
  //         content : postTestContent2
  //       }
  //     ],
  //     msg: "posts fetched",
  //     success: true
  //   }
  //   return request(app)
  //     .get("/api/posts")
  //     .set('Authorization', 'Bearer ' + userLoginResponseBody.token)
  //     .set('Accept', 'application/json')
  //     .then(response => {
  //       expect(response.statusCode).toBe(200);
  //       expect(response.headers["content-type"]).toEqual("application/json; charset=utf-8");
  //       expect(response.body).toStrictEqual(expected);
  //     })
  //   // TODO here or later or in the after each method => delete the created posts
  // });


  test("given an existing user, when he sends a request to delete his account, then it should return a 200 status code and payload {msg: 'Utilisateur supprimé'}", async () => {
    return request(app)
      .post("/api/auth/delete")
      .send({ userId: userLoginResponseBody.userId })
      .set('Authorization', 'Bearer ' + userLoginResponseBody.token)
      .set('Accept', 'application/json')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toEqual("application/json; charset=utf-8");
        expect(response.body.msg).toStrictEqual('Utilisateur supprimé');
      })
  });

});