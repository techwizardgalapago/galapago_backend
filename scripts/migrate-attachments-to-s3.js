/**
 * Copia a S3 los adjuntos que solo viven en Airtable.
 *
 *   node scripts/migrate-attachments-to-s3.js            # simulacro
 *   node scripts/migrate-attachments-to-s3.js --apply    # sube de verdad
 *
 * Por que hace falta: Airtable firma las URLs de adjuntos con caducidad y
 * responde 410 al vencer. Las imagenes subidas desde la app ya estan en S3, y
 * la API reconstruye su URL permanente a partir de `filename`. Las que se
 * cargaron a mano en la interfaz de Airtable no tienen archivo en S3, asi que
 * no hay nada que reconstruir hasta que se copien.
 *
 * No escribe nada en Airtable: solo deja el objeto en S3 bajo la misma clave
 * que la API espera. Es idempotente, salta lo que ya existe.
 */
const { PutObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");

const s3 = require("../libs/aws.s3");
const { config } = require("../config/config");
const { s3KeyFor } = require("../libs/attachments");
const AirtableCrud = require("../libs/airtable.crud");

const airtableCrud = new AirtableCrud();

// tabla -> campo de adjuntos
const OBJETIVOS = [
  { nombre: "tourist-sites", tableName: "tbloTPFdpTxXTd3KM", field: "siteImage" },
  { nombre: "venues", tableName: "tblQYWHTTuUDwrMgE", field: "venueImage" },
  { nombre: "events", tableName: "tblqkq5UMENrV5Ff1", field: "eventImage" },
];

const APLICAR = process.argv.includes("--apply");

const existeEnS3 = async (key) => {
  try {
    await s3.send(
      new HeadObjectCommand({ Bucket: config.aws.bucketName, Key: key })
    );
    return true;
  } catch (e) {
    const status = e?.$metadata?.httpStatusCode;
    // 404 es lo esperado cuando falta la clave. Pero si el usuario IAM no
    // tiene s3:ListBucket, S3 responde 403 para no revelar que existe o no;
    // el SDK lo presenta como 'UnknownError'. En ambos casos damos el objeto
    // por ausente y dejamos que sea PutObject quien mande: si de verdad
    // faltaran permisos, la subida fallara y se vera en el resumen.
    if (status === 404 || status === 403 || e?.name === "NotFound") return false;
    throw e;
  }
};

const descargar = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`descarga ${res.status}`);
  return {
    buffer: Buffer.from(await res.arrayBuffer()),
    contentType: res.headers.get("content-type") || "application/octet-stream",
  };
};

(async () => {
  if (!config.aws.bucketName) {
    console.error("Falta BUCKET_NAME en el entorno. Aborta.");
    process.exit(1);
  }
  console.log(APLICAR ? "MODO REAL: se subiran archivos\n" : "SIMULACRO: no se sube nada (usa --apply)\n");

  const resumen = { yaEstaban: 0, subidos: 0, sinArchivo: 0, fallidos: 0 };
  const vistas = new Map(); // clave -> nº de adjuntos que la reclaman

  for (const { nombre, tableName, field } of OBJETIVOS) {
    console.log(`--- ${nombre}`);
    const registros = await airtableCrud.getRecords(tableName, { maxRecords: 10000 });

    for (const registro of registros) {
      const adjuntos = Array.isArray(registro?.[field]) ? registro[field] : [];
      for (const adjunto of adjuntos) {
        const key = s3KeyFor(adjunto?.filename);
        if (key) vistas.set(key, (vistas.get(key) || 0) + 1);
        if (!key) {
          resumen.sinArchivo++;
          console.log(`  ?  adjunto sin filename, se omite`);
          continue;
        }
        try {
          if (await existeEnS3(key)) {
            resumen.yaEstaban++;
            console.log(`  =  ${key} (ya en S3)`);
            continue;
          }
          if (!APLICAR) {
            resumen.subidos++;
            console.log(`  +  ${key} (se subiria)`);
            continue;
          }
          const { buffer, contentType } = await descargar(adjunto.url);
          await s3.send(
            new PutObjectCommand({
              Bucket: config.aws.bucketName,
              Key: key,
              Body: buffer,
              ContentType: contentType,
            })
          );
          resumen.subidos++;
          console.log(`  +  ${key} (${(buffer.length / 1024).toFixed(0)} kb)`);
        } catch (e) {
          resumen.fallidos++;
          const status = e?.$metadata?.httpStatusCode;
          console.log(
            `  x  ${key}: ${e.name || "Error"}${status ? ` (HTTP ${status})` : ""} ${e.message || ""}`.trim()
          );
        }
      }
    }
  }

  const colisiones = [...vistas.entries()].filter(([, n]) => n > 1);
  if (colisiones.length) {
    console.log("\nAVISO: varios adjuntos comparten la misma clave en S3.");
    console.log("La subida usa el nombre de archivo como clave, asi que el ultimo");
    console.log("en subirse pisa al anterior y ambos registros acaban con la misma");
    console.log("imagen. Afecta tambien a las subidas normales desde la app.");
    colisiones.forEach(([k, n]) => console.log(`  ${n}x  ${k}`));
  }

  console.log("\nresumen:", resumen);
  if (!APLICAR && resumen.subidos) {
    console.log("\nVuelve a ejecutarlo con --apply para subirlos.");
  }
})();
