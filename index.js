const http = require("http");
const path = require("path");
const qs = require("qyerystring");

const { mimeTypes } = require("./utilities/mime");
const { staticFile } = require("./utilities/static_file");

const PORT = 3500;

http.createServer(async function (req, res) {
    const url = req.url;
    console.log(url);

    switch (url) {
        case '/':
            console.log('mainpage');
            staticFile(res, '/html/main_page.html', '.html');
            break;

        default:
            const extname = String(path.extname(url)).toLocaleLowerCase();
            if (extname in mimeTypes) staticFile(res, url, extname);
            else {
                res.statusCode = 404;
                res.end();
            }
    }


}.listen(PORT));