const AirtableCrud = require("../libs/airtable.crud");

const airtableCrud = new AirtableCrud();

const tableName = "Users";

class UserService {
  constructor() {
    //
  }

  async find(query) {
    const { limit, offset } = query;

    let options = {};

    if (limit) {
      options.maxRecords = parseInt(limit);
    }
    if (limit && offset) {
      options.maxRecords = parseInt(limit);
      options.pageSize = parseInt(offset);
    }
    const fields = await airtableCrud.getRecords(tableName, options);
    return fields;
  }

  async findOne(id) {
    const fields = await airtableCrud.getRecordById(tableName, id);
    if (!fields) {
      throw new Error("Record not found");
    }
    return fields;
  }

  async create(fields) {
    const newFields = await airtableCrud.createRecord(tableName, fields);
    console.log("newFields", newFields);
    return newFields;
  }

  async update(id, fields) {
    const updatedFields = await airtableCrud.updateRecord(
      tableName,
      id,
      fields
    );
    return updatedFields;
  }

  async delete(id) {
    const deletedFields = await airtableCrud.deleteRecord(tableName, id);
    if (!deletedFields) {
      return {
        message: "Record not found",
        id,
      };
    }
    return {
      message: "Element deleted",
      id,
    };
  }
}

module.exports = UserService;
