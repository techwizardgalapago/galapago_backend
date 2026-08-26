const boom = require("@hapi/boom");

const AirtableCrud = require("../../libs/airtable.crud");
const VenueScheduleService = require("../venue/venue.schedule.service");
const { withPermanentUrls, mapWithPermanentUrls } = require("../../libs/attachments");

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

    // Antes esto lanzaba una consulta de horarios POR LOCAL. Con el limite de
    // ~5 peticiones/segundo de Airtable, listar los locales era la operacion
    // que agotaba la cuota. Ahora se traen todos los horarios de una vez y se
    // agrupan en memoria: 2 consultas en total, independiente del numero de
    // locales.
    const allSchedules = await scheduleService.findAll();

    const byVenue = new Map();
    for (const schedule of allSchedules || []) {
      const linked = Array.isArray(schedule?.linkedVenue)
        ? schedule.linkedVenue
        : [schedule?.linkedVenue].filter(Boolean);
      for (const venueId of linked) {
        if (!byVenue.has(venueId)) byVenue.set(venueId, []);
        byVenue.get(venueId).push(schedule);
      }
    }

    for (const venue of fields) {
      venue.VenueSchedules = byVenue.get(venue.venueID) || [];
    }

    return mapWithPermanentUrls(fields, "venueImage");
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

    return withPermanentUrls(fields, "venueImage");
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
    // Get the schedule for the venue
    const schedule = await scheduleService.find({
      filterField: "linkedVenue",
      filterValue: updatedFields.venueID,
    });
    // Add the schedule to the venue object
    updatedFields.VenueSchedules = await schedule;

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
