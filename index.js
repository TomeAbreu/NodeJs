const express = require("express");
const app = express();

app.use(express.json());

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/info", (request, response) => {
  console.log("Request: ", request);
  const requestTime = new Date();

  response.send(
    `<div><h3>Phonebook has info for ${persons.length} people</h3><h3>${requestTime}</h3></div>`
  );
});

app.get("/api/persons/:id", (request, response) => {
  console.log("Request to API");
  const personID = Number(request.params.id);
  console.log("PERSON ID:", personID);

  const person = persons.find((p) => {
    return p.id === personID;
  });
  if (person) {
    response.json(person);
  } else {
    response.status(404);
    response.send("Person was not present in Phonebook");
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);
  response.status(204).end();
});

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

const generateId = () => {
  return Math.floor(Math.random() * 10000);
};

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
