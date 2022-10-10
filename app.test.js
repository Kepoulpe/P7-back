const request = require('supertest');
const app = require('./app');
const mongoose = require("mongoose");
const path = require("path");


const createOtherUser = async () => {
  // arrange
  // create other user for the test
  await request(app)
    .post("/api/auth/signup")
    .send({ email: 'other@hotmail.fr', userName: 'Yacine', password: "$Ni58695o" })
    .set('Accept', 'application/json');
  // getting a token for the other user
  const otherUserTokenCall = await request(app)
    .post("/api/auth/login")
    .send({ email: 'other@hotmail.fr', password: "$Ni58695o" })
    .set('Accept', 'application/json');
  const otherUserToken = otherUserTokenCall.body.data.token;
  const otherUserId = otherUserTokenCall.body.data.userId;
  return {
    otherUserToken,
    otherUserId
  };
};

const deleteOtherUser = async (otherUserId, otherUserToken) => {
  await request(app)
  .post("/api/auth/delete")
  .send({ userId: otherUserId })
  .set('Authorization', 'Bearer ' + otherUserToken)
  .set('Accept', 'application/json');
};

// this variable will persist an authed user along requests made in tests executed sequentially
let userLoginResponseBody;

beforeAll(() => {
  mongoose.connect(process.env.MONGODB_TEST_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
    .then(() => {
      console.log('connected to test db success');
    })
    .catch(error => {
      console.log(error);
      console.error('connected to test db error');
    });
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
  test("given a visitor, when he creates an account with a correct input, then it should return 201 status code and {msg : 'user created'}", () => {
    return request(app)
      .post("/api/auth/signup")
      .send({ email: 'moreno.n@hotmail.fr', userName: 'Nicolas', password: "#Ni58695o" })
      .set('Accept', 'application/json')
      .then(response => {
        expect(response.statusCode).toBe(201);
        expect(response.headers["content-type"]).toEqual("application/json; charset=utf-8");
        expect(response.body.msg).toStrictEqual('user created');
      })
  });

  // test visitor user login route
  test("given a visitor user, when he logs in with correct inputs, then it should return a 200 status code", () => {
    return request(app)
      .post("/api/auth/login")
      .send({ email: 'moreno.n@hotmail.fr', password: "#Ni58695o" })
      .set('Accept', 'application/json')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toEqual("application/json; charset=utf-8");
        userLoginResponseBody = response.body.data;
      })
  });

  // test for post route
  test("given an existing user, when he creates a post without a picture, then it should return a 201 status code and the expected payload", () => {
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
        testPostId = response.body.data._id;
      })
  });

  // test for put route  
  test("given an existing user, when he modifies a post without a picture in the payload, then it should return a 200 status code and the expected payload", () => {
    return request(app)
      .put("/api/posts/" + testPostId)
      .set('Authorization', 'Bearer ' + userLoginResponseBody.token)
      .set('Accept', 'application/json')
      .send({
        userId: userLoginResponseBody.userId,
        content: "test post modify"
      })
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toEqual("application/json; charset=utf-8");
        expect(response.body.msg).toStrictEqual("Post mis à jour");
        expect(response.body.success).toBeTruthy();
        expect(response.body.data).toBeNull()
      })
  });

  test("given an existing user, when he tries to modify a post without a picture not created by himself, then it should return a 401 status code", async () => {
    const response = await request(app)
      .put("/api/posts/" + testPostId)
      .set('Authorization', 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MzI5ZmYxMjE2YTc0NjJlNmUxNjczZGQiLCJpYXQiOjE2NjM2OTg5MjIsImV4cCI6MTY2Mzc4NTMyMn0.qdrpe2DsXwBs38q8-y_Yb2_LDMDjs7FBdGMXocH24U4')
      .set('Accept', 'application/json')
      .send({
        userId: userLoginResponseBody.userId,
        content: "test modify"
      })
      .then(response => {
        expect(response.statusCode).toBe(401);
      })
  });

  // test for delete route
  test("given an existing user, when he deletes a post not created by himself a post without a picture, then it should return a 403 status code", async () => {
    // arrange
    // create an other user for the test
    const otherUser = await createOtherUser();
    const {otherUserId, otherUserToken} = otherUser;
    // act
    // send a delete request with token from other user to delete another resource
    const deleteCall = await request(app)
      .delete("/api/posts/" + testPostId)
      .set('Authorization', 'Bearer ' + otherUserToken)
      .set('Accept', 'application/json')
    // assert
    expect(deleteCall.statusCode).toBe(403);
    // tear down
    // delete other user
    await deleteOtherUser(otherUserId, otherUserToken);
  });

  test("given an existing user, when he deletes a post created by himself a post without a picture, then it should return a 204 status code", () => {
    return request(app)
      .delete("/api/posts/" + testPostId)
      .set('Authorization', 'Bearer ' + userLoginResponseBody.token)
      .set('Accept', 'application/json')
      .then(response => {
        expect(response.statusCode).toBe(204);
      })
  });
 
  test("given an existing user, when he creates a post with a picture, then it should return a 201 status code and the expected payload", () => {
    return request(app)
      .post("/api/posts")
      .set('Authorization', 'Bearer ' + userLoginResponseBody.token)
      .set('Accept', 'multipart/form-data')
      .field("content", "test content")
      .field("userId", userLoginResponseBody.userId)
      .attach("imageUrl", path.resolve(__dirname, "test.png"))
      .then(response => {
        expect(response.statusCode).toBe(201);
        expect(response.headers["content-type"]).toEqual("application/json; charset=utf-8");
        expect(response.body.msg).toStrictEqual("Post créé");
        expect(response.body.success).toBeTruthy();
        expect(response.body.data.content).toStrictEqual("test content");
        testPostIdWithPic = response.body.data._id
      })
  });

  test("given an existing user, when he deletes a post created by himself a post with a picture, then it should return a 204 status code and the expected payload", async () => {
    const response = await request(app)
      .delete("/api/posts/" + testPostIdWithPic)
      .set('Authorization', 'Bearer ' + userLoginResponseBody.token)
      .set('Accept', 'application/json')
      .then(response => {
        expect(response.statusCode).toBe(204);
      })
  });

  test('given a user, when he tries to create a post on behalf of another user, then it should return a 401 status code and the expected response payload', async () => {
    // arrange
    // create an other user for the test
    const otherUser = await createOtherUser();
    const {otherUserId, otherUserToken} = otherUser;
    // act
    const response = await request(app)
      .post("/api/posts")
      .set('Authorization', 'Bearer ' + otherUserToken)
      .set('Accept', 'application/json')
      .send({
        userId: userLoginResponseBody.userId,
        content: "test post"
      });
    // assert 
    expect(response.statusCode).toBe(401);
    expect(response.headers["content-type"]).toEqual("application/json; charset=utf-8");
    expect(response.body).toStrictEqual({
      data: null,
      msg: "Utilisateur non valide",
      success: false
    });
    // tear down
    await deleteOtherUser(otherUserId, otherUserToken);
  });

  let postTestData1;
  test("creating test post for get all posts test", () => {
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
        postTestData1 = response.body.data
      })
  });

  let postTestData2;
  test("creating test post for get all posts test", () => {
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
        postTestData2 = response.body.data
      })
  });

  test("given an authorized user, when he gets all posts, then it should return a 200 status code and a response containing all posts", () => {
    // define what the expected response should be
    const expected = {
      data: [
        {
          __v: postTestData1.__v,
          _id: postTestData1._id,
          content: postTestData1.content,
          dislikes: postTestData1.dislikes,
          likes: postTestData1.likes,
          userId: postTestData1.userId,
          usersDisliked: postTestData1.usersDisliked,
          usersLiked: postTestData1.usersLiked
        },
        {
          __v: postTestData2.__v,
          _id: postTestData2._id,
          content: postTestData2.content,
          dislikes: postTestData2.dislikes,
          likes: postTestData2.likes,
          userId: postTestData2.userId,
          usersDisliked: postTestData2.usersDisliked,
          usersLiked: postTestData2.usersLiked
        }
      ],
      msg: "posts fetched",
      success: true
    }
    return request(app)
      .get("/api/posts")
      .set('Authorization', 'Bearer ' + userLoginResponseBody.token)
      .set('Accept', 'application/json')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toEqual("application/json; charset=utf-8");
        expect(response.body).toEqual(expected);
      })
  });

  test("given an existing user and an existing post, when he gets this post, then it should return a 200 status code and a response body containing the specific post", () => {
    // define what the expected response should be
    const expected = {
      data:
      {
        __v: postTestData2.__v,
        _id: postTestData2._id,
        content: postTestData2.content,
        dislikes: postTestData2.dislikes,
        likes: postTestData2.likes,
        userId: postTestData2.userId,
        usersDisliked: postTestData2.usersDisliked,
        usersLiked: postTestData2.usersLiked,
      },
      msg: "post fetched",
      success: true
    }
    return request(app)
      .get("/api/posts/" + postTestData2._id)
      .set('Authorization', 'Bearer ' + userLoginResponseBody.token)
      .set('Accept', 'application/json')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toEqual("application/json; charset=utf-8");
        expect(response.body).toStrictEqual(expected);
      })
  });

  test("deleting the first test post created for get all posts test", () => {
    return request(app)
      .delete("/api/posts/" + postTestData1._id)
      .set('Authorization', 'Bearer ' + userLoginResponseBody.token)
      .set('Accept', 'application/json')
      .then(response => {
        expect(response.statusCode).toBe(204);
      })
  });
  
  test("deleting the second test post created for get all posts test", () => {
    return request(app)
      .delete("/api/posts/" + postTestData2._id)
      .set('Authorization', 'Bearer ' + userLoginResponseBody.token)
      .set('Accept', 'application/json')
      .then(response => {
        expect(response.statusCode).toBe(204);
      })
  });

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