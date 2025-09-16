let express = require('express');
const router = express.Router();

const { addAmendment, getAmend } = require("../controllers/amend");

router.post("/addAmend",addAmendment);
router.get("/getAmend",getAmend);

module.exports = router;