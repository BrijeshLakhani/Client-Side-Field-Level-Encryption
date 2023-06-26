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
    res.render("login");
    console.log("re-direfct to login: ");
  });

  app.get("/register", (req, res) => {
    console.log("re-direfct to register: ");
    res.render("register");
  });

  app.get("/logout", (req, res) => {
    res.render("home");
    console.log("logout successful");
  });

  app.post("/register", async (req, res) => {
    const { email, firstName, lastName, mobile, password } = req.body;
    try {
      await user
        .insertOne({
          email: email,
          firstName: firstName,
          lastName: lastName,
          "key-id": "demo-data-key",
          mobile: parseInt(mobile),
          password: password,
        })
        .then((result) => {
          console.log(`Inserted ${JSON.stringify(result)}.`);
          res.render("login");
        })
        .catch((err) => {
          throw err;
        });
    } catch (error) {
      console.log("Error: ", error);
    }
  });

  app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
      const foundUser = await user.findOne({ email: username });

      if (foundUser && foundUser.password == password) {
        res.render("secrets");
        console.log("Login successful");
      } else {
        console.log("password: ", password);
        console.log("foundUser.password: ", foundUser.password);
        console.log("Wrong credentials");
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  });

  //   const userDetails = await user.find({}).toArray();
  //   console.log("user: ", userDetails);
};
getDb();

app.listen(3000, async () => {
  console.log("Server is running at port 3000");
  console.log("http://localhost:3000/");
});
