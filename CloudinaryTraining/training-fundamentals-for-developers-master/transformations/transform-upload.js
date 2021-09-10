require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.uploader.upload('assets/images/kitten.jpg', {
  public_id: 'eager-kitten',
  upload_preset: 'training_transformation_apply'
})
.then(uploadResult => console.log(uploadResult))
.catch(error => console.error(error));
