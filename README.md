# create-cw-file
An NPX tool that creates a base codewars file after providing a kata id.

**Link to project:** [here](https://www.npmjs.com/package/create-cw-file)

## Tech used: ![JavaScript Badge](https://img.shields.io/badge/-JavaScript-F7DF1E?logo=CSS3&logoColor=white&style=flat) ![NodeJS](https://img.shields.io/badge/-NodeJS-339933?logo=Node.js&logoColor=white&style=flat)

## Creating a File

**You’ll need to have Node 7.0.0 or later version on your machine.**
<br><br>
To create a new file:
```sh
npx create-cw-file kata-id
```

It will create a directory (if it does not already exist) named after the difficulty of the kata inside the current folder.<br>
Inside that directory, it will generate a file with a commented out link to the kata and open it.

```
6-kyu
├── sample-kata.js
```