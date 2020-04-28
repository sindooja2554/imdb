const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

let logger = require('../config/winston');
require('dotenv/').config();

const s3 = new aws.S3();

aws.config.update({
  secretAccessKey: `${process.env.SECRET_ACCESS_KEY}`,
  accessKeyId: `${process.env.ACCESS_KEY_ID}`,
  region: 'ap-south-1',
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: `${process.env.BUCKET_NAME}`,
    acl: 'private',

    metadata: function (req, file, cb) {
      cb(null, { fieldName: 'postermovie' });
    },

    key: function (req, file, cb) {
      cb(null, Date.now().toString());
    },
  }),
});

module.exports = upload;
