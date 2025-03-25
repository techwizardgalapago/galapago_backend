const boom = require("@hapi/boom");

const AirtableCrud = require("../../libs/airtable.crud");

const airtableCrud = new AirtableCrud();

const tableName = "tblSXgNXDk1oUdicJ";

class VenueScheduleService {
  constructor() {
    //
  }

  async find(query) {
    const { limit, offset, filterByFormula } = query;

    let options = {};

    if (limit) {
      options.maxRecords = parseInt(limit);
    }
    if (limit && offset) {
      options.maxRecords = parseInt(limit);
      options.pageSize = parseInt(offset);
    }
  
    if (filterByFormula) { 
      options.filterByFormula = "{linkedVenue} = '" + filterByFormula + "'";
    }
    const fields = await airtableCrud.getRecords(tableName, options);
    return fields;
  }

  async findOne(id) {
    const fields = await airtableCrud.getRecordById(tableName, id);
    if (!fields) {
      throw boom.notFound("Record not found");
    }
    return fields;
  }

  async create(fields) {
    const newFields = await airtableCrud.createRecord(tableName, fields);
    return newFields;
  }

  async update(id, fields) {
    const updatedFields = await airtableCrud.updateMultipleRecords(
      tableName,
      fields
    );
    return updatedFields;
  }

  async delete(id) {
    const deletedFields = await airtableCrud.deleteRecord(tableName, id);
    if (!deletedFields) {
      throw boom.notFound("Record not found");
    }
    return {
      message: "Element deleted",
      id,
    };
  }
}

module.exports = VenueScheduleService;
