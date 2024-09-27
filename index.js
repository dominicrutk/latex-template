'use strict';

import * as dotenv from 'dotenv';
import ejs from 'ejs';
import { writeFile } from 'fs/promises';
import inquirer from 'inquirer';

dotenv.config();

(async () => {
  const authorName = process.env.NAME ? process.env.NAME.trim() : '';
  const classes = process.env.CLASSES ? process.env.CLASSES.split(',').map(courseName => courseName.trim()) : [];
  const collaborators = process.env.COLLABORATORS ? process.env.COLLABORATORS.split(',').map(collaboratorName => collaboratorName.trim()) : [];

  // Defining these empty values makes IntelliSense smarter
  let input = {
    className: '', // This cannot be 'class' because that creates issues with EJS
    assignment: '',
    authorName,
    listCollaborators: false,
    collaborators: [],
    collaboratorStr: '',
    dueDate: '',
    problemCount: 0,
    newPages: false,
    namedProblems: false,
    problemNames: []
  };

  inquirer.prompt([
    {
      type: 'list',
      name: 'className',
      message: 'What class is the assignment for?',
      choices: classes
    },
    {
      type: 'input',
      name: 'assignment',
      message: 'What is the assignment called?'
    },
    {
      type: 'input',
      name: 'dueDate',
      message: 'When is the assignment due?'
    },
    {
      type: 'confirm',
      name: 'listCollaborators',
      message: 'Do you want to list collaborators?',
      default: true
    }
  ]).then(answers => {
    input = {...input, ...answers};
    if (input.listCollaborators) {
      return inquirer.prompt([{
        type: 'checkbox',
        name: 'collaborators',
        message: 'Which people did you collaborate with?',
        choices: collaborators
      }]);
    } else {
      return Promise.resolve({
        collaborators: []
      });
    }
  }).then(answers => {
    input = {...input, ...answers};
    if (input.listCollaborators) {
      // Sort alphabetically by last name, preserving the existing order in case of ties
      input.collaborators.sort((a, b) => a.split(' ')[1].localeCompare(b.split(' ')[1]));
      switch (input.collaborators.length) {
        case 0:
          input.collaboratorStr = 'no collaborators';
          break;
        case 1:
          input.collaboratorStr = `collaborated with ${input.collaborators[0]}`;
          break;
        case 2:
          input.collaboratorStr = `collaborated with ${input.collaborators[0]} and ${input.collaborators[1]}`;
          break;
        default:
          input.collaboratorStr = `collaborated with ${input.collaborators.slice(0, -1).join(', ')}, and ${input.collaborators[input.collaborators.length - 1]}`;
          break;
      }
    }
    return inquirer.prompt([
      {
        type: 'confirm',
        name: 'titlePage',
        message: 'Should there be a title page?',
        default: true
      },
      {
        type: 'confirm',
        name: 'newPages',
        message: 'Should each problem be on a new page?',
        default: true
      },
      {
        type: 'number',
        name: 'problemCount',
        message: 'How many problems are there?'
      },
      {
        type: 'confirm',
        name: 'namedProblems',
        message: 'Do the problems have names?',
        default: false
      }
    ]);
  }).then(answers => {
    input = {...input, ...answers};
    if (input.namedProblems) {
      return inquirer.prompt(Array.from({ length: input.problemCount }, (_, i) => {
        return {
          type: 'input',
          name: `problem${i}`,
          message: `What is the name of problem ${i + 1}?`
        };
      }));
    } else {
      return Promise.resolve({});
    }
  }).then(answers => {
    input.problemNames = Array(input.problemCount);
    Object.entries(answers).forEach(problem => {
      const [key, name] = problem;
      const i = Number(key.substring('problem'.length));
      input.problemNames[i] = name;
    });
    for (let i = 0; i < input.problemCount; i++) {
      if (!input.problemNames[i]) {
        input.problemNames[i] = `Problem ${i + 1}`;
      }
    }

    console.log('Generating a LaTeX template with the following details:');
    console.log(input);
  }).catch(error => {
    if (error.isTtyError) {
      console.error('There was an error with your CLI.');
      process.exit(1);
    } else {
      console.error(`An unexpected error was encountered: ${error}`);
      process.exit(1);
    }
  }).then(() => {
    return new Promise((resolve, reject) => {
      ejs.renderFile(process.env.TEMPLATE, input, {}, (error, output) => {
        if (error) {
          return reject(error);
        } else {
          return resolve(output);
        }
      });
    });
  }).then(output => {
    return writeFile(`${input.className} ${input.assignment}.tex`, output, 'utf8');
  }).catch(error => {
    console.error(`An unexpected error was encountered: ${error}`);
    process.exit(1);
  });
})();
