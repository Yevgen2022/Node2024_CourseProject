const http = require("http");
const path = require("path");
const qs = require('querystring');

const { mimeTypes } = require("./utilities/mime");
const { staticFile } = require("./utilities/static_file");

const User = require("./classes/User");
const Authkey = require('./classes/Authkey');

const PORT = 3500;

function parseCookies(request) { 
    const list = {};
    const cookieHeader = request.headers?.cookie;
    if (!cookieHeader) return list;

    cookieHeader.split(`;`).forEach(function (cookie) {
        let [name, ...rest] = cookie.split(`=`);
        name = name?.trim();
        if (!name) return;
        const value = rest.join(`=`).trim();
        if (!value) return;
        list[name] = decodeURIComponent(value);
    });
    return list;
}

http.createServer(async function (req, res) {

    // const { pathname } = new URL(req.url, `http://${req.headers.host}`);
    // console.log(pathname);

    const url = req.url;
    console.log(url);

    switch (url) {
        case '/':
            console.log('mainpage');
            staticFile(res, '/html/main_page.html', '.html');
            break;

        case '/reguser':
            console.log('reguser');
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
            break;

        case '/login':
            console.log('login');
            staticFile(res, '/html/login.html', '.html');
            break;

        case '/login-user':
            console.log('login-user');
            if (req.method == 'POST') {
                let body = '';
                req.on('data', function (data) {
                    body += data;
                });
 
                req.on('end', async function () {
                    let post = qs.parse(body);
                    const user = new User(post.email, post.pass);
                    let auth = await user.authUser();
                    if (auth) {
                        let cookie = await Authkey.createAuthKey(auth.id);
                        let ts = new Date();
                        ts.setDate(ts.getDate() + 7);
                        res.end(JSON.stringify({
                            "success": true,
                            "action": "You are logged in",
                            "cookie": "auth=" + cookie.authkey + "; expires=" + ts.toGMTString() + "; path=/"
                        }))
                    }
                    else {
                        res.end(JSON.stringify({
                            "success": false,
                            "action": "user not found"
                        }))
                    }
                });
            }
            break;

        case '/admin':
            console.log('admin');
            cookies = parseCookies(req);
            if (cookies.auth) {
                let r = await Authkey.checkCookie(cookies.auth);
                if (r) {
                    staticFile(res, '/html/admin.html', '.html');
                }
                else {
                    res.setHeader('Set-Cookie', ['auth="";max-age=-1', 'u=;max-age=0']);
                    staticFile(res, '/html/login.html', '.html');
                }
            }
            else {
                res.setHeader('Set-Cookie', ['auth="";max-age=-1', 'u=;max-age=0']);
                staticFile(res, '/html/login.html', '.html');
            }
            break;

        default:
            const extname = String(path.extname(url)).toLocaleLowerCase();
            if (extname in mimeTypes) staticFile(res, url, extname);
            else {
                res.statusCode = 404;
                res.end();
            }
    }

}).listen(PORT);