const boom = require("@hapi/boom");
const AirtableCrud = require("../../libs/airtable.crud");
const { withPermanentUrls, mapWithPermanentUrls } = require("../../libs/attachments");

const airtableCrud = new AirtableCrud();

// Replace with the actual Airtable table ID for TouristSites
const tableName = "tbloTPFdpTxXTd3KM";

class TouristSiteService {
  constructor() {}

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
    return mapWithPermanentUrls(fields, "siteImage");
  }

  async findOne(id) {
    const fields = await airtableCrud.getRecordById(tableName, id);
    if (!fields || Object.keys(fields).length === 0) {
      throw boom.notFound("Tourist site not found");
    }
    return withPermanentUrls(fields, "siteImage");
  }
}

module.exports = TouristSiteService;
