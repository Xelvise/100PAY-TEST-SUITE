# Functional Testing on [100PAY](https://dashboard.100pay.co/) Web App


## Introduction
This Test suite is designed to provide a robust, scalable, and feature-rich solution for automated testing of [100PAY](https://dashboard.100pay.co/) Web App's UI. The suite encompasses various features, including data-driven testing, retry mechanism, self-healing, cross-browser testing, CI/CD integration, reusable utilities, data generation (faker.js) and parallel testing.

To ensure reusability and maintenability, Page Object Model is applied as a means to structure the App's components, while decluttering test scripts.

Since test cases may modify server-side state, workers processes are made to run in parallel - one account per parallel worker. In this approach, each parallel worker is authenticated prior to execution, and shares its storage state with an existing browser context to continue execution. 
This way, bugs, when spotted, are reproducible.

Failed tests are retried once to resolve flakiness, ensuring that the test results are reliable.

## Local Installation and Setup
1. Ensure Node.js `^18` is installed on your machine.
2. Clone the repository
3. While in project's directory, install dependencies: `npm install`
4. Install Playwright browsers: `npx playwright install --with-deps`

## Tests Execution

- To execute all test cases in headless mode, run: 
```bash
npm all-headless
```
- To execute all test cases in headed mode using a pre-installed Chromium browser, run: 
```bash
npm all-headed-chromium
```
- To execute all test cases in headed mode using a pre-installed Firefox browser, run: 
```bash
npm all-headed-firefox
```
- To execute all test cases in headed mode using a pre-installed WebKit browser, run: 
```bash
npm all-headed-safari
```

## Running on CI Environment

A GitHub Action workflow is set up to run the test suite on every push to the main branch. The workflow runs on the latest version of Ubuntu. The workflow uses the `actions/checkout@v2` action to check out the repository, and the `actions/setup-node@v2` action to set up Node.js. 

The workflow then installs the dependencies, executes the tests (when triggered by a push or pull), and reveals the test results.

P.S: Tests in CI environment are configured to spawn up to 5 parallel workers. Should your VM be limited in resources, you may want to reduce the number of parallel workers by modifying the `workers` property of `defineConfig()` present in `playwright.config.ts` file.
