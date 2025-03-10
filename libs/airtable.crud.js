const base = require("./db.airtable");

class AirtableCrud {
  constructor() {
    this.base = base;
  }

  async getRecords(tableName, options) {
    const { maxRecords, pageSize } = options;
    let recordsArray = [];

    await this.base(tableName)
      .select({
        maxRecords: maxRecords || 3,
        pageSize: pageSize || 1,
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
        console.error(error);
        return false;
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
        console.error(error);
        return false;
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
        console.error(error);
        return false;
      });

    return recordField;
  }

  async updateRecord(tableName, id, fields) {
    let recordField = {};

    await this.base(tableName)
      .update(id, fields)
      .then((record) => {
        try {
          console.log("records", record);
          recordField = { ...record.fields };
        } catch (error) {
          console.log(error);
        }
      })
      .catch((error) => {
        console.error(error);
        return false;
      });

    return recordField;
  }

  async deleteRecord(tableName, id) {
    let deleted = false;
    await this.base(tableName)
      .destroy(id)
      .then(() => {
        deleted = true;
      })
      .catch((error) => {
        console.error("Error deleting record:", error);
        deleted = false;
      });
    return deleted;
  }
}
module.exports = AirtableCrud;
