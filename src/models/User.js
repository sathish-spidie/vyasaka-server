import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import uniqueValidator from "mongoose-unique-validator";

const schema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      indexes: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    confirmed: { type: Boolean, default: false },
    confirmationToken: { type: String, default: "" },
  },
  { timestamps: true }
);

schema.methods.generateJWT = function generateJWT() {
  return jwt.sign(
    {
      email: this.email,
      confirmed: this.confirmed,
    },
    process.env.JWTSECRET
  );
};

schema.methods.generateResetPasswordToken = function generateResetPasswordToken() {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.JWTSECRET,
    {
      expiresIn: "1h",
    }
  );
};

schema.methods.toAuthJSON = function toAuthJSON() {
  return {
    email: this.email,
    token: this.generateJWT(),
    confirmed: this.confirmed,
  };
};

schema.methods.setPassword = async function setPassword(password) {
  this.passwordHash = await bcrypt.hash(password, 10);
};

schema.methods.setConfirmationToken = function setConfirmationToken() {
  this.confirmationToken = this.generateJWT();
};

schema.methods.generateConfirmationUrl = function generateConfirmationUrl() {
  return `${process.env.HOST}/api/auth/confirmation/${this.confirmationToken}`;
};

schema.methods.generateResetPasswordUrl = function generateResetPasswordUrl() {
  return `${
    process.env.HOST
  }/api/auth/validate_token/${this.generateResetPasswordToken()}`;
};

schema.methods.isValidPassword = function isValidPassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

schema.plugin(uniqueValidator, { message: "This email is already taken" });

export default mongoose.model("User", schema);
