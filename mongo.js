const mongoose = require("mongoose");

if (process.argv.length < 3) {
	console.log("give password as argument");
	process.exit(1);
}

const password = process.argv[2];
const fetchAll = process.argv.length === 3;
const name = process.argv[3];
const number = process.argv[4];

const url = `mongodb+srv://rantest:${password}@cluster0.ejrwb.mongodb.net/phonebook?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const contactSchema = new mongoose.Schema({
	name: String,
	number: String,
});

const Contact = mongoose.model("Contact", contactSchema);

const newContact = new Contact({
	name: name,
	number: number,
});

if (fetchAll) {
	Contact.find({}).then((persons) => {
		console.log("Phonebook:");
		for (const person of persons) {
			console.log(`${person.name} ${person.number}`);
		}

		mongoose.connection.close();
	});
} else {
	newContact.save().then((result) => {
		console.log(`Added ${name} number ${number} to phonebook`);
		mongoose.connection.close();
	});
}
