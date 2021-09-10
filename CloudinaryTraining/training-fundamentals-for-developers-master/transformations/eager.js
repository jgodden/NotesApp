require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.api.update_upload_preset('training_transformation_apply', {
  unsigned: false,
  eager_unsigned: true,
  eager_notification_url: "https://webhook.site/07a5c86f-ae37-4d60-a65b-c89c9f23b00d",
  eager: [{
    width: 400,
    height: 300,
    crop: 'fill',
    gravity: 'face'
  }, {
    width: 260,
    height: 200,
    crop: "crop",
    gravity: "north"
  }]
})
.then(uploadResult => console.log(uploadResult))
.catch(error => console.error(error));
