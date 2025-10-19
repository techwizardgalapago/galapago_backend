const boom = require("@hapi/boom");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const UserService = require("./user.service");
const { config } = require("../config/config");

const service = new UserService();

class AuthService {
  constructor() {
    //
  }

  async getUser(email, password) {
    const user = [];
    console.log("Authenticating user with email:", email, "and password:", password);
    const fields = await service.findOneByEmail(email);
    console.log("Found user fields:", fields);
    console.log("is there a user?", !!fields);
    if (!fields) {
      console.log("Unauthorized: No user found");
      throw boom.unauthorized();
    }

    const isMatch = await bcrypt.compare(password, fields.password);
    if (!isMatch) {
      console.log("Unauthorized: Password does not match");
      throw boom.unauthorized();
    }

    delete fields.password;
    user[0] = { fields: fields };
    return user;
  }

  async signToken(user) {
    const fields = await service.create(user);
    console.log("fields", fields);
    const payload = {
      sub: fields[0].userID,
      role: fields[0].userRole,
    };

    const secret = config.jwtSecret;

    const token = jwt.sign(payload, secret);

    return { fields, token };
  }

  async sendRecovery(email) {
    const user = await service.findOneByEmail(email);
    if (!user) {
      throw boom.unauthorized();
    }
    const payload = { sub: user.userID };

    const token = jwt.sign(payload, config.recoveryJwtSecret, {
      expiresIn: "15min",
    });

    const link = `https://galapago.com/change-password?token=${token}`;

    await service.update(user.userID, { recoveryToken: token });
    const mail = {
      from: config.email, // sender address
      to: user.userEmail, // list of receivers
      subject: "Email para recuperar contraseña", // Subject line
      html: `<b>Ingresa a este link => ${link}</b>`, // html body
    };

    const rta = await this.sendMail(mail);

    return rta;
  }

  async changePassword(token, newPassword) {
    try {
      const payload = jwt.verify(token, config.recoveryJwtSecret);
      const user = await service.findOne(payload.sub);
      if (user.recoveryToken !== token) {
        throw boom.unauthorized();
      }
      console.log("user", user);
      const hash = await bcrypt.hash(newPassword, 10);
      await service.update(user.userID, {
        recoveryToken: null,
        password: hash,
      });
      return { message: "Password changed" };
    } catch (error) {
      throw boom.unauthorized();
    }
  }

  async sendMail(infoMail) {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: config.email,
        pass: config.emailPass,
      },
    });

    await transporter.sendMail(infoMail);

    return { message: "mail sent" };
  }
}

module.exports = AuthService;
