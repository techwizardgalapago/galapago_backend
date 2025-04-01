const boom = require("@hapi/boom");

const AirtableCrud = require("../../libs/airtable.crud");
const VenueScheduleService = require("../venue/venue.schedule.service");

const airtableCrud = new AirtableCrud();
const scheduleService = new VenueScheduleService();

const tableName = "tblqkq5UMENrV5Ff1";

class EventService {
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

    options.sort = [{ field: "startTime", direction: "desc" }];

    const fields = await airtableCrud.getRecords(tableName, options);

    function obtenerFechaLocal(fechaISO) {
      const fecha = new Date(fechaISO);
      return fecha.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    }

    // Objeto para agrupar eventos por fecha local
    const eventosAgrupados = {};

    fields.forEach((evento) => {
      const fechaLocal = obtenerFechaLocal(evento.startTime);
      if (!eventosAgrupados[fechaLocal]) {
        eventosAgrupados[fechaLocal] = [];
      }
      eventosAgrupados[fechaLocal].push(evento);
    });

    // Convertir el objeto en un array de objetos con formato { fecha: "YYYY-MM-DD", eventos: [...] }
    const resultado = Object.entries(eventosAgrupados).map(([fecha]) => ({
      fecha,
      eventos: eventosAgrupados[fecha],
    }));

    return await resultado;
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

module.exports = EventService;
