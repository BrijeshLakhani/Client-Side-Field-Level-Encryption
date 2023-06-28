const URL = "mongodb://localhost:27017"; // Replace with your MongoDB connection URL
const mongodb = require("mongodb");
const { MongoClient, Binary } = mongodb;

const secertDB = "userDB";
const dataCollectionName = "users";
const namespace = `${secertDB}.${dataCollectionName}`;
// start-kmsproviders
const fs = require("fs");
const provider = "local";
const path = "./master-key.txt";
const localMasterKey = fs.readFileSync(path);
const kmsProviders = {
  local: {
    key: localMasterKey,
  },
};
// end-kmsproviders

// start-key-vault
const keyVaultNamespace = "demoFLE.__keystore";
// end-key-vault

// start-schema
const dataKey = "Zm/TkWkFRVWRaaEYU932mw==";
const schema = {
  bsonType: "object",
  encryptMetadata: {
    keyId: "/key-id",
  },
  properties: {
    lastName: {
      encrypt: {
        bsonType: "string",
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
      },
    },
    mobile: {
      encrypt: {
        bsonType: "string",
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
      },
    },
    password: {
      encrypt: {
        bsonType: "string",
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
      },
    },
  },
};

var patientSchema = {};
patientSchema[namespace] = schema;
// console.log('patientSchema: ', patientSchema);
// end-schema

// start encryptedFieldsMap
const encryptedFieldsMap = {
  namespace: {
    fields: [
      {
        path: 'lastName',
        encryptedFieldType: 'string'
      }
    ]
  }
};
// end encryptedFieldsMap

// start-extra-options
const extraOptions = {
  mongocryptdSpawnPath:
    "C:\\Program Files\\MongoDB\\Server\\6.0\\bin\\mongo_crypt_v1.dll",
    mongocryptdBypassSpawn : true,
};
// end-extra-options

// start-client
const secureClient = new MongoClient(URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoEncryption: {
    keyVaultNamespace,
    kmsProviders,
    schemaMap: patientSchema,
    extraOptions: extraOptions,
  },
});
// end-client

const getClient = async () => {
  return new Promise(async (resolve) => {
    try {
      await secureClient
        .connect()
        .then(() => {
          console.log("database connected");
        })
        .catch((err) => console.log(err));
      resolve(secureClient);
    } catch (error) {
      console.error("Failed to connect to the database:", error);
      resolve(error);
    }
  });
};

module.exports = getClient();
