const { default: mongoose } = require("mongoose");

const urlSchema = new mongoose.Schema({
  urlCode: {type: String, required:true, unique:true,  trim:true, lowercase: true },
   longUrl: {type: String, required:true}, 
   shortUrl: {type: String, required:true, unique:true}
} ,{ timestamps: true })

module.exports = mongoose.model('url', urlSchema)
