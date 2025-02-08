const express = require("express")
const bodyparser = require("body-parser")
const apiprocessor = require("./routes/apiprocessroutes")
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5001
app.use(cors());
app.options('*', cors());
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))
app.use('/api',apiprocessor)

// app.listen(5001);
app.listen(port, () => console.log("Started application on port %d", port));
module.exports= app