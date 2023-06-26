const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(bodyParser.json());
const clientPromise = require("./mongodb");

const DBName = "userDB";
const dataCollectionName = "users";

const getDb = async () => {
  const client = await clientPromise;
  // console.log('client: ', client);
  const db = client.db(DBName);
  const user = db.collection(dataCollectionName);

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
    let errormessage = null;
    try {
      if (password.length < 6) {
        errormessage = "Password should be at least 6 characters long.";
        res.render("register", { errormessage });
      } else {
      await user
        .insertOne({
          email: email,
          firstName: firstName,
          lastName: lastName,
          "key-id": "demo-data-key",
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

  app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    let error = null;
    try {
      const foundUser = await user.findOne({ email: username });
      console.log("foundUser: ", foundUser);
      if (foundUser != null) {
        if (foundUser && foundUser.password == password) {
          const success = "Login successfully";
          res.render("secrets", { success });
          // console.log("Login successfully");
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
getDb();

app.listen(3000, async () => {
  console.log("Server is running at port 3000");
  console.log("http://localhost:3000/");
});
