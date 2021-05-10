require('dotenv').config();
const cypress = require('cypress');
const config = require('./cypress.json');

const updatedConfig = {
  ...config,
  reporterOptions: {
    ...config.reporterOptions,
    token: process.env.RP_TOKEN,
  },
  key: config.record ? process.env.RECORD_KEY : undefined,
};

console.log('Updated config', updatedConfig);

cypress.run(updatedConfig).then(
  () => {
    process.exit(0)
  },
);
