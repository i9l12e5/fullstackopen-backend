const express = require("express");
const morgan = require("morgan");
const app = express();
const contactSchema = require("./models/customer");

const PORT = process.env.PORT || 3001;

const Contact = contactSchema;

const countPersons = async () => {
	try {
		const count = await contactSchema.countDocuments({});

		return count;
	} catch (error) {
		errorHandler(error);
	}
};

const generateId = async () => {
	const count = await countPersons();

	if (count > 0) {
		const result = await contactSchema.find({});
		const ids = result.map((value) => (isFinite(value.id) ? value.id : 0)); // Fixes entries with missing id. Since there is no failsafe to guarantee broken contacts have valid unique id, we identify them with zero ID

		const maxId = Math.max(...ids);

		return maxId + 1;
	} else {
		// Default value for first one
		return 1;
	}
};

app.use(express.json()); // Load before morgan
morgan.token("body", (req) => {
	return JSON.stringify(req.body);
}); // Fixes morgan() crash for :body
app.use(
	morgan(":method :url :status :res[content-length] - :response-time ms :body"),
);

app.get("/", (req, res, next) => {
	try {
		res.send("hello");
	} catch (error) {
		next(error);
	}
});

// Route to query all contacts
app.get("/api/persons", (req, res, next) => {
	contactSchema
		.find({})
		.then((result) => res.json(result))
		.catch((error) => next(error));
});

// Route to add new contact
app.post("/api/persons", async (req, res, next) => {
	const newName = req.body.name;
	const newNumber = req.body.number;

	if (!newName || !newNumber)
		return res
			.status(400)
			.json({ error: `${!newName ? "Name" : "Number"} is missing` })
			.end();

	const getId = await generateId();

	const newContact = new Contact({
		name: newName,
		number: newNumber,
		id: getId,
	});

	const newEntry = newContact;

	contactSchema
		.findOne({ name: newName })
		.then((result) => {
			if (result !== null)
				return res.status(400).json({ error: "Name must be unique" }).end();
			else {
				newEntry
					.save()
					.then(() => {
						return res.status(201).end();
					})
					.catch((error) => next(error));
			}
		})
		.catch((error) => next(error));
});

// Route to query single contact by id
app.get("/api/persons/:id", (req, res, next) => {
	const id = Number(req.params.id);

	contactSchema
		.findOne({ id: id })
		.then((result) => {
			if (!result) {
				const error = "User not found";
				next(error);
			} else res.send(`User ${result.name} phone number is ${result.number}`);
		})
		.catch((error) => next(error));
});

// Route to update contact number
app.put("/api/persons/:id", (req, res, next) => {
	const id = req.params.id;
	const body = req.body;

	// TODO: korjaa
	contactSchema
		.findOneAndUpdate(
			{ id: id },
			{ $set: { number: body.number } },
			{ returnNewDocument: true },
		)
		.then((result) => {
			console.log(result);

			if (result) res.json(result);
			else res.status(404);
		})
		.catch((error) => next(error));
});

// Route to delete contact by id
app.delete("/api/persons/:id", (req, res, next) => {
	const id = req.params.id;

	contactSchema
		.findOneAndDelete({ id: id })
		.then((result) => {
			res.json(result).end();
		})
		.catch((error) => next(error));
});

// Returns HTML
app.get("/info", async (req, res, next) => {
	try {
		const persons = await countPersons();

		const text = `Phonebook has info for ${persons} people <br /><br />${new Date().toUTCString()}`;

		res.send(text);
	} catch (error) {
		next(error);
	}
});

const errorHandler = (error, request, response, next) => {
	console.error(error.message);

	if (error.name === "CastError") {
		return response.status(400).send({ error: "malformatted id" });
	} else if (error.name === "ValidationError") {
		return response.status(400).json({ error: error.message });
	}

	next(error);
};

app.use(errorHandler);

app.listen(PORT);

console.log(`Server listening on ${PORT}`);
