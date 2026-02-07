const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const axios = require('axios');

dotenv.config();

const app = express();

app.set('port', process.env.NODE_PORT); // 포트 지정
app.use(cors('*'));
app.use(express.json());
app.use(express.urlencoded( {extended: false} ));
app.use(morgan('dev'));

app.post('/api/url', async function (req, res) {
    const query = encodeURI(req.body.url);
    const api_url = 'https://openapi.naver.com/v1/util/shorturl';
    try {
        const response = await axios.post(api_url, `url=${query}`, {
            headers: {
                'X-Naver-Client-Id': process.env.CLIENT_ID,
                'X-Naver-Client-Secret': process.env.CLIENT_SECRET,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        res.status(200).json({"shortURL": response.data.result.url});
    } catch (error) {
        const status = error.response ? error.response.status : 500;
        res.status(status).json(error.message);
    }
});

app.listen(process.env.NODE_PORT, () => {
    console.log(`Node.js server listening at port ${process.env.NODE_PORT}`);
});
