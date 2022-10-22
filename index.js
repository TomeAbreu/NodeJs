//Import .env variables
require("dotenv").config();

const express = require("express");

const app = express();

//Import Middleware CORS
const cors = require("cors");

//Import middleware morgan
const morgan = require("morgan");

//Import model Person from models
const Person = require("./models/person");

//Custom Middleware definition for all requests (needs to be implemented before requests)
const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};

morgan.token("body", (req, res) => JSON.stringify(req.body));

//App to use Middleware to parse all request to JSON
app.use(express.json());

//App to use Middleware CORS to accept front end app connection
app.use(cors());

//App to use Middleware status to go to folder build and use endpoints from there(front-end app)
app.use(express.static("build"));

//App to use our Custom Middleware
app.use(requestLogger);

//App to use Middleware Morgan
app.use(morgan(":method :url :status :response-time ms :body"));

app.get("/info", (request, response) => {
  const requestTime = new Date();
  Person.find({}).then((persons) => {
    response.send(
      `<div><h3>Phonebook has info for ${persons.length} people</h3><h3>${requestTime}</h3></div>`
    );
  });
});

//Get all entries of phonebook
app.get("/api/persons", (request, response) => {
  //Find method to find all phonebook entries in Db
  Person.find({}).then((persons) => response.json(persons));
});

//Get specific person
app.get("/api/persons/:id", (request, response) => {
  const personID = request.params.id;
  Person.findById(personID)
    .then((person) => response.json(person))
    .catch((error) =>
      response.status(404).send("Person was not present in the phonebook")
    );
});

//Delete person by Id
app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);
  response.status(204).end();
});

//Create entrie in phonebook
app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body) {
    return response.status(400).json({
      error: "Content Missing in Request",
    });
  } else if (!body.name || !body.number) {
    return response.status(400).json({
      error: "Name or Number is missing in Request",
    });
  }

  //Check if name already exists in Phonebook list
  const duplicateName = persons.find((person) => {
    return person.name === body.name;
  });

  if (duplicateName) {
    return response.status(400).json({
      error: "Name must be unique",
    });
  }
  const newId = generateId();

  const newPerson = {
    id: newId,
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(newPerson);

  return response.status(201).json(newPerson);
});

//Generate ID function
const generateId = () => {
  return Math.floor(Math.random() * 10000);
};

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
