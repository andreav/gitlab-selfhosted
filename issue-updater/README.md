# Issue Updater

This project will update issues starting from a junit report.

- it will look for project name and issue id (together they represent a unique key in gitlab for identifying an issue) inside the test name
- the it will update every issue setting one of these four labels:
    - staging:passed
    - staging failed
    - prod:passing
    - prod:failed
 according to:
    - test status passing or failed
    - git branch main or not 

| branch \ status   | PASSED          | FAILED         |
| ----------------- | --------------  | -------------  |
| main              | prod:passing    | prod:passing   |
| not main>         | staging:passing | staging:failed |

This repo created the docker image containing code and dependencies for updating issues

## setup

    npm init -y
    npm install -D typescript
    npx tsc --init
    npm install --save-dev ts-node

    npm install junit2json
    npm install @gitbeaker/rest

    mkdir src
    touch src/index.ts

In tsconfig.json:

    outDIr: dist

For testing:

    npm install --save-dev mocha @types/mocha chai@"<5.0.0" @types/chai
    npm install --save-dev ts-node 
    npm install --save-dev dotenv  

    mkdir tests
    touch tests/index.spec.ts

package.json:

    "scripts": {
        "build": "rm -rf ./dist && tsc",
        "start": "JUNIT_FILE_PATH='./tests/test-results-example.xml' ts-node ./src/index.ts",
        "test": "mocha -r ts-node/register -r dotenv/config ./tests/**/*.ts"
    },


