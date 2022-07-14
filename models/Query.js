var mongoose = require("mongoose");

var QuerySchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Email: { type: String, required: true },
  Subject: { type: String, required: true },
  Message: { type: String, required: true },
  Club: { type: String, required: true },
  created: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Query", QuerySchema);
