var cloud_name = 'ddpa7qntq';
var api_key = '127533828577153';
var username = 'jgodden@hotmail.com';
var unixTimestamp = Math.floor(Date.now() / 1000);
var enc_sig = document.getElementById('enc_sig').value;
var subjectid = document.getElementById('subjectid').value;
var topicid = document.getElementById('topicid').value;
var subtopicid = document.getElementById('subtopicid').value;
var noteid = document.getElementById('noteid').value;
var folder = subjectid + '/' + topicid + '/' + subtopicid + '/' + noteid;

var mediaLibraryWidget = cloudinary.createMediaLibrary({
    cloud_name: cloud_name,
    signature: enc_sig,
    api_key: api_key,
    username: username,
    timestamp: unixTimestamp,
    button_class: 'btn',
    button_caption: 'Select Image or Video',
  });

  var imageBtn = document.getElementById('image_button');
  imageBtn.onclick = function() {mediaLibraryWidget.show({folder: {path: folder}})};
