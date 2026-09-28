const boom = require("@hapi/boom");

const AirtableCrud = require("../libs/airtable.crud");
const EventService = require("./event/event.service");
const bcrypt = require("bcrypt");
const { invalidateKeys } = require("../libs/redis.client");

const airtableCrud = new AirtableCrud();
const eventService = new EventService();

const tableName = "Users";

// Las dos claves bajo las que se cachea un usuario: `/auth/me` guarda el
// registro por id y signToken lo guarda por email al iniciar sesion. Las dos
// duran diez minutos, asi que una escritura tiene que borrar ambas o el login
// siguiente devuelve el perfil anterior.
const userCacheKeys = (id, email) => [
  id ? `user:${id}` : null,
  email ? `auth:user:${email}` : null,
];

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
  async findOneByEmail(email) {
    const fields = await airtableCrud.getRecords(tableName, {
      filterByFormula: `{userEmail} = "${email}"`,
    });
    if (!fields || fields.length === 0) {
      return false;
    }
    return fields[0];
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
    console.log("fields create account: ",fields);
    // Check of the user pass a google account
    if (fields?.provider === "google") {
      const googleFields = [
        {
          fields: {
            firstName: fields.given_name,
            lastName: fields.family_name,
            userEmail: fields.email,
            userRole: "Explorer",
            googleAccount: true,
          },
        },
      ];
      // Check if the email already exists
      const existingUser = await this.findOneByEmail(
        googleFields[0].fields.userEmail
      );
      // if the user already exists, return it
      if (existingUser) {
        return [existingUser];
      }
      // if the user doesnt exists, create it
      const newFields = await airtableCrud.createRecord(
        tableName,
        googleFields
      );

      return newFields;
    } else {
      // Check if the email already exists
      const existingUser = await this.findOneByEmail(
        fields[0].fields.userEmail
      );
      // if the user already exists, return it
      if (existingUser) {
        delete existingUser.password;
        return [existingUser];
      }

      const data = fields[0].fields;
      // if the user pass a password, hash it
      if (data.password) {
        const hash = await bcrypt.hash(data.password, 10);
        fields[0].fields.password = hash;
      }
      // if the user doesnt exists, create it
      const newFields = await airtableCrud.createRecord(tableName, fields);
      // delete password from response
      delete newFields[0].password;

      return newFields;
    }
  }

  async update(id, fields) {
    const updatedFields = await airtableCrud.updateRecord(
      tableName,
      id,
      fields
    );
    // La invalidacion vive aqui y no en la ruta porque auth.service escribe
    // usuarios directamente contra el servicio (recuperacion y cambio de
    // contrasena): en el router esas escrituras dejarian la cache obsoleta.
    await invalidateKeys(
      userCacheKeys(id, updatedFields?.userEmail || fields?.userEmail)
    );
    return updatedFields;
  }

  async delete(id) {
    // Se lee antes de borrar para conocer el email: `deleteRecord` solo
    // devuelve un booleano y despues ya no hay forma de saberlo.
    let email = null;
    try {
      const previo = await airtableCrud.getRecordById(tableName, id);
      email = previo?.userEmail || null;
    } catch (error) {
      console.log("no se pudo leer el usuario antes de borrarlo:", error.message);
    }

    const deletedFields = await airtableCrud.deleteRecord(tableName, id);
    if (!deletedFields) {
      throw boom.notFound("Record not found");
    }

    await invalidateKeys(userCacheKeys(id, email));
    return {
      message: "Element deleted",
      id,
    };
  }
}

module.exports = UserService;
