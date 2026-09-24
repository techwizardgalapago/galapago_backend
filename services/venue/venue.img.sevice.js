const boom = require("@hapi/boom");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { CreateInvalidationCommand } = require("@aws-sdk/client-cloudfront");

const s3 = require("../../libs/aws.s3");
const { config } = require("../../config/config");
const cloudFront = require("../../libs/aws.cloudfront");

const AirtableCrud = require("../../libs/airtable.crud");
const { uploadKeyFor, s3KeyFor } = require("../../libs/attachments");

const airtableCrud = new AirtableCrud();

const tableName = "tblQYWHTTuUDwrMgE";

class VenueImgService {
  constructor() {
    //
  }

  async updateImage(id, file) {
    // La clave lleva el ID del registro: con el nombre a secas, dos registros
    // con archivos igual llamados compartian un objeto y el segundo pisaba al
    // primero. Airtable devuelve este mismo nombre como `filename`, que es lo
    // que la lectura usa para rehacer la URL permanente.
    const key = uploadKeyFor(id, file.originalname);
    if (!key) {
      throw boom.badRequest("El archivo no tiene nombre");
    }

    // Upload the image to S3
    const params = {
      Bucket: config.aws.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);

    const imageUrl = config.aws.cloudfrontDistributionDomain + key;

    // upload image to airtable
    const newFields = { venueImage: [{ url: imageUrl }] };
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

    // Mismo saneado que en la subida: la clave en S3 no lleva espacios, asi
    // que borrar con el filename crudo erraba el objeto y lo dejaba huerfano.
    const filename = fields?.venueImage[0]?.filename;
    const key = s3KeyFor(filename);
    if (!key) {
      throw boom.notFound("El registro no tiene imagen");
    }

    const params = {
      Bucket: config.aws.bucketName,
      Key: key,
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
          Items: [`/${key}`],
        },
      },
    };

    const invalidationCommand = new CreateInvalidationCommand(
      invalidationParams
    );
    await cloudFront.send(invalidationCommand);

    // Delete the image from Airtable
    const newFields = { venueImage: [] };
    const updatedFields = await airtableCrud.updateRecord(
      tableName,
      id,
      newFields
    );
    return updatedFields;
  }
}

module.exports = VenueImgService;
