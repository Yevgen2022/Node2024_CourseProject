  
  1. Create structure
  
  2. npm install --save-dev nodemon

  3. npm i sequelize , npm i mysql2, npm i randomstring

  4. Create User class

  5. Create mime.js and static_file.js and added into index.js

  6. Const PORT and create server

  7. Atention: in server will better take :

  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  const ext = path.extname(pathname).toLowerCase();

  for example:

   const http = require('http');
   const path = require('path');

   http.createServer((req, res) => {
   const { pathname } = new URL(req.url, `http://${req.headers.host}`);
   console.log(pathname);

  switch (pathname) {
    case '/':
      // віддаємо головну
      staticFile(res, '/html/main_page.html', '.html');
      break;

    default: {
      const ext = path.extname(pathname).toLowerCase();
      if (mimeTypes[ext]) {
        staticFile(res, pathname, ext);
      } else {
        res.statusCode = 404;
        res.end('Not Found');
      }
    }
  }
}).listen(PORT);


8. Proposition: The modern way without querystring is

const http = require('http');

http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const params = Object.fromEntries(url.searchParams); // { q: 'test', page: '2' }

  // ...твоя логіка
  res.end('OK');
}).listen(PORT);

9. Added '/reguser' route

10. Create class User with constructor and diferent fields

module.exports = class User{
    constructor (email, password){
        this.email = email;
        this.password = password;

        this.salt = '@Da!@$7d';
    }
}