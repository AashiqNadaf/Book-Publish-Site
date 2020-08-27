var mongoose = require("mongoose");

var bookSchema = new mongoose.Schema({
	name: String,
	price: String,
	coverImage: String,
	description: String,
	created: {type: Date, default: Date.now},
    doc: String,
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	}
});
module.exports = mongoose.model("Book", bookSchema);