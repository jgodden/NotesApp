#! /usr/bin/env node

console.log('This script populates some test notes to your database. Specified database as argument - e.g.: populatedb mongodb+srv://Admin:M4rmoset52@cluster0.j8m3g.mongodb.net/NotesApp?retryWrites=true&w=majority');
const { DateTime } = require("luxon");

// Get arguments passed on command line
var userArgs = process.argv.slice(2);

var async = require('async')
var Note = require('./models/note')

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var notes = []

function noteCreate(subject, creationDate, updateDate, topic, lectureNote, keywords, questions, comments, summary, image, cb) {
  notedetail = {
    subject: subject,
    creationDate: creationDate,
    updateDate: updateDate,
    topic: topic,
    lectureNote: lectureNote,
    keywords: keywords,
    questions: questions,
    comments: comments,
    summary: summary,
    image: image
    }
    
  var note = new Note(notedetail);    
  note.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Note: ' + note);
    notes.push(note)
    cb(null, note)
  }  );
}

function createNotes(cb) {
    async.parallel([
        function(callback) {
          noteCreate(
            'Geography',
            '2021-08-20',
            '2021-08-21',
            'Erosion in rivers',
            'Due to friction of water molecules',
            'erosion', 'how is it affected by climate?',
            '3 main drivers',
            'land formation through friction',
            '',
            callback);
        },
        function(callback) {
          noteCreate(
            'Biology',
            '2021-08-22',
            '2021-08-23',
            'Kidney function',
            'using osmosis and NaCl',
            'osmosis',
            'what is the primary cause of failure?',
            'fluid filtration',
            'fluid balance',
            '',
            callback);
        },
        function(callback) {
          noteCreate(
            'Chemistry',
            '2021-08-24',
            '2021-08-25',
            'Born-Haber cycle',
            "calculating lattice enthalpy knowing the change enthalpies of all other state changes. These can be found from other sources and are known for all elements",
            'enthalpy', 'are first and second orders added?',
            'uses Hess law',
            'add enthalpies to get unknown',
            '',
            callback);
        },
        function(callback) {
          noteCreate(
            'Geography',
            '2021-08-26',
            '2021-08-27',
            'Climate conditions',
            'causes of climate change',
            'glaciers,warming,entropy',
            'how quickly is temp rising?',
            'global warming',
            'ozone depletion causing temp rise',
            '',
            callback);
        },
        function(callback) {
          noteCreate(
            'Biology',
            '2021-08-28',
            '2021-08-29',
            'Homeostasis',
            'controlling body conditions',
            'acidity',
            'what is the standard temperature?',
            'opposite to environmental changes',
            'keeps body functioning',
            '',
            callback);
        },
        function(callback) {
          noteCreate(
            'Chemistry',
            '2021-08-30',
            '2021-08-31',
            'Equilibrium constants',
            'relates to concentration and pressure',
            'dynamic equilibrium',
            'is it always a closed system?',
            'reversible reaction',
            'equal and opposite reactions',
            '',
            callback);
        },
        ],
        // optional callback
        cb);
}



async.series([
  createNotes
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+ err);
    }
    else {
        console.log('Notes: '+ notes);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});



