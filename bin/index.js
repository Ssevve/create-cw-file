#! /usr/bin/env node
const fs = require('fs');
const { exec } = require('child_process');

const id = process.argv.slice(2);
if (id.length > 1) {
  console.error('Enter valid id.');
  process.exit(1); // Exiting, error ocurred
} else {
  fetchKataAndCreateFile(id);
}

function createAndOpenKataFile(data) {
  const kyu = data.rank.name[0];
  const dirName = `${kyu}-kyu`;
  if (!fs.existsSync(dirName)) fs.mkdirSync(dirName);

  const fileName = `${modifySlug(data.slug)}.js`;
  if (fs.existsSync(`${dirName}/${fileName}`)) return console.log('File already exists. Returning...');
  
  const fileContent = `// ${data.url}\n\n`;
  fs.writeFile(`${dirName}/${fileName}`, fileContent, function (err) {
    if (err) throw err;
    console.log('File was created successfully.');
    exec(`code ${dirName}/${fileName}`);
  });
}

function modifySlug(slug) {
  const splitSlug = slug.split('-');
  const newSlug = splitSlug.filter(str => str.match(/\w/g)).join('-');
  return newSlug;
}

async function fetchKataAndCreateFile(id) {
  const url = `https://www.codewars.com/api/v1/code-challenges/${id}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.success === false) return console.log('Something went wrong. Try again.');
  createAndOpenKataFile(data);
}

