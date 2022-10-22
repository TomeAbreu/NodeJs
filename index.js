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

//App to use Middleware status to go to folder build and use endpoints from there(front-end app)
app.use(express.static("build"));

//App to use Middleware to parse all request to JSON
app.use(express.json());

//App to use Middleware CORS to accept front end app connection
app.use(cors());

//Custom Middleware definition for all requests (needs to be implemented before requests)
const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};

//App to use our Custom Middleware
app.use(requestLogger);

morgan.token("body", (req, res) => JSON.stringify(req.body));

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
app.get("/api/persons/:id", (request, response, next) => {
  const personID = request.params.id;
  Person.findById(personID)
    .then((person) => {
      if (person) {
        return response.json(person);
      } else {
        return response.status(404).end();
      }
    })
    .catch((error) => {
      //If the next function is called with a parameter,
      //then the execution will continue to the error handler middleware
      next(error);
    });
});

//Delete person by Id
app.delete("/api/persons/:id", (request, response, next) => {
  console.log("Request param ID:", request.params.id);

  Person.findByIdAndDelete(request.params.id)
    .then((deletedPerson) => {
      if (deletedPerson.deletedCount > 0) {
        return response.status(204).end();
      } else {
        return response.status(404).end();
      }
    })
    .catch((error) => {
      next(error);
    });
});

//Create entrie in phonebook
app.post("/api/persons", (request, response, next) => {
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

  //Check if name already exists in Phonebook database
  const duplicateName = Person.find({ name: body.name })
    .then((person) => {
      return true;
    })
    .catch((error) => {
      return false;
    });

  if (duplicateName === true) {
    return response.status(400).json({
      error: "Name must be unique",
    });
  }

  //Create new person
  const newPerson = new Person({
    name: body.name,
    number: body.number,
  });

  newPerson
    .save()
    .then((result) => response.status(201).json(newPerson))
    .catch((error) => {
      next(error);
    });
});

//Error Handler Middleware
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

//App to use Middleware Error Handler(must be the last middleware loadded)
app.use(errorHandler);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
