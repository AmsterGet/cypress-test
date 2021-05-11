const cypress = require('cypress');
const config = require('../cypress.json');

cypress.run(config).then(
    (runInfo) => {
        console.log(runInfo);
        console.log('-----------------------------------------------------------');
        console.log(process.env);
        console.log('-----------------------------------------------------------');
        console.log(process);
        process.exit(0);

    },
    (error) => {
        console.error(error);
        process.exit(1);
    },
);
