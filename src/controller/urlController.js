const shortid = require('shortid')
// const nanoid = require("nanoid")
const urlModel = require('../models/urlModel')
const redis = require("redis");
const { promisify } = require("util");

//#######################################################################################################################################
//Function to validate the Url using Ragex
const isValidUrl = (url) => {
    if (/(ftp|http|https|FTP|HTTP|HTTPS):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/.test(url.trim()))
        return true
    else
        return false
}
//#######################################################################################################################################
// Making Connection with redis and creating function for set and get
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
//#######################################################################################################################################

const createUrl = async function (req, res) {
    try {
        const data = req.body
        const baseUrl = req.headers.host     // const baseUrl = 'http:localhost:3000'
        const protocol = req.protocol
        const longUrl = data.longUrl
        const urlCode = shortid.generate()

        if(Object.keys(data).length==0) return res.status(400).send({ status: false, message: "Invalid request parameters , Please provide a longUrl" })
        if (!longUrl) return res.status(400).send({ status: false, message: "Please provide a longUrl" })
        if (!isValidUrl(longUrl)) return res.status(400).send({ status: false, message: "Invalid URL" })

        const isAlreadyurlCode = await urlModel.findOne({ urlCode: urlCode })
        if (isAlreadyurlCode) { urlCode = shortid.generate() }

        //checking url in cache server memory
        const isUrlCached = await GET_ASYNC(`${longUrl}`)
        if (isUrlCached) return res.status(200).send({ status: true, message: "Url Data From Cache", data: JSON.parse(isUrlCached) })

        //saving Url in cache server memory
        const isAlreadyUrlInDb = await urlModel.findOne({ longUrl: longUrl }).select({ longUrl: 1, shortUrl: 1, urlCode: 1, _id: 0 })
        if (isAlreadyUrlInDb) {
            await SET_ASYNC(`${longUrl}`, JSON.stringify(isAlreadyUrlInDb))
            return res.status(200).send({ status: true, message: "Url Data From Database", data: isAlreadyUrlInDb });
        }

        const shortUrl = protocol + '://' + baseUrl + '/' + urlCode
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

//#######################################################################################################################################
const getUrl = async function (req, res) {
    try {
        const urlCode = req.params.urlCode
        if (!shortid.isValid(urlCode)) return res.status(400).send({ status: false, message: "urlCode is not Valid" })

        //checking url in cache server memory
        const isUrlCached = await GET_ASYNC(`${urlCode}`)
        if (isUrlCached) return res.status(302).redirect(JSON.parse(isUrlCached).longUrl)

        //saving Url in cache server memory
        const isAlreadyUrlInDb = await urlModel.findOne({ urlCode: urlCode })
        if (!isAlreadyUrlInDb) return res.status(404).send({ status: false, message: "Unable to find URL to redirect to....." })

        await SET_ASYNC(`${urlCode}`, JSON.stringify(isAlreadyUrlInDb))
        return res.status(302).redirect(isAlreadyUrlInDb.longUrl);
    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}
//#######################################################################################################################################
module.exports = { createUrl, getUrl }
