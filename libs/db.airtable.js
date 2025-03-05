const { config } = require("../config/config");
const Airtable = require("airtable");
const airtable = new Airtable({
  apiKey: config.airtable.apiKey,
});
const base = airtable.base(config.airtable.baseId);

module.exports = base;
