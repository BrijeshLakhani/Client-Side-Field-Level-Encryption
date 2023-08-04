const fs = require("fs");
const os = require("os");

// add ENV variable
function setEnvValue(key, value) {
  // read file from hdd & split if from a linebreak to a array
  const ENV_VARS = fs.readFileSync("./.env", "utf8").split(os.EOL);

  // find the env we want based on the key
  const target = ENV_VARS.indexOf(
    ENV_VARS.find((line) => {
      return line.match(new RegExp(key));
    })
  );

  // replace the key/value with the new value
  ENV_VARS.splice(target, 1, `${key}="${value}"`);

  // write everything back to the file system
  fs.writeFileSync("./.env", ENV_VARS.join(os.EOL));
}

// existing ENV variable update and add also
function setEnvValue(key, value) {
  // read file from hdd & split if from a linebreak to a array
  const ENV_VARS = fs.readFileSync(".env", "utf8").split(os.EOL);

  // find the env we want based on the key
  const target = ENV_VARS.indexOf(
    ENV_VARS.find((line) => {
      // (?<!#\s*)   Negative lookbehind to avoid matching comments (lines that starts with #).
      //             There is a double slash in the RegExp constructor to escape it.
      // (?==)       Positive lookahead to check if there is an equal sign right after the key.
      //             This is to prevent matching keys prefixed with the key of the env var to update.
      const keyValRegex = new RegExp(`(?<!#\\s*)${key}(?==)`);

      return line.match(keyValRegex);
    })
  );

  // if key-value pair exists in the .env file,
  if (target !== -1) {
    // replace the key/value with the new value
    ENV_VARS.splice(target, 1, `${key}="${value}"`);
  } else {
    // if it doesn't exist, add it instead
    ENV_VARS.push(`${key}="${value}"`);
  }

  // write everything back to the file system
  fs.writeFileSync(".env", ENV_VARS.join(os.EOL));
}

setEnvValue("VAR1", "ENV_2_VALUE_22");
