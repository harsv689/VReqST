const mongoose = require("mongoose");

const CustomRulesSchema = mongoose.Schema(
    {
        project_id:{
            type: String,
            required: true
        },
        rulename: {
            type: String,
            required: true
        },
        data_name: {
            type: String,
            required: true
        },
        description: {
            type: String,
        }
    }
);

module.exports = mongoose.model("CustomRules", CustomRulesSchema);