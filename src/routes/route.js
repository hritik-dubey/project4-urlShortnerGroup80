const express = require('express');
const router = express.Router();


const urlcontroler =  require("../controller/urlController")

router.post("/url/shorten",urlcontroler.createUrl)
router.get("/:urlCode",urlcontroler.getUrl)




module.exports = router;

