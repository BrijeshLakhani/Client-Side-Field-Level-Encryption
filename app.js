const kms = require("./kms");
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const kmsClient = kms.localCsfleHelper();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(bodyParser.json());
const DBName = "userDB";
const CollectionName = "users";

const main = async () => {
  let dataKey = "10BxjMS8T0GvMqnkuMZk8Q=="; // change this to the base64 encoded data key generated from make-data-key.js
  if (dataKey === null) {
    // Error.stackTraceLimit = ed
    let err = new Error(
      `dataKey is required.
Run make-data-key.js and ensure you copy and paste the output into client.js
    `
    );
    throw err;
  }

  regularClient = await kmsClient.getRegularClient();
  let schemaMap = kmsClient.createJsonSchemaMap(dataKey);
  csfleClient = await kmsClient.getCsfleEnabledClient(schemaMap);

  const regularClientPatientsColl = regularClient
    .db(DBName)
    .collection(CollectionName);
  const csfleClientPatientsColl = csfleClient
    .db(DBName)
    .collection(CollectionName);

  app.get("/", (req, res) => {
    res.render("home");
  });

  app.get("/login", (req, res) => {
    res.render("login", { error: null, success: null });
  });

  app.get("/register", (req, res) => {
    res.render("register", { errormessage: null });
  });

  app.get("/logout", (req, res) => {
    res.render("home", { success: "logout successfully" });
  });

  app.post("/register", async (req, res) => {
    const { email, firstName, lastName, mobile, password } = req.body;
    console.log("password: ", password);
    console.log("mobile: ", mobile);
    let errormessage = null;
    try {
      if (password.length < 6) {
        errormessage = "Password should be at least 6 characters long.";
        res.render("register", { errormessage });
      } else {
        await csfleClientPatientsColl
          .insertOne({
            email: email,
            firstName: firstName,
            lastName: lastName,
            mobile: mobile,
            password: password,
          })
          .then((result) => {
            const success = "you are successfully registered";
            res.render("login", { error: null, success: success });
          })
          .catch((error) => {
            console.log("error: ", error);
            errormessage = error;
            res.render("register", { errormessage });
          });
      }
    } catch (error) {
      console.log("error: ", error);
    }
  });

  async function getAllUser() {
    return await csfleClientPatientsColl.find({}).toArray();
  }

  app.get("/table", async (req, res) => {
    const { search, firstName, lastName } = req.query;
    console.log("search: ", search);

    try {
      let query = {};
      if (search) {
        query = {
          $or: [
            { lastName: search.trim() },
            { firstName: search.trim() },
            { mobile: search.trim() },
          ],
        };
      }
      const foundUsers = await csfleClientPatientsColl.find(query).toArray();
      console.log("foundUsers: ", foundUsers);
      res.render("secrets", { success: null, error: null, data: foundUsers });
      // return foundUsers;
    } catch (error) {
      console.error(error);
      // const data = await getAllUser();
      res.render("secrets", { success: null, error: error, data: [] });
      // throw error;
    }
  });

  app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    let error = null;
    try {
      const foundUser = await csfleClientPatientsColl.findOne({
        email: username,
      });
      if (foundUser != null) {
        if (foundUser && foundUser.password == password) {
          const success = "Login successfully";
          const data = await getAllUser();
          console.log("data: ", data);
          res.render("secrets", { success: success, error: null, data: data });
        } else {
          error = "Invalid password ⚠";
          res.render("login", { error });
        }
      } else {
        error = "Invalid username or password ⚠";
        res.render("login", { error });
      }
    } catch (error) {
      error = "A network error occurred, Please try again";
      res.render("login", { error });
    }
  });
};
main();

app.listen(3000, async () => {
  console.log("Server is running at port 3000");
  console.log("http://localhost:3000/");
});
