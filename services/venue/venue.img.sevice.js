const ImageCollection = require("../../libs/image.collection");

// La galeria vive en libs/image.collection.js, compartida con los eventos.
class VenueImgService extends ImageCollection {
  constructor() {
    super({ tableName: "tblQYWHTTuUDwrMgE", field: "venueImage" });
  }
}

module.exports = VenueImgService;
