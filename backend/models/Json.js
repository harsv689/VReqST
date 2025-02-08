const mongoose = require("mongoose");

const JsonSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    ownerid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  scene: {
      type: String,
      required: false,
      default:"",
    },
  asset: {
      type: String,
      required: false,
      default:"",
    },
  action: {
      type: String,
      required: false,
      default:"",
    },
  custom: {
      type: String,
      required: false,
      default:"",
    },
  timeline: {
      type: String,
      required: false,
      default:"",
    },

    private: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Json", JsonSchema);
