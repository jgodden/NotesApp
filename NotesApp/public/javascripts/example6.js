require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.uploader.upload('./images/61375d2a1b1267978091ff19.png', {
        folder: '61375d2a1b1267978091ff11/61375d2a1b1267978091ff05/61375d291b1267978091fee6/',
        public_id: '61375d2a1b1267978091ff19'
    })
    .then(uploadResult => console.log(uploadResult))
    .catch(error => console.error(error));