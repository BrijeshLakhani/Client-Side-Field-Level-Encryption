const crypto = require("crypto");

// Function to generate a 96-byte key from the input string
function generate96ByteKey(inputString) {
  const sha256Hash = crypto.createHash("sha256").update(inputString).digest();
  const randomBytes = crypto.randomBytes(96 - sha256Hash.length);
  const combinedBuffer = Buffer.concat([sha256Hash, randomBytes], 96);
  return combinedBuffer.toString("base64");
}

const key = generate96ByteKey('bcrpt-key-genrate')
console.log('key: ', key);

// const express = require('express');
// const { exec } = require('child_process');

// const app = express();

// // Define a route that handles the GET or POST request
// app.get('/generate-key', (req, res) => {
//     // Run the make-key.js script
//     exec('node make-key.js', (error, stdout, stderr) => {
//         if (error) {
//             console.error(`Error executing make-key.js: ${error.message}`);
//             return res.status(500).send('Internal Server Error');
//         }
//         console.log(`make-key.js output: ${stdout}`);
//         res.send(stdout);
//     });
// });

// // Start the server
// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });
