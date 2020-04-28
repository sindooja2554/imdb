// const aws = require('aws-sdk');
// const sts = new aws.STS({apiVersion: '2011-06-15'});
// var logger = require('../config/winston');
// require('dotenv/').config();

// // aws.config.update({
// //     secretAccessKey: `${process.env.SECRET_ACCESS_KEY}`,
// //     accessKeyId: `${process.env.ACCESS_KEY_ID}`,
// //     region: 'ap-south-1'
// // })
// console.log(`secret key ${aws.config.credentials}`)
// console.log(`accesskeyID= ${process.env.ACCESS_KEY_ID}`)

// const bucketPolicy =
// `{
//     "Version": "2012-10-17",
//     "Statement": [
//         {
//             "Sid": "VisualStudioCode",
//             "Effect": "Allow",
//             "Action": [
//                 "s3:PutObject",
//                 "s3:GetObject"
//             ],
//             "Resource": [
//                 "arn:aws:s3:::movieposter/*"
//             ]
//         }
//     ]
// }`;

// var role = {
//     RoleArn : 'arn:aws:iam::364946422241:role/webClientRole',
//     Policy : bucketPolicy, // Resultant policy is the intersection of AwazonS3FullAccess and bucketPolicy
//     RoleSessionName : 'webClientRole',
//     DurationSeconds : 3600 // 1 hour
// };

// sts.assumeRole(role, (error,data) => {
//     if(error) {
//         logger.error("error==============>"+error);
//         console.log(error)
//     } else {
//         logger.info({
//             accessKeyId : data.Credentials.AccessKeyId,
//             secretAccessKey : data.Credentials.SecretAccessKey,
//             sessionToken : data.Credentials.SessionToken
//         });
//     }
// });

let AWS = require('aws-sdk');

// AWS.config.credentials = new AWS.Credentials("AKIAJTN6WZYXTU6CN7DA", "5Y/fKMhABSa5X7c3oDqVe2vLxY7a67nrHpZH5fA3")
// console.log(AWS.config.credentials)

// AWS.config.credentials = new AWS.TemporaryCredentials()
// // DurationSeconds = 1200;

// console.log ('====')
// console.log (AWS.config.credentials)

AWS.config.region = 'ap-south-1'; // Sydney
AWS.config.apiVersion = '2012-05-04';

function getEC2Rolename(AWS) {
  let promise = new Promise((resolve, reject) => {
    let metadata = new AWS.MetadataService();
    metadata.request('/latest/meta-data/iam/security-credentials/', function (
      err,
      rolename
    ) {
      if (err) {
        reject(err);
      }
      console.log(rolename);
      resolve(rolename);
    });
  });

  return promise;
}

function getEC2Credentials(AWS, rolename) {
  let promise = new Promise((resolve, reject) => {
    let metadata = new AWS.MetadataService();
    metadata.request(
      '/latest/meta-data/iam/security-credentials/' + rolename,
      function (err, data) {
        if (err) {
          reject(err);
        }
        resolve(JSON.parse(data));
      }
    );
  });

  return promise;
}

getEC2Rolename(AWS)
  .then((rolename) => {
    console.log('rolename=======>', rolename);
    return getEC2Credentials(AWS, rolename);
  })
  .then((credentials) => {
    AWS.config.accessKeyId = credentials.AccessKeyId;
    AWS.config.secretAccessKey = credentials.SecretAccessKey;
    AWS.config.sessionToken = credentials.Token;
    console.log('aws=====================>', AWS.config);
  })
  .catch((err) => {
    console.log(err);
  });
