const { default: mongoose } = require("mongoose");

mongoose.set("strictQuery", false);

const url = process.env.MONGODB_URI;

mongoose
	.connect(url)
	.then((result) => {
		console.log("connected to MongoDB");
	})
	.catch((error) => {
		console.log("error connecting to MongoDB:", error.message);
	});

const contactSchema = new mongoose.Schema({
	name: {
		type: String,
		minLength: 3,
		required: true,
	},
	number: {
		type: String,
		minLength: 8,
		required: true,
		validate: {
			validator: (v) => /^\d{2,3}-\S{5,}$/.test(v),
			message: (props) => `${props.value} is not a valid phone number!`,
		},
	},
	id: {
		type: Number,
		required: true,
		unique: true,
	},
});

contactSchema.set("toJSON", {
	transform: (document, returnedObject) => {
		returnedObject._id = undefined;
		returnedObject.__v = undefined;
	},
});

module.exports = mongoose.model("Contact", contactSchema);
