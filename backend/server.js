const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const usersRouter = require("./routes/api/users");
const JsonRouter = require("./routes/api/json");
const apiprocessor = require("./routes/api/apiprocessroutes")
const ProjectRouter = require("./routes/api/project");
const CustomRulesRouter = require("./routes/api/customRules");
const config = require("config");
var cors = require("cors");
const app = express();
// Body parser middleware
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(express.json());
app.use(cors());

// DB Config
const db = config.get("mongoURI");
// Connect to MongoDB
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => console.log("MongoDB successfully connected"))
  .catch((err) => console.log(err));
// Passport middleware
app.use(passport.initialize());
// Passport config
require("./config/passport")(passport);
// Routes
app.use("/api/users", usersRouter);
app.use("/api/json", JsonRouter);
app.use("/api/project", ProjectRouter);
app.use("/api",apiprocessor);
app.use("/api/custom", CustomRulesRouter);

const port = process.env.PORT || 5002;
app.listen(port, () => console.log(`Server up and running on port ${port} !`));
