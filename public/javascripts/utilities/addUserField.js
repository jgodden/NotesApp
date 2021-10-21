var Note = require('../../../models/note')
var User = require('../../../models/user')
var async = require('async')
var mongoDB = 'mongodb+srv://Admin:M4rmoset52@cluster0.j8m3g.mongodb.net/NotesApp?retryWrites=true&w=majority';

var mongoose = require('mongoose');
console.log('connect to ' + mongoDB);
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
console.log('connected');
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const ObjectId = require('mongodb').ObjectId;

async function run() {
  try {
    const _notes = db.collection("notes");
    // create a filter to update all subjects
    const filter = { };
    // increment every document matching the filter with a user field
    const updateDoc = {
      $unset: {
        _user: ObjectId('61703fac0b1878d29de3992f')
      },
      $set: {
        user: ObjectId('61703fac0b1878d29de3992f')
      },
    };
    const result = await _notes.updateMany(filter, updateDoc);
    console.log(`Updated ${result.modifiedCount} documents`);
  } finally {
    mongoose.connection.close();
  }
}
run().catch(console.dir);
