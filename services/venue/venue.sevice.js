const boom = require("@hapi/boom");

const AirtableCrud = require("../../libs/airtable.crud");
const VenueScheduleService = require("../venue/venue.schedule.service");

const airtableCrud = new AirtableCrud();
const scheduleService = new VenueScheduleService();

const tableName = "tblQYWHTTuUDwrMgE";

class VenueService {
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
    // Get the schedule for each venue
    const venuesWithSchedule = await Promise.all(
      fields.map(async (venue) => {
        const schedule = await scheduleService.find({
          filterField: "linkedVenue",
          filterValue: venue.venueID,
        });
        // Add the schedule to the venue object
        venue.VenueSchedules = await schedule;
        return venue;
      })
    );
    // Return the venues with their schedules
    return await venuesWithSchedule;
  }

  async findOne(id) {
    const fields = await airtableCrud.getRecordById(tableName, id);
    if (!fields) {
      throw boom.notFound("Record not found");
    }
    // Get the schedule for the venue
    const schedule = await scheduleService.find({
      filterField: "linkedVenue",
      filterValue: fields.venueID,
    });
    // Add the schedule to the venue object
    fields.VenueSchedules = await schedule;

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

module.exports = VenueService;
