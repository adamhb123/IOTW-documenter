import sjcl = require('sjcl');
import prompt_sync = require('prompt-sync');
// Generate base64-encoded SHA256 for given string.
const hash = (s: string) =>  sjcl.codec.base64.fromBits(sjcl.hash.sha256.hash(s));
console.log(`Enter script below to receive the base64-encoded SHA256 hash
IMPORTANT: Exclude <script> and </script> from your entry`);
const script_hash: string = hash(prompt_sync()(''));
console.log(`\n[HASH]\n\t${script_hash}
[HTML]\n\t<meta http-equiv="Content-Security-Policy" content="script-src 'self' 'sha256-${script_hash}'">`);
