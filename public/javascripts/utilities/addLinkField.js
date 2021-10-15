#! /usr/bin/env node

console.log('This script populates some test notes to your database. Specified database as argument - e.g.: populatedb mongodb+srv://Admin:M4rmoset52@cluster0.j8m3g.mongodb.net/NotesApp?retryWrites=true&w=majority');
const { DateTime } = require("luxon");

// Get arguments passed on command line
var userArgs = process.argv.slice(2);

var async = require('async')
var Note = require('../../../models/note')
var Subject = require('../../../models/subject')
var Topic = require('../../../models/topic')
var Subtopic = require('../../../models/subtopic')
var Section = require('../../../models/section')

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
const client = new MongoClient(mongoDB);
async function run() {
  try {
    await client.connect();
    const database = client.db("NotesApp");
    const subject = database.collection("subject");
    // create a filter to update all subjects
    const filter = { };
    // increment every document matching the filter with 2 more comments
    const updateDoc = {
      $set: {
        link: "h"
      },
    };
    const result = await subject.updateMany(filter, updateDoc);
    console.log(`Updated ${result.modifiedCount} documents`);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);