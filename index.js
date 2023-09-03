const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const morgan = require('morgan');

dotenv.config();

const app = express();

app.set('port', process.env.NODE_PORT); // 포트 지정
app.use(cors('*'));
app.use(bodyParser.json());
app.use(express.urlencoded( {extended: false} ));
app.use(morgan('dev'));

app.post('/api/url', function (req, res) {
    const query = encodeURI(req.body.url);
    const api_url = 'https://openapi.naver.com/v1/util/shorturl';
    const request = require('request');
    const options = {
        url: api_url,
        form: {'url':query},
        headers: {'X-Naver-Client-Id':process.env.CLIENT_ID, 'X-Naver-Client-Secret': process.env.CLIENT_SECRET}
    };
    request.post(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.status(200).json({"shortURL": JSON.parse(body).result.url});
        } else {
            res.status(response.statusCode).json(error);
        }
    });
});

app.listen(process.env.NODE_PORT, () => {
    console.log(`Node.js server listening at port ${process.env.NODE_PORT}`);
});