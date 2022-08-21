#! /usr/bin/env node
const fs = require('fs');
const { exec } = require('child_process');
const languages = require('../languages.json');
const config = require('../config');

const args = process.argv.slice(2);
if (args.includes('-d')) {
  const flagIndex = args.indexOf('-d');
  args.splice(flagIndex, 1);
  config.includeDescription = true;
}

if (args.length > 1) {
  process.exit(1); // Exiting, error ocurred
}

const id = args[0];
fetchKataAndCreateFile(id);

function createAndOpenKataFile(data) {
  const kyu = data.rank.name[0];
  const dirName = `${kyu}-kyu`;
  if (!fs.existsSync(dirName)) fs.mkdirSync(dirName);

  const fileName = `${removeInvalidCharacters(data.slug)}.js`;
  if (fs.existsSync(`${dirName}/${fileName}`)) return console.log('File already exists. Returning...');
  
  let fileContent = `// ${data.url}\n\n`;

  if (config.includeDescription) {
    const kataDescription = data.description.trim();

    const splitDescription = kataDescription.split('\n```');

    for (let i = 0; i < splitDescription.length; i++) {
      if (splitDescription[i].startsWith('if')) {
        const splitIfBlock = splitDescription[i].split('\n');
        const [ifType, language] = splitIfBlock[0].split(':');
        
        if (ifType === 'if') {
          language !== 'js'
          ? splitDescription[i] = ''
          : splitDescription[i] = splitIfBlock.slice(1).join('\n');
        }

        else if (ifType === 'if-not') {
          language === 'js'
          ? splitDescription[i] = ''
          : splitDescription[i] = splitIfBlock.slice(1).join('\n');
        }
      }

      // Full programming languages names
      const [fullName, ...instructions] = splitDescription[i].split('\n');
      if (Object.keys(languages).includes(fullName)) {
        if (fullName !== config.language) {
          splitDescription[i] = '';
        } else {
          splitDescription[i] = instructions.join('\n');
        }
      }
      console.log(fullName);
      console.log(instructions);
    }


    const newDescription = splitDescription.filter(line => line !== '').join('\n');
    fileContent += `/*\n${newDescription}\n*/`;
  }

  fs.writeFile(`${dirName}/${fileName}`, fileContent, function (err) {
    if (err) throw err;
    console.log('File was created successfully.');
    exec(`code ${dirName}/${fileName}`);
  });
}

function removeInvalidCharacters(slug) {
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

