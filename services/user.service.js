const boom = require("@hapi/boom");

const AirtableCrud = require("../libs/airtable.crud");
const EventService = require("./event/event.service");

const airtableCrud = new AirtableCrud();
const eventService = new EventService();

const tableName = "Users";

class UserService {
  constructor() {
    //
  }

  async find(query) {
    const { limit, offset, filterField, filterValue } = query;

    let options = {};

    if (limit) {
      options.maxRecords = parseInt(limit);
    }
    if (limit && offset) {
      options.maxRecords = parseInt(limit);
      options.pageSize = parseInt(offset);
    }

    if (filterField && filterValue) {
      options.filterByFormula = `{${filterField}} = "${filterValue}"`;
    }

    const fields = await airtableCrud.getRecords(tableName, options);
    // Get the event for each user
    const usersWithEvent = await Promise.all(
      fields.map(async (user) => {
        const event = await eventService.find({
          filterField: "eventUsers",
          filterValue: user.userID,
        });
        // Add the event to the user object
        user.userEvents = await event;
        return user;
      })
    );
    return usersWithEvent;
  }

  async findOne(id) {
    const fields = await airtableCrud.getRecordById(tableName, id);
    if (!fields) {
      throw boom.notFound("Record not found");
    }
    // Get the event for the user
    const event = await eventService.find({
      filterField: "eventUsers",
      filterValue: fields.userID,
    });
    // Add the event to the user object
    fields.userEvents = await event;
    return fields;
  }

  async create(fields) {
    const newFields = await airtableCrud.createRecord(tableName, fields);
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
      throw boom.notFound("Record not found");
    }
    return {
      message: "Element deleted",
      id,
    };
  }
}

module.exports = UserService;
