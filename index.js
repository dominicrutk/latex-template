'use strict';

import * as dotenv from 'dotenv';
import inquirer from 'inquirer';
import * as nj from 'nunjucks';

dotenv.config();

(async () => {
  console.log(`Hello, ${process.env.NAME}!`);
})();
