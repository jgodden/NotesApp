require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// add your Public IDs
// Note that in the transformation array, if you want to use folders you need to use the ':' notation, i.e. 'folder:public_id'
const url = cloudinary.url('kitten', {
  transformation: [
    { width: 100, height: 100, crop: 'fill' },
    { overlay: 'woman', width: 100, height: 100, x: 100, crop: 'fill' },
    { overlay: 'giraffe', width: 100, height: 100, y: 100, x: -50, crop: 'fill' },
    { overlay: 'mrwhiskers', width: 100, height: 100, y: 50, x: 50, crop: 'fill' },
    { radius: 'max' },
    { effect: 'shadow' }
  ]
});

console.log(url);