require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.api.update("eager-kitten", {
    tags: "baby"
  })
  .then(updateResult => console.log(updateResult))
  .catch(error => console.error(error));
