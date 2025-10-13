#!/usr/bin/env node
const { Command } = require('commander');
const fs = require('fs');
const path = require('path');

const program = new Command();

program
    .option('-i, --input <file>', 'input JSON file')
    .option('-o, --output <file>', 'output file')
    .option('-d, --display', 'display result in console')
    .option('-f, --furnished', 'show only furnished houses')
    .option('-p, --price <number>', 'filter houses with price lower than given value', parseFloat);

program.parse(process.argv);

const options = program.opts();

if (!options.input) {
    console.error('Please, specify input file');
    process.exit(1);
}

const inputPath = path.resolve(options.input);

if (!fs.existsSync(inputPath)) {
    console.error('Cannot find input file');
    process.exit(1);
}

let data;
try {
    const raw = fs.readFileSync(inputPath, 'utf8').trim();
    if (raw.startsWith('[')) {
        data = JSON.parse(raw);
    } else {
        data = raw.split('\n').map(line => JSON.parse(line));
    }
} catch (err) {
    console.error('Invalid JSON format');
    process.exit(1);
}

let resultData = data;

if (options.furnished) {
    resultData = resultData.filter(item => item.furnishingstatus === 'furnished');
}

if (options.price != undefined && !isNaN(options.price)) {
    resultData = resultData.filter(item => Number(item.price) < options.price);
}

let output = resultData
    .map(item => {
        return `${item.price} ${item.area}`;
    })
    .join('\n');

if (options.output) {
    const outputPath = path.resolve(options.output);
    fs.writeFileSync(outputPath, output, 'utf8');
}

if (options.display) {
    console.log(output);
}
