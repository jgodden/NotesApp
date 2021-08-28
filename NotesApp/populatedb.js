#! /usr/bin/env node

console.log('This script populates some test notes and subjects to your database. Specified database as argument - e.g.: populatedb mongodb+srv://Admin:M4rmoset52@cluster0.j8m3g.mongodb.net/NotesApp?retryWrites=true&w=majority');
const { DateTime } = require("luxon");

// Get arguments passed on command line
var userArgs = process.argv.slice(2);

var async = require('async')
var Note = require('./models/note')
var Subject = require('./models/subject')

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var notes = []
var subjects = []

function subjectCreate(title, cb) {
    subjectdetail = {title: title }
    
    var subject = new Subject(subjectdetail);
       
  subject.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Subject: ' + subject);
    subjects.push(subject);
    cb(null, subject)
  }  );
}

function noteCreate(subject, date, topic, lectureNote, keywords, questions, comments, summary, cb) {
  notedetail = {
    subject: subject,
    date: date,
    topic: topic,
    lectureNote: lectureNote,
    keywords: keywords,
    questions: questions,
    comments: comments,
    summary: summary
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


function createSubjects(cb) {
    async.series([
        function(callback) {
          subjectCreate('Geography', callback);
        },
        function(callback) {
            subjectCreate('Biology', callback);
        },
        function(callback) {
            subjectCreate('Chemistry', callback);
        },
        ],
        // optional callback
        cb);
}

function createNotes(cb) {
  var date = '2021-08-25';
    async.parallel([
        function(callback) {
          noteCreate(subjects[0], date, 'Erosion in rivers', 'Due to friction of water molecules', ['erosion'], ['how is it affected by climate?'], ['3 main drivers'], 'land formation through friction', callback);
        },
        function(callback) {
          noteCreate(subjects[1], date, 'Kidney function', 'using osmosis and NaCl', ['osmosis'], ['what is the primary cause of failure?'], ['fluid filtration'], 'fluid balance', callback);
        },
        function(callback) {
          noteCreate(subjects[2], date, 'Born-Haber cycle', "calculating lattice enthalpy knowing the change enthalpies of all other state changes. These can be found from other sources and are known for all elements", ['enthalpy'], ['are first and second orders added?'], ['uses Hess law'], 'add enthalpies to get unknown', callback);
        },
        function(callback) {
          noteCreate(subjects[0], date, 'Climate conditions', 'causes of climate change', ['glaciers','warming','entropy'], ['how quickly is temp rising?'], ['global warming'], 'ozone depletion causing temp rise', callback);
        },
        function(callback) {
          noteCreate(subjects[1], date, 'Homeostasis', 'controlling body conditions', ['acidity'], ['what is the standard temperature?'], ['opposite to environmental changes'], 'keeps body functioning', callback);
        },
        function(callback) {
          noteCreate(subjects[2], date, 'Equilibrium constants', 'relates to concentration and pressure', ['dynamic equilibrium'], ['is it always a closed system?'], ['reversible reaction'], 'equal and opposite reactions', callback);
        },
        ],
        // optional callback
        cb);
}



async.series([
  createSubjects,
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



