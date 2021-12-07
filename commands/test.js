import * as accumulated  from "../accumulator.cjs";
// const accumulated = require('./commands/accumulator.cjs')

const attributes = {
    active:true
};

// console.log(accumulated);
attributes.commands = accumulated['default'];
// attributes.commands = null;

console.log(attributes.commands['play']);