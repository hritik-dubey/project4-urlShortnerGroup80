const urlModels = require("../models/urlModel")
const validurl = require("valid-url")
const shorturl = require("shortid")

const createurl = async function (req, res) {
    try {
        let baseurl = " http://localhost:3000";
        let mydata = {}
        let longurl = req.body.longurl;
        if (!validurl.isUri(longurl)) {
            return res.status(400).send({ msg: "invalid url" })
        }
        let short = shorturl.generate();
        if (validurl.isUri(longurl)) {
            let url = await urlModels.findOne({longUrl: longurl }).select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 })
            if (url) {
                return res.status(200).send({ data: url })
            }
            if (!url) {
                let shortUrl = baseurl + '/' + short
                mydata.longUrl = longurl;
                mydata.shortUrl = shortUrl;
                mydata.urlCode = short;

            }
            let finalUrl = await urlModels.create(mydata)
            return res.status(201).send({ status: true, data: finalUrl })
        }
    }
    catch (err) {
        return res.status(500).send({ err: err.message })

    }
}

const readUrl = async function (req, res) {
    try {
        let url = req.params["urlCode"];
        //console.log(url);
        let savedata = await urlModels.findOne({ urlCode: url }).select({ longUrl: 1, _id: 0 })
        let findUrl = savedata.longUrl
        if (savedata) {
            return res.redirect(findUrl)
        }
        if (!savedata) {
            return res.status(400).send({ msg: "no data find" })
        }
    } catch (err) {
        return res.status(500).send({ err: err.message })

    }

}

module.exports = { createurl, readUrl }