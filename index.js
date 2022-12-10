'use strict';

import * as dotenv from 'dotenv';
import inquirer from 'inquirer';
import * as nj from 'nunjucks';

dotenv.config();

(async () => {
  const name = process.env.NAME ? process.env.NAME.trim() : '';
  const classes = process.env.CLASSES ? process.env.CLASSES.split(',').map(courseName => courseName.trim()) : [];
  const collaborators = process.env.COLLABORATORS ? process.env.COLLABORATORS.split(',').map(collaboratorName => collaboratorName.trim()) : [];

  // Defining these empty values makes IntelliSense smarter
  let input = {
    class: '',
    assignment: '',
    dueDate: '',
    listCollaborators: false,
    collaborators: [],
    problemCount: 0,
    namedProblems: false
  };

  inquirer.prompt([
    {
      type: 'list',
      name: 'class',
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
      message: 'Do you want to list collaborators?'
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
    return inquirer.prompt([
      {
        type: 'number',
        name: 'problemCount',
        message: 'How many problems are there?'
      },
      {
        type: 'confirm',
        name: 'namedProblems',
        message: 'Do the problems have names?'
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

    // Here is the input
    console.log(input);
  }).catch(error => {
    if (error.isTtyError) {
      console.error('There was an error with your CLI.');
      process.exit(1);
    } else {
      console.error(`An unexpected error was encountered: ${error}`);
      process.exit(1);
    }
  });
})();
