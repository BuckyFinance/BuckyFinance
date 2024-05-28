const express = require('express');
const bodyParser = require('body-parser')
const router = require('./router')

const app = express();

app.use(express.json());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.json("hello world");
})

app.use('/api/v1', router);


app.listen(3000, () => {
    console.log("Server started on port 3000");
})
