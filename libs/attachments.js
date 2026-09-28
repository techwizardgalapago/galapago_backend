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

// Un adjunto subido por la app se guarda en S3 bajo su nombre de archivo. Dos
// registros con archivos del mismo nombre compartian entonces un solo objeto y
// la subida mas reciente reemplazaba a la anterior. El ID del registro lo hace
// unico.
//
// El prefijo va DENTRO del nombre, no como carpeta: Airtable re-hospeda el
// adjunto y reporta como `filename` solo el basename de la URL que le dimos,
// asi que 'events/recXXX/foto.png' volveria como 'foto.png'. Ademas getRecords
// devuelve unicamente record.fields, sin el ID, de modo que la lectura no
// tendria con que reconstruir la carpeta. Metido en el nombre, el filename que
// Airtable devuelve ya ES la clave y s3KeyFor sigue bastando.
// El prefijo incluye un testigo corto ademas del ID: un registro puede tener
// varias imagenes y dos fotos del mismo carrete se llaman igual muy a menudo
// ('IMG_0001.jpg'), asi que solo con el ID la segunda pisaria a la primera.
const PREFIJO_ID = /^rec[A-Za-z0-9]{14}_[0-9a-z]{8}_/;

const testigo = () =>
  (Date.now().toString(36) + Math.random().toString(36).slice(2)).slice(-8);

const uploadKeyFor = (recordId, filename) => {
  const base = s3KeyFor(filename);
  if (!base) return null;
  // Se quita un prefijo previo antes de poner el nuevo, para que volver a
  // subir un archivo ya descargado de la app no encadene IDs.
  const limpio = base.replace(PREFIJO_ID, "");
  return typeof recordId === "string" && recordId.trim()
    ? `${recordId}_${testigo()}_${limpio}`
    : limpio;
};

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

module.exports = {
  s3KeyFor,
  uploadKeyFor,
  permanentUrlFor,
  withPermanentUrls,
  mapWithPermanentUrls,
};
