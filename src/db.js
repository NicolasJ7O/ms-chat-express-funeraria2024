// src/db.js

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://User-Nico:numgubzs4qE8AqYw@clusterseguridad.nahwzut.mongodb.net/?retryWrites=true&w=majority&appName=ClusterSeguridad', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
