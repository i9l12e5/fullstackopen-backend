const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");

const PORT = process.env.PORT || 3001;

let persons = [
	{
		name: "Arto Hellas",
		number: "040-123456",
		id: "1",
	},
	{
		name: "Ada Lovelace",
		number: "39-44-5323523",
		id: "2",
	},
	{
		name: "Dan Abramov",
		number: "12-43-234345",
		id: "3",
	},
	{
		name: "Mary Poppendieck",
		number: "39-23-6423122",
		id: "4",
	},
];

app.use(cors());

morgan.token("body", (req) => JSON.stringify(req.body) || "");

app.use(
	morgan(":method :url :status :res[content-length] - :response-time ms :body"),
);

app.use(express.json());

app.get("/", (req, res) => {
	res.send("hello");
});

app.get("/api/persons", (req, res) => {
	res.json(persons);
});

app.post("/api/persons", (req, res) => {
	console.log("....", req.body);
	const newName = req.body.name;
	const newNumber = req.body.number;

	if (!newName || !newNumber)
		return res
			.status(400)
			.json({ error: `${!newName ? "Name" : "Number"} is missing` })
			.end();

	const checkForDuplicates = persons.some((user) => user.name === newName);

	if (checkForDuplicates)
		return res.status(400).json({ error: "Name must be unique" }).end();

	const newPerson = {
		name: newName,
		number: newNumber,
		id: Number(Math.floor(Math.random() * 10000) + 1).toString(), // simple fix to make new id types same as hardcoded
	};

	persons.push(newPerson);

	return res.status(201).end();
});

app.get("/api/persons/:id", (req, res) => {
	const id = req.params.id;
	const find = persons.find((person) => person.id === id);

	if (find === undefined) res.send("404 - user not found");
	else res.send(`User ${find.name} phone number is ${find.number}`);
});

app.delete("/api/persons/:id", (req, res) => {
	const id = req.params.id;

	persons = persons.filter((person) => person.id !== id);

	res.status(204).end();
});

app.get("/info", (req, res) => {
	const text = `Phonebook has info for ${persons.length} people <br /><br />${new Date().toUTCString()}`;
	res.send(text);
});

app.listen(PORT);

console.log(`Server listening on ${PORT}`);
