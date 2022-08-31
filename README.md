# BACKEND FOR GROUPOMANIA

*1- INSTALL ALL THE PACKAGE NEEDED* 

- `npm install`

*2- RUN DOCKER TO ALLOW MONGODB DATABASE CONNECTION*

- `docker compose up`

*3- RUN THE BACKEND SERVER DEV (nodemon)*

- `npm run dev`

or *RUN THE BACKEND SERVER NORMAL (without auto reaload for dev)*

- `npm run start`

Server should be start on port 3000 make sure you're prt is free to use

*4- TEST ARE ALL INDEPENDANT (you don't need to run the server to test the app and it use a different database for test)*

-`npm run test:watch` (look for changes and rerun test if you make changes in app) or `npm run test`

*5- Quality Assurance CURL COMMANDS*
 
- ⚠️ we create the admin user on app' startup for the sake of evaluation, please delete that user from DB if you relaunch the app'
- log admin user in : `curl -H "Content-Type: application/json" -X POST -d '{"email":"admin@groupomania.com","password":"ADMIN_PASSWORD"}' http://localhost:3001/api/auth/login`
- sign regular user up: `curl -H "Content-Type: application/json" -X POST -d '{"email":"test@test.com","password":"2TEST_test", "userName": "test"}' http://localhost:3001/api/auth/signup`
- sign regular a 2nd user up: `curl -H "Content-Type: application/json" -X POST -d '{"email":"test2@test.com","password":"2TEST_test", "userName": "test"}' http://localhost:3001/api/auth/signup`  
- log regular user in : `curl -H "Content-Type: application/json" -X POST -d '{"email":"test@test.com","password":"2TEST_test"}' http://localhost:3001/api/auth/login`
- log regular a 2nd user in : `curl -H "Content-Type: application/json" -X POST -d '{"email":"test2@test.com","password":"2TEST_test"}' http://localhost:3001/api/auth/login`
- create a post: `curl -H "Content-Type: application/json" -H "Authorization: Bearer {token}" -d '{"content": "test", "userId": "{MONGO_UID}"}' http://localhost:3001/api/posts`
- update a post: `curl -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer {token}" -d '{"content": "test update", "userId": "{MONGO_UID}"}' http://localhost:3001/api/posts/{POST_ID}`
- update a post: `curl -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer {token}" -d '{"content": "test update", "userId": "{MONGO_UID}"}' http://localhost:3001/api/posts/{POST_ID}`
- delete a post: `curl -X DELETE -H "Content-Type: application/json" -H "Authorization: Bearer {token}" http://localhost:3001/api/posts/{POST_ID}`
<!-- TODO add commands for likes/dislikes -->