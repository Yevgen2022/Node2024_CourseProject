  
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

11. Take information from POST 

if (req.method == 'POST') {
                let body = '';
                req.on('data', function (data) {
                    body += data;
                });

                req.on('end', async function () {
                    let post = qs.parse(body);
                    const user = new User(post.email, post.pass);
                    if (!(await user.findUser())) {
                        let result = await user.createUser();
                        if (result) {
                            res.end(JSON.stringify({
                                "success": true,
                                "action": "user was created"
                            }))
                        }
                        else {
                            res.end(JSON.stringify({
                                "success": false,
                                "action": "create user error"
                            }))
                        }
                    }
                    else {
                        res.end(JSON.stringify({
                            "success": false,
                            "action": "user exists"
                        }))
                    }
                });
            }

12.  We connect class User into index.js
const User = require ("./classes/User");

13. Прописуємо метод findUser (з ORM Sequelize)
 та додаємо цей метод до роута case '/reguser':

14. Підключаємо Sequelize
const db = require('../db');
const user = db.user; 

15. Створюємо метод async createUser () в класі User

16. Підключаємо const crypto = require('crypto');в User.js
для пароля

17. Create router /login with page
