'use strict';

require('dotenv').load();

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const fs = require('fs');

const mime = require('mime');
const path = require('path');
const crypto = require('crypto');

let file = {
  path: process.argv[2],
  title: process.argv[3]
};

// use modules above to grab certain things for our file
let mimeType = mime.lookup(file.path);
let ext = path.extname(file.path);
let folder = (new Date()).toISOString().split('T')[0];
let stream = fs.createReadStream(file.path);

// make a new promise
new Promise((resolve, reject) => {
  // get random bytes and turn it into a string if successful
  crypto.randomBytes(16, (error, buffer) => {
    // if crypto.randomBytes fails, reject the promise
    if (error) {
      reject(error);
    }
    else {
      console.log("buffer is ", buffer);
      console.log("buffer.toS is ", buffer.toString('hex'));
      resolve(buffer.toString('hex'));
    }
  });
})
// only runs if the first promise succeeds
.then((filename) => {
  let params = {
    ACL: 'public-read',
    ContentType: mimeType,
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${folder}/${filename}${ext}`,
    Body: stream
  };

  // create a new promise
  // by default, s3.upload doesn't return a promise, so we need to promisify
  // s3.upload is the trigger
  // whatever gets returned is either a resolved or rejected promise
  return new Promise((resolve, reject) => {
    s3.upload(params, function(error, data){
      if (error) {
        reject(error);
      }
      else {
        resolve(data);
      }
    });
  });
})
.then(console.log)
.catch(console.error);
