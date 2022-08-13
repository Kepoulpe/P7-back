const likeDislikeLogic = require("./likeDislike");
const likeDislikePostLogic = likeDislikeLogic.likeDislikeLogic;


// test suite
describe("testing like/dislike", () => {
    it("given a user who has NOT created a post, when he likes a post, then the likes prop of the post is incremented by 1", () => {
        // arrange
        const expected = {$inc: { likes: 1 }, $push: { usersLiked: ["x"] }, _id: "1234"};
        const testInitialPost = {
            _id: "1234",
            userId: "y", 
            likes: 0, 
            dislikes: 0, 
            usersLiked: [], 
            usersDisliked: [] 
        };
        const testReqPayload = {
            like: 1,
            userId: "x"
        }
        // act
        const actual = likeDislikePostLogic(testInitialPost, testReqPayload);
        // assert
        expect(actual).toEqual(expected);
    });

    it("given a user who has NOT created a post, when he likes a post, then his userId should be pushed to the usersLiked array", () => {
        // arrange
        const expected = {$inc: { likes: 1 }, $push: { usersLiked: ["x"] }, _id: "1234"};
        const testInitialPost = {
            _id: "1234",
            userId: "y", 
            likes: 0, 
            dislikes: 0, 
            usersLiked: [], 
            usersDisliked: [] 
        };
        const testReqPayload = {
            like: 1,
            userId: "x"
        }
        // act
        const actual = likeDislikePostLogic(testInitialPost, testReqPayload);
        // assert
        expect(actual).toEqual(expected);
    });

    it("given a user who has NOT created a post, when he likes a post that he has already liked, then it should return false", () => {
        // arrange
        const expected = false;
        const testInitialPost = {
            _id: "1234",
            userId: "y", 
            likes: 0, 
            dislikes: 0, 
            usersLiked: ["x"], 
            usersDisliked: [] 
        };
        const testReqPayload = {
            like: 1,
            userId: "x"
        }
        // act
        const actual = likeDislikePostLogic(testInitialPost, testReqPayload);
        // assert
        expect(actual).toEqual(expected);
    });

    it("given a user who has NOT created a Post, when he dislikes a Post that he has already disliked, then it should return false", () => {
        // arrange
        const expected = false;
        const testInitialPost = {
            _id: "1234",
            userId: "y", 
            likes: 0, 
            dislikes: 0, 
            usersLiked: [], 
            usersDisliked: ["x"] 
        };
        const testReqPayload = {
            like: -1,
            userId: "y"
        }
        // act
        const actual = likeDislikePostLogic(testInitialPost, testReqPayload);
        // assert
        expect(actual).toEqual(expected);
    });

    it("given a user who has NOT created a Post, when he dislikes a Post, then the dislikes prop of the Post is incremented by 1", () => {
        // arrange
        const expected = {$inc: { dislikes: 1 }, $push: { usersDisliked: ["x"] }, _id: "1234"};
        const testInitialPost = {
            _id: "1234",
            userId: "y", 
            likes: 0, 
            dislikes: 0, 
            usersLiked: [], 
            usersDisliked: [] 
        };
        const testReqPayload = {
            like: -1,
            userId: "x"
        }
        // act
        const actual = likeDislikePostLogic(testInitialPost, testReqPayload);
        // assert
        expect(actual).toEqual(expected);
    });

    it("given a user who has NOT created a Post, when he dislikes a Post, then his userId should be push to the usersDisliked array", () => {
        // arrange
        const expected = {$inc: { dislikes: 1 }, $push: { usersDisliked: ["x"] }, _id: "1234"};
        const testInitialPost = {
            _id: "1234",
            userId: "y", 
            likes: 0, 
            dislikes: 0, 
            usersLiked: [], 
            usersDisliked: [] 
        };
        const testReqPayload = {
            like: -1,
            userId: "x"
        }
        // act
        const actual = likeDislikePostLogic(testInitialPost, testReqPayload);
        // assert
        expect(actual).toEqual(expected);
    });

    it("given a user who has NOT created a Post, when he unDislikes a Post, then the dislikes prop of the Post is decremented by 1 and his user id added to the pull array under the usersDisliked key", () => {
        // arrange
        const expected = {$inc: { dislikes: -1 }, $pull: { usersDisliked: "x" }, _id: "1234"};
        const testInitialPost = {
            _id: "1234",
            userId: "y", 
            likes: 0, 
            dislikes: 1, 
            usersLiked: [], 
            usersDisliked: ["x"] 
        };
        const testReqPayload = {
            like: 0,
            userId: "x"
        }
        // act
        const actual = likeDislikePostLogic(testInitialPost, testReqPayload);
        // assert
        expect(actual).toEqual(expected);
    });

    it("given a user who has NOT created a Post, when he likes a Post that he had already dislikes , then the likes prop of the Post is incremented by 1  and the dislikes prop decremented by 1 and his userId is added and pull from the right arrays", () => {
        // arrange
        const expected = {$inc: { likes: 1 },$inc: { dislikes: -1 }, $push: { usersLiked: "x" }, $pull: { usersDisliked: "x" },  _id: "1234"};
        const testInitialPost = {
            _id: "1234",
            userId: "y", 
            likes: 0, 
            dislikes: 1, 
            usersLiked: [], 
            usersDisliked: ["x"] 
        };
        const testReqPayload = {
            like: 1,
            userId: "x"
        }
        // act
        const actual = likeDislikePostLogic(testInitialPost, testReqPayload);
        // assert
        expect(actual).toEqual(expected);
    });

    it("given a user who has NOT created a Post, when he dislikes a Post that he had already likes , then the dislikes prop of the Post is incremented by 1  and the likes prop decremented by 1 and his userId is added and pull from the right arrays", () => {
        // arrange
        const expected = {$inc: { likes: -1 },$inc: { dislikes: 1 }, $pull: { usersLiked: "x" }, $push: { usersDisliked: "x" },  _id: "1234"};
        const testInitialPost = {
            _id: "1234",
            userId: "y", 
            likes: 1, 
            dislikes: 0, 
            usersLiked: ["x"], 
            usersDisliked: [] 
        };
        const testReqPayload = {
            like: -1,
            userId: "x"
        }
        // act
        const actual = likeDislikePostLogic(testInitialPost, testReqPayload);
        // assert
        expect(actual).toEqual(expected);
    });
});