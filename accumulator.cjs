const fs = require('fs');

const commands = fs.readdirSync('./commands').filter(fname => fname.endsWith('.cjs'));
// console.log(`commands: ${commands}`);
let accumulated = {};

for(let c in commands){
    const fname = `./commands/${commands[c]}`
    const data = require(fname);
    const alias = data.alias;
    accumulated[alias] = data;
}

// console.log(accumulated);

module.exports = accumulated;
// export default accumulated;


