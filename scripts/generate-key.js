const crypto = require('crypto');

const privateKeyBytes = crypto.randomBytes(32);

const privateKeyHex = privateKeyBytes.toString('hex');

const privateKeyWithPrefix = `0x${privateKeyHex}`;

console.log('\nGenerated Private Key:');
console.log('='.repeat(60));
console.log(`\nWITH 0x prefix:\n${privateKeyWithPrefix}`);
console.log(`\nWITHOUT 0x prefix (for .env.local):\n${privateKeyHex}`);
console.log('\n' + '='.repeat(60));
console.log('\nAdd this to your .env.local file:');
console.log(`STORY_PRIVATE_KEY=${privateKeyHex}`);
console.log('\n IMPORTANT: Keep this private key secure!');
console.log('Never share it or commit it to version control!');
console.log('Make sure your wallet has testnet tokens for transactions.\n');

