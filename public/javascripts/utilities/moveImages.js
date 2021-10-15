#! /usr/bin/env node
require('dotenv').config();

var async = require('async')
var Note = require('../../../models/note')

const mongoose = require('mongoose');
const mongoDB = process.env.MONGODB_URI;

mongoose.connect(mongoDB, { useNewUrlParser: true , useUnifiedTopology: true});
console.log('connected');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:')); 
var swap = [
  { new_id:"616841ce0d47177dbb3f518b", old_id:"6154a4d126fbef420c43f9ea" },
  { new_id:"616841ce0d47177dbb3f518a", old_id:"6154dd013f80e6725c21b2af" },
  { new_id:"616841ce0d47177dbb3f518c", old_id:"6154e0593f80e6725c21b317" },
  { new_id:"616841ce0d47177dbb3f518d", old_id:"6154e1aa3f80e6725c21b339" },
  { new_id:"616841ce0d47177dbb3f518f", old_id:"6154e4e03f80e6725c21b35b" },
  { new_id:"616841ce0d47177dbb3f518e", old_id:"6154eacd3f80e6725c21b3a1" },
  { new_id:"616841ce0d47177dbb3f5190", old_id:"6154eb6c3f80e6725c21b3c9" },
  { new_id:"616841ce0d47177dbb3f5191", old_id:"6154ed983f80e6725c21b3fd" },
  { new_id:"616841ce0d47177dbb3f5192", old_id:"6154effe3f80e6725c21b41f" },
  { new_id:"616841ce0d47177dbb3f5198", old_id:"6154f14d3f80e6725c21b449" },
  { new_id:"616841ce0d47177dbb3f5193", old_id:"6154f27b3f80e6725c21b48d" },
  { new_id:"616841ce0d47177dbb3f5194", old_id:"6154f3ec3f80e6725c21b4d1" },
  { new_id:"616841ce0d47177dbb3f5196", old_id:"6154f4673f80e6725c21b4e1" },
  { new_id:"616841ce0d47177dbb3f5197", old_id:"6154f54d3f80e6725c21b503" },
  { new_id:"616841ce0d47177dbb3f5195", old_id:"6154f5e33f80e6725c21b523" },
  { new_id:"616841ce0d47177dbb3f519c", old_id:"6154f8183f80e6725c21b567" },
  { new_id:"616841ce0d47177dbb3f5199", old_id:"6154f9f03f80e6725c21b5d3" },
  { new_id:"616841ce0d47177dbb3f519a", old_id:"6154fb633f80e6725c21b607" },
  { new_id:"616841ce0d47177dbb3f519b", old_id:"6154fc6b3f80e6725c21b61f" },
  { new_id:"616841ce0d47177dbb3f519d", old_id:"6154fd283f80e6725c21b641" },
  { new_id:"616841ce0d47177dbb3f519f", old_id:"6154ff2e3f80e6725c21b66b" },
  { new_id:"616841ce0d47177dbb3f519e", old_id:"615500033f80e6725c21b683" },
  { new_id:"616841ce0d47177dbb3f51a3", old_id:"6155006b3f80e6725c21b693" },
  { new_id:"616841ce0d47177dbb3f51a0", old_id:"6155b4dae70e80d55706d472" },
  { new_id:"616841ce0d47177dbb3f51a1", old_id:"6156ee8b3cd2fbd18a23aafd" },
  { new_id:"616841ce0d47177dbb3f51a2", old_id:"615b32dff471eccd526bea4c" },
  { new_id:"616841ce0d47177dbb3f51a4", old_id:"615b39dff471eccd526beac2" },
  { new_id:"616841ce0d47177dbb3f51a5", old_id:"615b3ad4f471eccd526beae2" },
  { new_id:"616841ce0d47177dbb3f51a6", old_id:"615b3c7bf471eccd526beaf2" },
  { new_id:"616841ce0d47177dbb3f51a7", old_id:"615b3d4ff471eccd526beb2a" },
  { new_id:"616841ce0d47177dbb3f51ae", old_id:"615b3e00f471eccd526beb50" },
  { new_id:"616841ce0d47177dbb3f51a8", old_id:"615b3fb2f471eccd526beb8c" },
  { new_id:"616841ce0d47177dbb3f51ab", old_id:"615b4144f471eccd526bebe2" },
  { new_id:"616841ce0d47177dbb3f51ac", old_id:"615b41eaf471eccd526bec0a" },
  { new_id:"616841ce0d47177dbb3f51ad", old_id:"615b4303f471eccd526bec34" },
  { new_id:"616841ce0d47177dbb3f51a9", old_id:"615b440ef471eccd526bec4c" },
  { new_id:"616841ce0d47177dbb3f51af", old_id:"615b44fef471eccd526bec64" },
  { new_id:"616841ce0d47177dbb3f51aa", old_id:"615b45fdf471eccd526beca8" },
  { new_id:"616841ce0d47177dbb3f51b0", old_id:"615b46a4f471eccd526becc8" },
  { new_id:"616841ce0d47177dbb3f51b5", old_id:"615b4898f471eccd526becea" },
  { new_id:"616841ce0d47177dbb3f51b2", old_id:"615b49b7f471eccd526bed26" },
  { new_id:"616841ce0d47177dbb3f51b1", old_id:"615b4a2df471eccd526bed3e" },
  { new_id:"616841ce0d47177dbb3f51b3", old_id:"615b4a91f471eccd526bed56" },
  { new_id:"616841ce0d47177dbb3f51b6", old_id:"615b4b51f471eccd526bed83" },
  { new_id:"616841ce0d47177dbb3f51b7", old_id:"615b4bd7f471eccd526bed93" },
  { new_id:"616841ce0d47177dbb3f51b4", old_id:"615b4d99f471eccd526bedb5" },
  { new_id:"616841ce0d47177dbb3f51b9", old_id:"615b4f05f471eccd526bedf9" },
  { new_id:"616841ce0d47177dbb3f51ba", old_id:"615b5053f471eccd526bee2b" },
  { new_id:"616841ce0d47177dbb3f51b8", old_id:"615b5162f471eccd526bee5d" },
  { new_id:"616841ce0d47177dbb3f51bf", old_id:"615c101d145d0f1cbe484790" },
  { new_id:"616841ce0d47177dbb3f51bb", old_id:"615c1a611414b04c9e259977" },
  { new_id:"616841ce0d47177dbb3f51bc", old_id:"615c3cc4af676ff67153199b" },
  { new_id:"616841ce0d47177dbb3f51bd", old_id:"6160049f972374fa203d6ab1" },
  { new_id:"616841ce0d47177dbb3f51be", old_id:"616033621e07927995554edf" },
  { new_id:"616841ce0d47177dbb3f51c1", old_id:"6163efdae31425985ff424b6" },
  { new_id:"616841ce0d47177dbb3f51c2", old_id:"616545c8eade0b9e61b51683" },
  { new_id:"616841ce0d47177dbb3f51c3", old_id:"6165690c1890cb813a2d7da0" }
      ];
