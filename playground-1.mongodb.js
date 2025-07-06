/* global use, db */
// MongoDB Playground
// To disable this template go to Settings | MongoDB | Use Default Template For Playground.
// Make sure you are connected to enable completions and to be able to run a playground.
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.
// The result of the last command run in a playground is shown on the results panel.
// By default the first 20 documents will be returned with a cursor.
// Use 'console.log()' to print to the debug output.
// For more documentation on playgrounds please refer to
// https://www.mongodb.com/docs/mongodb-vscode/playgrounds/
use('<YOUR_DATABASE_NAME>');
db.getCollection('<YOUR_COLLECTION_NAME>').insertMany([
  {
    title: "Another Test",
    price: "£125.00",
    description: "Test."
  },
  {
    title: "M.Sc. Agricultural",
    price: "£250.00",
    description: "M.Sc. agriculture, self-study guides, reference"
  },
  {
    title: "M.Sc. Agricultural",
    price: "£250.00",
    description: "self-study guides, training material"
  },
  {
    title: "test",
    price: "£12.50",
    description: "test"
  }
]);
