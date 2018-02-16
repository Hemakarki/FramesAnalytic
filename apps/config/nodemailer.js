var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport( {
  service: 'gmail',
  auth: {
    user: 'smartdata.ms@gmail.com',
    pass: 'chd$$sdei022'
  }
});