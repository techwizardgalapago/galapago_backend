const { CloudFrontClient } = require("@aws-sdk/client-cloudfront");
const { config } = require("../config/config");

const cloudFront = new CloudFrontClient({
  region: config.aws.bucketRegion,
  credentials: {
    accessKeyId: config.aws.accessKey,
    secretAccessKey: config.aws.secretAccessKey,
  },
});
module.exports = cloudFront;
