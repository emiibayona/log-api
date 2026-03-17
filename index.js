// require("dotenv").config();
// const express = require("express");
// const passport = require("passport");
// const morgan = require("morgan");
// const fs = require("fs");
// const path = require("path");
// const { sequelize } = require("./config/database");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const session = require("express-session");
// const SQLiteStore = require("connect-sqlite3")(session);

// require("dotenv").config({ path: path.resolve(__dirname + "/.env") });

// // 

// //APP SETUP
// const app = express();
// const port = process.env.SERVER_PORT || 8089;

// // Initialize Passport and restore authentication state if available

// function getRoutes() {
//   try {
//     fs?.readdirSync("./routes/")?.forEach((route) => {
//       console.log(`Loading route: ${route}`);
//       require(`./routes/${route.split(".")[0]}`)(app);
//     });
//   } catch (error) {
//     console.error("Failed to load" + error.message);
//   }
// }

// function getUses() {
//   try {
//     console.log("Loading middleware...");
//     app.use(passport.initialize());
//     app.use(morgan("combined"));
//     app.use(express.static(path.join(__dirname, "public")));
//     app.use(
//       session({
//         secret: "keyboard cat",
//         resave: false,
//         saveUninitialized: false,
//         store: new SQLiteStore({ db: "sessions.db", dir: "./config/sessions" }),
//         cookie: { maxAge: 60000 },
//       })
//     );
//     app.use(passport.authenticate("session"));
//     app.use(
//       cors({
//         origin: process.env.ORIGIN_CORS || "https://artile.vercel.app",
//         methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Adjust methods as needed
//       })
//     );
//     app.use(bodyParser.urlencoded({ extended: true }));
//     app.use(bodyParser.json());
//     // Expose the uploads directory for file uploads.
//     app.use("/uploads", express.static(path.join(__dirname, "uploads")));
//     console.log("Middleware loaded successfully.");
//   } catch (error) {
//     console.error("Error loading middleware:", error);
//   }
// }

// // const initApp = async () => {
//   console.log("Testing the database connection..");

//   // Test the connection.
//   try {
//     await sequelize.sync();

//     getUses();
//     getRoutes();

//     app.listen(port, () => {
//       console.log(`Server is running at: http://localhost:${port}`);
//     });
//   } catch (error) {
//     console.error("Unable to connect to the database:", error.original);
//   }


// module.exports = app;


require("dotenv").config();
const express = require("express");
const routes = require("./routes"); // Automatically looks for routes/index.js
const cors = require("cors"); // Import the cors middleware

const app = express();
app.use(express.json());

// 2. Configure CORS
const corsOptions = {
  origin: process.env.CORS_ALLOW, // Allow only your frontend
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Enable this if you eventually use cookies/sessions
};

app.use(cors(corsOptions));

app.use("/api", routes);
app.get("/test", (req, res) => res.send("API Working!"));
if (process.env.NODE_ENV !== "production") {
  const { sequelize } = require("./config/database");

  if (["mysql", "sqlite"].includes(process.env.SQL_TYPE)) {
    // sequelize.sync();
  }
  // sequelize.sync().then(() => {
  // connectToDatabase();
  app.listen(process.env.PORT, () =>
    console.log(
      `Server running on http://${process.env.HOST}:${process.env.PORT}`,
    ),
  );
  // });
} else {
  const { sequelize } = require("./database");
}

module.exports = app;
