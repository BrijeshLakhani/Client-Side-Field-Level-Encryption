// const crypto = require('crypto');

// // Function to generate a 96-byte key from the input string
// function generate96ByteKey(inputString) {
//   const sha256Hash = crypto.createHash('sha256').update(inputString).digest();
//   const randomBytes = crypto.randomBytes(96 - sha256Hash.length);
//   const combinedBuffer = Buffer.concat([sha256Hash, randomBytes], 96);
//   return combinedBuffer.toString('base64');
// }

// // Example usage:
// const inputString = 'mongocryptdSpawnPath';
// const key96Bytes = generate96ByteKey(inputString);
// console.log('96-byte key:', key96Bytes);