const express = require('express');
const router = express.Router();


const urlcontroler =  require("../controller/urlController")

router.post("/url/shorten",urlcontroler.createurl)
router.get("/:urlCode",urlcontroler.readUrl)




module.exports = router;