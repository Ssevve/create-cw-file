#! /usr/bin/env node
const fs = require('fs');
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

function createKataFile(data) {
  const kyu = data.rank.name[0];
  const dirName = `${kyu}-kyu`;
  if (!fs.existsSync(dirName)) fs.mkdirSync(dirName);

  const fileName = `${removeInvalidCharacters(data.slug)}.${
    languages[config.language].extension
  }`;

  if (fs.existsSync(`${dirName}/${fileName}`))
    return console.log('File already exists. Returning...');

  let fileContent = `// ${data.url}\n\n`;

  if (config.includeDescription) {
    const parsedDescription = parseDescription(data.description);
    fileContent += `/*\n${parsedDescription}\n*/`;
  }

  fs.writeFile(`${dirName}/${fileName}`, fileContent, function (err) {
    if (err) throw err;
    console.log('File was created successfully.');
  });
}

function parseDescription(description) {
  const kataDescription = description.trim();
  const lines = kataDescription.split('\n');
  const codeBlocks = lines.filter(line => line.match(/^(`){3}./)); // Match lines that start with ```
  
  for (let i = codeBlocks.length - 1; i >= 0; i--) {
    const currentCodeBlock = codeBlocks[i];
    const startIndex = lines.indexOf(currentCodeBlock);
    const endIndex = lines.indexOf('```', startIndex);
    const spliceAmount = (endIndex + 1) - startIndex;

    if (currentCodeBlock.includes('```if')) {
      const [left, languageShort] = currentCodeBlock.split(':');
      const ifType = left.split('```')[1];
      const chosenLanguageShort = languages[config.language].short;

      if (ifType === 'if') {
        languageShort === chosenLanguageShort
        ? removeUnnecessarySyntax(lines, startIndex, endIndex)
        : lines.splice(startIndex, spliceAmount);
      } 
      
      else if (ifType === 'if-not') {
        languageShort === chosenLanguageShort
        ? lines.splice(startIndex, spliceAmount)
        : removeUnnecessarySyntax(lines, startIndex, endIndex);
      }
    } 
    
    else {
      // If so, do not remove that block if it contains only one language, 
      // instructions may not be clear after removing it
      const languagesTotal = [...new Set(codeBlocks)].length;
      if (languagesTotal === 1) continue;

      const currentCodeBlockLanguage = currentCodeBlock.split('```')[1];
      if (currentCodeBlockLanguage !== config.language) lines.splice(startIndex, spliceAmount);
    }
  }

  lines.forEach(line => line.trim());
  const parsedDescription = lines.join('\n');
  return parsedDescription;
}

function removeUnnecessarySyntax(lines, startIndex, endIndex) {
  lines.splice(startIndex, 1, '');
  lines.splice(endIndex, 1, '');
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

  if (data.success === false)
    return console.log('Something went wrong. Try again.');
  createKataFile(data);
}
