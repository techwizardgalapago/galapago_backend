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
// La subida guarda el objeto con este mismo saneado como clave
// (ver venue.img.sevice.js), asi que la reconstruccion tiene que aplicarlo
// igual para dar con el archivo.
const s3KeyFor = (filename) =>
  typeof filename === "string" && filename.trim()
    ? filename.replace(/ /g, "_")
    : null;

const permanentUrlFor = (filename) => {
  const domain = config.aws.cloudfrontDistributionDomain;
  const key = s3KeyFor(filename);
  if (!domain || !key) return null;
  // La clave se codifica: algunos nombres que vienen de Airtable ya contienen
  // secuencias % (p.ej. '...6.33.14%C3%A2%C2%80%C2%AFPM.png'). Puestas crudas
  // en la URL, el CDN las decodificaria a otros bytes y no encontraria el
  // objeto. Codificar hace que se decodifiquen de vuelta a la clave exacta.
  return domain + encodeURIComponent(key);
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

module.exports = { s3KeyFor, permanentUrlFor, withPermanentUrls, mapWithPermanentUrls };
