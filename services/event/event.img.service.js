const boom = require("@hapi/boom");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { CreateInvalidationCommand } = require("@aws-sdk/client-cloudfront");

const s3 = require("../../libs/aws.s3");
const { config } = require("../../config/config");
const cloudFront = require("../../libs/aws.cloudfront");

const AirtableCrud = require("../../libs/airtable.crud");

const airtableCrud = new AirtableCrud();

const tableName = "tblqkq5UMENrV5Ff1";

class EventImgService {
  constructor() {
    //
  }

  async updateImage(id, file) {
    // Replace spaces with underscores
    file.originalname = file.originalname.replace(/ /g, "_");

    // Upload the image to S3
    const params = {
      Bucket: config.aws.bucketName,
      Key: file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);

    const imageUrl =
      config.aws.cloudfrontDistributionDomain + file.originalname;

    // upload image to airtable
    const newFields = { eventImage: [{ url: imageUrl }] };
    const updatedFields = await airtableCrud.updateRecord(
      tableName,
      id,
      newFields
    );
    return updatedFields;
  }

  async deleteImage(id) {
    // Get the image filename from Airtable
    const fields = await airtableCrud.getRecordById(tableName, id);
    if (!fields) {
      throw boom.notFound("Record not found");
    }

    const filename = fields?.eventImage[0]?.filename;

    const params = {
      Bucket: config.aws.bucketName,
      Key: filename,
    };
    // Delete the image from S3
    const command = new DeleteObjectCommand(params);
    await s3.send(command);

    // Invalidate the image from CloudFront
    const invalidationParams = {
      DistributionId: config.aws.cloudfrontDistributionId,
      InvalidationBatch: {
        CallerReference: `${Date.now()}`,
        Paths: {
          Quantity: 1,
          Items: [`/${filename}`],
        },
      },
    };

    const invalidationCommand = new CreateInvalidationCommand(
      invalidationParams
    );
    await cloudFront.send(invalidationCommand);

    // Delete the image from Airtable
    const newFields = { eventImage: [] };
    const updatedFields = await airtableCrud.updateRecord(
      tableName,
      id,
      newFields
    );
    return updatedFields;
  }
}

module.exports = EventImgService;
