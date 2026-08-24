const base = require("./db.airtable");

class AirtableCrud {
  constructor() {
    this.base = base;
  }

  async getRecords(tableName, options) {
    const { maxRecords, pageSize, filterByFormula, sort } = options;
    let recordsArray = [];

    let filterByFormulaCrud = "";

    if (filterByFormula !== undefined) {
      filterByFormulaCrud = filterByFormula;
    }

    let sortCrud = [];
    if (sort !== undefined) {
      sortCrud = sort;
    }

    await this.base(tableName)
      .select({
        filterByFormula: `${filterByFormulaCrud}`,
        maxRecords: maxRecords || 100,
        // pageSize es cuantos registros trae Airtable POR PETICION (max 100).
        // Estaba en 1, asi que eachPage hacia una peticion por registro.
        pageSize: pageSize || 100,
        sort: sortCrud,
      })
      .eachPage((records, fetchNextPage) => {
        try {
          records?.forEach(function (record) {
            recordsArray.push(record.fields);
          });
          fetchNextPage();
        } catch (error) {
          console.log(error);
        }
      })
      .catch((error) => {
        // Propagar: si esto devolvia [] el caché guardaba una lista vacia
        // durante todo el TTL tras un fallo pasajero de Airtable.
        throw error;
      });

    return recordsArray;
  }

  async getRecordById(tableName, id) {
    let recordField = {};

    await this.base(tableName)
      .find(id)
      .then((record) => {
        recordField = { ...record.fields };
      })
      .catch((error) => {
        throw error;
      });

    return recordField;
  }

  async createRecord(tableName, fields) {
    let recordField = [];

    await this.base(tableName)
      .create(fields)
      .then((records) => {
        try {
          // recordField.push(records[0].fields);
          records?.forEach(function (record) {
            recordField.push(record.fields);
          });
        } catch (error) {
          console.log(error);
        }
      })
      .catch((error) => {
        // Sin este throw una escritura fallida respondia 200 con [] y la app
        // no podia distinguirla de una exitosa.
        throw error;
      });

    return recordField;
  }

  async updateRecord(tableName, id, fields) {
    let recordField = {};

    await this.base(tableName)
      .update(id, fields)
      .then((record) => {
        try {
          recordField = { ...record.fields };
        } catch (error) {
          console.log(error);
        }
      })
      .catch((error) => {
        throw error;
      });

    return recordField;
  }

  async updateMultipleRecords(tableName, records) {
    let updatedRecords = [];
    await this.base(tableName)
      .update(records)
      .then((records) => {
        try {
          records?.forEach(function (record) {
            updatedRecords.push(record.fields);
          });
        } catch (error) {
          console.log("Error updating records:", error);
        }
      })
      .catch((error) => {
        throw error;
      });
    return updatedRecords;
  }

  async deleteRecord(tableName, id) {
    let deleted = false;
    await this.base(tableName)
      .destroy(id)
      .then(() => {
        deleted = true;
      })
      .catch((error) => {
        throw error;
      });
    return deleted;
  }
}
module.exports = AirtableCrud;
