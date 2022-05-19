const express = require('express');
const router = express.Router();


const urlcontroler =  require("../controller/urlController")

router.post("/url/shorten",urlcontroler.createUrl)
router.get("/:urlCode",urlcontroler.getUrl)




module.exports = router;

// const express = require("express")
// const router = express.Router()
// const urlController =require("../controllers/urlController")

// router.post("/url/shorten", urlController.createUrl)
// router.get("/:urlCode", urlController.getUrl)

// module.exports=router