'use strict';

import * as dotenv from 'dotenv';
import inquirer from 'inquirer';
import * as nj from 'nunjucks';

dotenv.config();

(async () => {
  const name = process.env.NAME ? process.env.NAME.trim() : '';
  const classes = process.env.CLASSES ? process.env.CLASSES.split(',').map(courseName => courseName.trim()) : [];
  const collaborators = process.env.COLLABORATORS ? process.env.COLLABORATORS.split(',').map(collaboratorName => collaboratorName.trim()) : [];
  console.log(`Hello, ${name}!`);
  console.log(`You are enrolled in ${classes}.`);
  console.log(`Your potential collaborators are ${collaborators}.`);
})();
