"use strict";
exports.__esModule = true;
var sjcl = require("sjcl");
var prompt_sync = require("prompt-sync");
// Generate base64-encoded SHA256 for given string.
var hash = function (s) { return sjcl.codec.base64.fromBits(sjcl.hash.sha256.hash(s)); };
console.log("Enter script below to receive the base64-encoded SHA256 hash");
console.log("IMPORTANT: Exclude <script> and </script> from your entry");
var script_hash = hash(prompt_sync()(''));
console.log("\n[HASH]\n\t".concat(script_hash, "\n"));
console.log("[HTML]\n\t<meta http-equiv=\"Content-Security-Policy\" content=\"script-src 'self' 'sha256-".concat(script_hash, "'\">"));
//# sourceMappingURL=inline-script-encrypt.js.map