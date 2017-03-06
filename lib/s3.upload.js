'use strict';

require('dotenv').load();

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const fs = require('fs');

const mime = require('mime');
const path = require('path');
const crypto = require('crypto');

const s3Upload = (options) => {
  let mimeType = mime.lookup(options.path);
  let ext = path.extname(options.path);
  let folder = (new Date()).toISOString().split('T')[0];
  let stream = fs.createReadStream(options.path);

  // make a new promise
  return new Promise((resolve, reject) => {
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
  });
};

module.exports = s3Upload;
