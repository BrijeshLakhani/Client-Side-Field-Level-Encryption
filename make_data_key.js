const mongodb = require("mongodb");
const { ClientEncryption } = require("mongodb-client-encryption");
const { MongoClient, Binary } = mongodb;

const credentials = {
    // Mongo Paths + URI
    // MONGODB_URI: "mongodb+srv://brijesh-lakhani-40:bR!jESH%40TSPL@cluster0.jzeejck.mongodb.net/?retryWrites=true&w=majority",
    MONGODB_URI: "mongodb://localhost:27017",
    // SHARED_LIB_PATH: "C:\\Program Files\\MongoDB\\Server\\6.0\\bin\\mongo_crypt_v1.dill",
  };

// start-local-cmk
const fs = require("fs");
const crypto = require("crypto");
try {
  fs.writeFileSync("master-key.txt", crypto.randomBytes(96));
} catch (err) {
  console.error(err);
}
// end-local-cmk

// start-kmsproviders
const provider = "local";
const path = "master-key.txt";
const localMasterKey = fs.readFileSync(path);
const kmsProviders = {
  local: {
    key: localMasterKey,
  },
};
// end-kmsproviders

// start-datakeyopts
// end-datakeyopts

async function main() {
  // start-create-index
  const uri = credentials.MONGODB_URI;
  const keyVaultDatabase = "demoFLE";
  const keyVaultCollection = "__keystore";
  const keyVaultNamespace = `${keyVaultDatabase}.${keyVaultCollection}`;
  const keyVaultClient = new MongoClient(uri);
  await keyVaultClient.connect();
  const keyVaultDB = keyVaultClient.db(keyVaultDatabase);
  // Drop the Key Vault Collection in case you created this collection
  // in a previous run of this application.
  await keyVaultDB.dropDatabase();
  // Drop the database storing your encrypted fields as all
  // the DEKs encrypting those fields were deleted in the preceding line.
  await keyVaultClient.db("userDB").dropDatabase();
  const keyVaultColl = keyVaultDB.collection(keyVaultCollection);
  await keyVaultColl.createIndex(
    { keyAltNames: 1 },
    {
      unique: true,
      partialFilterExpression: { keyAltNames: { $exists: true } },
    }
  );
  // end-create-index

  // start-create-dek
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await client.connect();

  const encryption = new ClientEncryption(client, {
    keyVaultNamespace,
    kmsProviders,
  });
  const key = await encryption.createDataKey(provider, {
    keyAltNames: ["demo-data-key"],
  });
  console.log("DataKeyId [base64]: ", key.toString("base64"));
  await keyVaultClient.close();
  await client.close();
  // end-create-dek
}
main();
