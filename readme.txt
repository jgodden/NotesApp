install node.js from https://nodejs.org/en/download/ 
if running scripts is restricted, see https://stackoverflow.com/questions/16460163/ps1-cannot-be-loaded-because-the-execution-of-scripts-is-disabled-on-this-syste 

Database
MongoDB
Download the server here https://www.mongodb.com/download-center 

Mongo details
 Remote connection (using Atlas)
  User: Admin
  Password: M4rmoset52
  Connection URL: mongodb+srv://Admin:M4rmoset52@cluster0.j8m3g.mongodb.net/NotesApp?retryWrites=true&w=majority
 Local Connection
  User/Password: running as Network Service
  Connection URL: mongodb://127.0.0.1:27017/local

Make sure bootstrap is uninstalled. It's functionality is provided by popper

Cloudinary
For remote image management, use Cloudinary
For local, store to file system using same structure as in Cloudinary (ids for subject/topic/subtopic/note)