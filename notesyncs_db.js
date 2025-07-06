// app.js or db.js
const mongoose = require('mongoose');

// Replace with your actual connection string and database name
const mongoURI = 'mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/notesyncs_db?retryWrites=true&w=majority';

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useCreateIndex: true, // Deprecated in newer Mongoose versions
      // useFindAndModify: false // Deprecated in newer Mongoose versions
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;

// In your main application file (e.g., server.js)
// const connectDB = require('./db');
// connectDB(); // Call this function when your app starts