async.series({
  noteList: async function(callback) {
    const cloudinary = require('cloudinary').v2;
    var cl_error;
    var cl_result;

    noteList = await Note.find({}, callback);
    noteList.forEach(async function(xnote) {
      swap.forEach(async function(key, value) {
        if (xnote._id == key.new_id) {
          var subject_id = xnote.subject._id;
          var topic_id = xnote.topic._id;
          var subtopic_id = xnote.subtopic._id;
          var folder = subject_id + '/' + topic_id + '/' + subtopic_id;
          var srcFilePath = folder + '/' + key.old_id;
          var destFilePath = folder + '/' + key.new_id;
          console.log('move images for note titled ' + xnote.title + ' from ' + srcFilePath + ' to ' + destFilePath);

          await cloudinary.search
          .expression('resource_type:image AND folder:' + srcFilePath)
          .max_results(30)
          .execute().then(result=>cl_result = result)
          .catch(error => cl_error = error);
          var r =  cl_result.resources;
          for (let i = 0; i < r.length; i++) {
              let filename = r[i]['filename'];
              console.log('rename', filename);
              await cloudinary.uploader.rename(
                  srcFilePath + '/' + filename,
                  destFilePath + '/' + filename,
              {})
              .then(result => cl_result = result)
              .catch(error => cl_error = error);
              if (cl_error) {
                  console.log(cl_error);
                  return;
              }
          }
          await cloudinary.api.delete_folder(srcFilePath, {})
          .then(result => cl_result = result)
          .catch(error => cl_error = error);
          if (cl_error) {
              console.log(cl_error);
              return;
          }
          console.log('cloudinary response', cl_result);
        }
      });
    });
    console.log('disconnecting');
    mongoose.disconnect();
    return;
  
  }
});




