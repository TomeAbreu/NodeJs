//File for listing and adding entries to the phonebook database
const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log(
    "Please provide the password as an argument: node mongo.js <password>"
  );
  process.exit(1);
}

//Password will be passed as second argument in command line argument
const password = process.argv[2];

//Url of mongo database
const url = `mongodb+srv://motu:${password}@cluster0.hwxjbnf.mongodb.net/phonebook`;

//Define personSchema: Tell to Mongo how a person should be storeed in the database
const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

//Define personModel: Model is a constructor function to Person javascript object
const Person = mongoose.model("Person", personSchema);

if (process.argv.length === 3) {
  // Retrieve List of Database users
  const phoneBookEntries = [];
  mongoose
    .connect(url)
    .then((result) => {
      //Get Persons from database
      Person.find({}).then((result) => {
        console.log(result);
        result.forEach((person) => {
          phoneBookEntries.push(person);
        });
        mongoose.connection.close();

        console.log("phonebook:");
        phoneBookEntries.map((person) => {
          console.log(person.name + " " + person.number);
        });
      });
    })
    .catch((err) => console.log(err));
} else if (process.argv[3] && process.argv[4]) {
  //Create a new phonebook entrie
  mongoose
    .connect(url)
    .then((result) => {
      console.log("connected");

      //Create new person
      const person = new Person({
        name: String(process.argv[3]),
        number: String(process.argv[4]),
      });

      //Save to database
      return person.save();
    })
    .then((person) => {
      console.log(`Added ${person.name} number ${person.number} to phonebook`);
      //Close connection to database
      return mongoose.connection.close();
    })
    .catch((err) => console.log(err));
} else {
  console.log(
    "Please provide the correct number of arguments to add person to the phonebook"
  );
  process.exit(1);
}
