const { config } = require("../config/config");

/**
 * Airtable re-hospeda los adjuntos y firma sus URLs con caducidad (~8h), asi
 * que devuelve 410 pasado ese punto. Cualquier URL que la app cachee o guarde
 * en SQLite queda muerta.
 *
 * Los archivos subidos por la app si estan en S3 con `filename` como clave
 * (ver venue.img.sevice.js), asi que la URL permanente de CloudFront se puede
 * reconstruir. Se anade como `permanentUrl` SIN quitar la original: si algun
 * adjunto se cargo a mano en Airtable no estara en S3, y la app puede seguir
 * usando `url` como respaldo.
 */
const permanentUrlFor = (filename) => {
  const domain = config.aws.cloudfrontDistributionDomain;
  if (!domain || !filename) return null;
  return domain + filename;
};

const withPermanentUrls = (record, field) => {
  const images = record?.[field];
  if (!Array.isArray(images)) return record;

  record[field] = images.map((img) => {
    const permanentUrl = permanentUrlFor(img?.filename);
    return permanentUrl ? { ...img, permanentUrl } : img;
  });
  return record;
};

const mapWithPermanentUrls = (records, field) =>
  (Array.isArray(records) ? records : []).map((r) => withPermanentUrls(r, field));

module.exports = { permanentUrlFor, withPermanentUrls, mapWithPermanentUrls };
