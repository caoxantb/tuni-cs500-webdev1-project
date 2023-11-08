const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// You can use SALT_ROUNDS when hashing the password with bcrypt.hashSync()
const SALT_ROUNDS = 10;

// You can use these SCHEMA_DEFAULTS when setting the validators for the User Schema. For example the default role can be accessed with
// SCHEMA_DEFAULTS.role.defaultValue
const USER_SCHEMA = {
  name: {
    type: String,
    minLength: 1,
    maxLength: 50,
    trim: true,
    required: true,
  },
  email: {
    // https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
    type: String,
    trim: true,
    required: true,
    unique: true,
    match:
      /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
  },
  password: {
    type: String,
    required: true,
    minLength: 10,
    set: (password) => {
      if (!password || password.length < 10) return "";
      return bcrypt.hashSync(password, SALT_ROUNDS);
    },
  },
  role: {
    type: String,
    trim: true,
    lowercase: true,
    enum: ["admin", "customer"],
    default: "customer",
  },
};

// TODO: 9.5 Implement the userSchema
const userSchema = new Schema(USER_SCHEMA);

/**
 * Compare supplied password with user's own (hashed) password
 *
 * @param {string} password
 * @returns {Promise<boolean>} promise that resolves to the comparison result
 */
userSchema.methods.checkPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};
// Omit the version key when serialized to JSON
userSchema.set("toJSON", { virtuals: false, versionKey: false });

const User = new mongoose.model("User", userSchema);
module.exports = User;