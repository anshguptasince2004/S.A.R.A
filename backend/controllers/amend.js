const connectDB = require("../database");
const Amendment = require("../Schemas/report");

const addAmendment = async (req, res) => {
  const { title } = req.body;

  try {
    await connectDB();
    let existing = await Amendment.findOne({ title: title });
    if (existing) {
      return res.json({ message: "Amendment Already exists" });
    }
    let data = new Amendment({ title: title });
    await data.save();

    res.status(201).json({ message: "Data added successfully" });
  } catch (e) {
    res.status(500).json({ message: "Error occured" });
  }
};

const getAmend = async (req, res) => {
  try {
    await connectDB();

    const val = await Amendment.find();

    if (!val || val.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }
    res.status(200).json(val);
  } catch (e) {
    res.status(500).json({ message: e });
  }
};



module.exports = { addAmendment, getAmend };
