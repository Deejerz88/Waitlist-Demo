import Stats from "./src/lib/Stats.js";

const Test = new Stats()

const test = await Test.getStats('8/27/2022')

console.log(test)