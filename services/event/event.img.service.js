const ImageCollection = require("../../libs/image.collection");

// La galeria vive en libs/image.collection.js, compartida con los locales.
class EventImgService extends ImageCollection {
  constructor() {
    super({ tableName: "tblqkq5UMENrV5Ff1", field: "eventImage" });
  }
}

module.exports = EventImgService;
