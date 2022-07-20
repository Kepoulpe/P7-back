# BACKEND FOR GROUPOMANIA

*1- INSTALL ALL THE PACKAGE NEEDED* 

- npm install

*2- RUN DOCKER TO ALLOW MONGODB DATABASE CONNECTION*

- docker compose up

*3- RUN THE BACKEND SERVER DEV (nodemon)*

- npm run dev

or *RUN THE BACKEND SERVER NORMAL (without auto reaload for dev)*

- npm run start

Server should be start on port 3000 make sure you're prt is free to use


*4- TEST ARE ALL INDEPENDANT (you don't need to run the server to test the app and it use a different database for test)*

- npm run test:watch (look for changes and rerun test if you make changes in app)or npm run test