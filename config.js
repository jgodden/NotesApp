var dotenv = require('dotenv');
const path = require('path');
var env = process.env.NODE_ENV;
if ((env != 'development') && (env != 'production')) {
  env = 'production';
}
dotenv.config({
  path: path.resolve(__dirname, `${env}.env`)
});

module.exports = {
  NODE_ENV : process.env.NODE_ENV || 'development',
  HOST : process.env.HOST || 'localhost',
  PORT : process.env.PORT || 3000,
  CLOUDINARY_URL : process.env.CLOUDINARY_URL,
  AUTH0_CLIENT_ID : process.env.AUTH0_CLIENT_ID,
  AUTH0_DOMAIN : process.env.AUTH0_DOMAIN,
  AUTH0_CLIENT_SECRET : process.env.AUTH0_CLIENT_SECRET,
  MONGODB_URI : process.env.MONGODB_URI
}