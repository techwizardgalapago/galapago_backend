require("dotenv").config();

const config = {
  env: process.env.NODE_ENV || "dev",
  isProd: process.env.NODE_ENV === "production",
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET,
  recoveryJwtSecret: process.env.RECOVERY_JWT_SECRET,
  airtable: {
    apiKey: process.env.AIRTABLE_API_KEY,
    baseId: process.env.AIRTABLE_BASE_ID,
  },
  aws: {
    bucketName: process.env.BUCKET_NAME,
    bucketRegion: process.env.BUCKET_REGION,
    accessKey: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    cloudfrontDistributionId: process.env.CLOUD_FRONT_DIST_ID,
    cloudfrontDistributionDomain: process.env.CLOUD_FRONT_DIST_DOM_NAME,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
  },
  email: process.env.EMAIL,
  emailPass: process.env.EMAIL_PASS,
};

module.exports = { config };
