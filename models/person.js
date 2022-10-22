const mongoose = require("mongoose");

const url = process.env.MONGODB_URI;
console.log("connecting to", url);

mongoose
  .connect(url)
  .then((result) => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

//Define personSchema: Tell to Mongo how a person should be storeed in the database
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: String,
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

//Export personModel: Model is a constructor function to Person javascript object
module.exports = mongoose.model("Person", personSchema);
