const { S3Client } = require("@aws-sdk/client-s3");

const { config } = require("../config/config");

const s3 = new S3Client({
  region: config.aws.bucketRegion,
  credentials: {
    accessKeyId: config.aws.accessKey,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

module.exports = s3;
