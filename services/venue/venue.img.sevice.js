const boom = require("@hapi/boom");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { CreateInvalidationCommand } = require("@aws-sdk/client-cloudfront");

const s3 = require("../../libs/aws.s3");
const { config } = require("../../config/config");
const cloudFront = require("../../libs/aws.cloudfront");

const AirtableCrud = require("../../libs/airtable.crud");
const { uploadKeyFor, s3KeyFor, permanentUrlFor } = require("../../libs/attachments");

const airtableCrud = new AirtableCrud();

const tableName = "tblQYWHTTuUDwrMgE";

const MAX_IMAGENES = 6;

// Airtable exige mandar el array entero al actualizar un campo de adjuntos, asi
// que para anadir uno hay que reenviar los que ya estaban. Se reenvian por su
// `id`, que Airtable acepta para conservarlos tal cual: por URL los volveria a
// descargar, y uno subido a mano en Airtable no esta en S3, de modo que la URL
// permanente daria 404 y el adjunto se perderia. La URL queda de respaldo por
// si algun adjunto llegara sin id.
const comoAdjuntos = (lista) =>
  lista
    .map((a) => {
      if (a?.id) return { id: a.id };
      const url = a?.url || permanentUrlFor(a?.filename);
      return url ? { url } : null;
    })
    .filter(Boolean);

const imagenesDe = (fields) =>
  Array.isArray(fields?.venueImage) ? fields.venueImage : [];

class VenueImgService {
  constructor() {
    //
  }

  async addImages(id, files) {
    const lista = (Array.isArray(files) ? files : [files]).filter(Boolean);
    if (lista.length === 0) {
      throw boom.badRequest("No se recibio ninguna imagen");
    }
    if (lista.some((f) => !`${f.mimetype || ""}`.startsWith("image/"))) {
      throw boom.badRequest("Solo se admiten imagenes");
    }

    const fields = await airtableCrud.getRecordById(tableName, id);
    if (!fields) {
      throw boom.notFound("Record not found");
    }

    const actuales = imagenesDe(fields);
    if (actuales.length + lista.length > MAX_IMAGENES) {
      throw boom.badRequest(
        `Un local admite como maximo ${MAX_IMAGENES} imagenes y ya tiene ${actuales.length}`
      );
    }

    const subidas = [];
    for (const file of lista) {
      // La clave lleva el ID del registro y un testigo: con el nombre a secas,
      // dos archivos igual llamados compartian un objeto y el segundo pisaba al
      // primero. Airtable devuelve este mismo nombre como `filename`, que es lo
      // que la lectura usa para rehacer la URL permanente.
      const key = uploadKeyFor(id, file.originalname);
      if (!key) {
        throw boom.badRequest("El archivo no tiene nombre");
      }

      await s3.send(
        new PutObjectCommand({
          Bucket: config.aws.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
      );

      subidas.push({ url: config.aws.cloudfrontDistributionDomain + key });
    }

    // Se anaden al final: la primera imagen es la portada que usan las listas,
    // y subir una foto mas no deberia cambiarla.
    const updatedFields = await airtableCrud.updateRecord(tableName, id, {
      venueImage: [...comoAdjuntos(actuales), ...subidas],
    });
    return updatedFields;
  }

  // Reordena sin tocar S3: basta con reenviar a Airtable los mismos adjuntos
  // en otro orden. `filenames` tiene que ser una permutacion de los actuales.
  async reorderImages(id, filenames) {
    if (!Array.isArray(filenames) || filenames.length === 0) {
      throw boom.badRequest("Falta el orden de las imagenes");
    }

    const fields = await airtableCrud.getRecordById(tableName, id);
    if (!fields) {
      throw boom.notFound("Record not found");
    }

    const actuales = imagenesDe(fields);
    if (actuales.length === 0) {
      throw boom.notFound("El registro no tiene imagenes");
    }

    // Se consume de una cola por nombre: los registros anteriores al testigo
    // en la clave pueden tener dos adjuntos con el mismo filename, y con un
    // mapa simple uno de ellos se duplicaria y el otro se perderia.
    const porNombre = new Map();
    actuales.forEach((a) => {
      const clave = a?.filename || "";
      if (!porNombre.has(clave)) porNombre.set(clave, []);
      porNombre.get(clave).push(a);
    });

    const ordenadas = [];
    for (const nombre of filenames) {
      const cola = porNombre.get(nombre);
      if (cola?.length) ordenadas.push(cola.shift());
    }

    if (ordenadas.length !== actuales.length) {
      throw boom.badRequest(
        "El orden recibido no coincide con las imagenes del local"
      );
    }

    return await airtableCrud.updateRecord(tableName, id, {
      venueImage: comoAdjuntos(ordenadas),
    });
  }

  // Sin `filename` borra todas, que es lo que hacia antes cuando solo habia
  // una. Con `filename` borra esa y conserva el resto.
  async deleteImage(id, filename = null) {
    const fields = await airtableCrud.getRecordById(tableName, id);
    if (!fields) {
      throw boom.notFound("Record not found");
    }

    const actuales = imagenesDe(fields);
    if (actuales.length === 0) {
      throw boom.notFound("El registro no tiene imagen");
    }

    const aBorrar = filename
      ? actuales.filter((a) => a?.filename === filename)
      : actuales;
    if (aBorrar.length === 0) {
      throw boom.notFound("El registro no tiene esa imagen");
    }

    // Mismo saneado que en la subida: la clave en S3 no lleva espacios, asi
    // que borrar con el filename crudo erraba el objeto y lo dejaba huerfano.
    const keys = aBorrar.map((a) => s3KeyFor(a?.filename)).filter(Boolean);
    if (keys.length === 0) {
      throw boom.notFound("El registro no tiene imagen");
    }

    for (const key of keys) {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: config.aws.bucketName,
          Key: key,
        })
      );
    }

    // Invalidate the images from CloudFront
    await cloudFront.send(
      new CreateInvalidationCommand({
        DistributionId: config.aws.cloudfrontDistributionId,
        InvalidationBatch: {
          CallerReference: `${Date.now()}`,
          Paths: {
            Quantity: keys.length,
            Items: keys.map((key) => `/${key}`),
          },
        },
      })
    );

    const restantes = actuales.filter((a) => !aBorrar.includes(a));
    const updatedFields = await airtableCrud.updateRecord(tableName, id, {
      venueImage: comoAdjuntos(restantes),
    });
    return updatedFields;
  }
}

module.exports = VenueImgService;
