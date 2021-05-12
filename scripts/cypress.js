const RPClient = require('@reportportal/client-javascript');
const cypress = require('cypress');
const config = require('../cypress.json');

cypress.run(config).then(
    async (runInfo) => {
        console.log(runInfo);
        console.log('-----------------------------------------------------------');
        if (config.parallel && config.record) {
            await mergeParallelLaunches(config);
        }
        process.exit(0);
    },
    (error) => {
        console.error(error);
        process.exit(1);
    },
);


const mergeParallelLaunches = async (config) => {
    const client = new RPClient({ ...config.reporterOptions, debug: true });

    // 1. send request to get all launches with the same CI_BUILD_ID attribute value
    const ciBuildId = process.env.CI_BUILD_ID; // get it from util
    console.log('CI Build id: ', ciBuildId);
    const params = new URLSearchParams({
        'filter.has.attributeValue': ciBuildId,
    });
    const launchSearchUrl = `launch?${params.toString()}`;
    console.log('launchSearchUrl: ', launchSearchUrl);
    const response = await client.restClient.retrieveSyncAPI(launchSearchUrl, {
        headers: client.headers,
    });
    console.log('Search response: ', response.content);
    // 2. filter them to find launches that are in progress status
    const launchesInProgress = response.content.filter((launch) => launch.status === 'IN_PROGRESS');
    console.log(`Found launches: ${launchesInProgress.length}`);
    // 3. if exists, just finish this process
    if (!response.content.length || launchesInProgress.length) {
        return;
    }
    // 4. if no, merge all found launches with the same CI_BUILD_ID attribute value
    const launchIds = response.content.map((launch) => launch.id);
    const request = client.getMergeLaunchesRequest(launchIds);
    request.attributes = (config.reporterOptions.attributes || []).concat({ value: ciBuildId });
    request.description = config.reporterOptions.description;
    request.extendSuitesDescription = false;
    const mergeURL = 'launch/merge';
    await client.restClient.create(mergeURL, request, { headers: client.headers });
    console.log(`Launches successfully merged!`);
};
