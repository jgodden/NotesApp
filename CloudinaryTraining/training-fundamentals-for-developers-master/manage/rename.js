require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.uploader.rename('kitten', 'small-kitten')
  .then(result => console.log(result))
  .catch(error => console.error(error));
