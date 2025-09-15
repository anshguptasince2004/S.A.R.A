const express = require("express");
const multer = require("multer");
const csv = require("csvtojson");
const fs = require("fs");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// POST /api/upload-csv
router.post("/upload-csv", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Convert CSV file to JSON
    const jsonArray = await csv().fromFile(req.file.path);

    // remove temp file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Error deleting file:", err);
    });

    res.json({
      message: "CSV converted successfully",
      data: jsonArray,
    });
  } catch (err) {
    res.status(500).json({ error: "Error parsing CSV", detail: err.message });
  }
});

module.exports = router;