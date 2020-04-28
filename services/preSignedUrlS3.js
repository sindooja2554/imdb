const AWS = require('aws-sdk');
const fs = require('fs');

require('dotenv/').config();

let s3 = new AWS.S3();

s3.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: 'ap-south-1',
  acl: 'Authenticated-read',
});

module.exports = {
  getSignedUrl(req, callback) {
    let params = {
      Bucket: process.env.BUCKET_NAME,
      Key: req.file.originalname,
      Expires: 3600,
    };

    fs.readFile(req.file.path, function (error, data) {
      if (error) {
        return callback(error);
      } else {
        params.Body = data;
        s3.upload(params, function (err, data) {
          s3.getSignedUrl('putObject', params, (error, data) => {
            if (error) {
              return callback(error);
            } else {
              let url = data.split('?')[0];
              return callback(null, url);
            }
          });
        });
      }
    });
  },
};
