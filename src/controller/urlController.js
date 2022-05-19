
const shortid = require('shortid')
const urlModel = require('../models/urlModel')
const redis = require("redis");
const { promisify } = require("util");


const redisClient = redis.createClient(
    18072,
    "redis-18072.c13.us-east-1-3.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("MebNobhv7kj4J3RSEQBcNWY6JnbI3b20", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


const createUrl = async function (req, res) {
    try {
        const data = req.body

        // const baseUrl = 'http:localhost:3000'
        const baseUrl = req.headers.host
        // const protocol = req.protocol
        const longUrl = data.longUrl
        const urlCode = shortid.generate()  //
        
        const isAlreadyurlCode = await urlModel.findOne({ urlCode: urlCode })
        if(isAlreadyurlCode) { urlCode = shortid.generate() }

        //checking url in cache server memory
        const isUrlCached = await GET_ASYNC(`${longUrl}`)
        if (isUrlCached) {
            const urlCodeInObjectForm = JSON.parse(isUrlCached)
            return res.status(200).send({ status: true, message: "Url Data From Cache", data: urlCodeInObjectForm })
        }
        else {
            const isAlreadyUrlInDb = await urlModel.findOne({ longUrl: longUrl }).select({ longUrl: 1, shortUrl: 1, urlCode: 1, _id: 0 })
            if (isAlreadyUrlInDb) {
                //saving Url in cache server memory
                await SET_ASYNC(`${longUrl}`, JSON.stringify(isAlreadyUrlInDb))
                return res.status(200).send({ status: true, message: "Url Data From Database", data: isAlreadyUrlInDb });
            }
        }
        const shortUrl = baseUrl + '/' + urlCode
        data.shortUrl = shortUrl
        data.urlCode = urlCode
        //Creating Url document in Db
        const urlCreated = await urlModel.create(data)
        return res.status(201).send({ status: true, message: "url generated", data: data })
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}


const getUrl = async function (req, res) {
    try {
        const urlCode = req.params.urlCode
        console.log(urlCode);
        if (!urlCode) return res.status(400).send({ status: false, message: "urlCode is not Present" })
        const findUrlCode = await urlModel.findOne({ urlCode: urlCode })
        console.log(findUrlCode);
        if (!findUrlCode) return res.status(404).send({ status: false, message: "Url does not exist" })
        return res.status(302).redirect( findUrlCode.longUrl )
    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}
module.exports = { createUrl, getUrl }