# Issue Updater

This project will generate an image usable inside a gitlab pipeline to update issues starting from a junit report.

- it will look for project code/id and issue id (together they represent a unique key in gitlab for identifying an issue) inside the test name
- then it will update every issue setting one of these labels:
  - staging:passed
  - staging failed
  - staging skipped
  - main:passing
  - main:failed
  - main:skipped

- The label is chosed according to:
  - test status passing or failed
  - git branch main or not

| branch \ status   | PASSED          | FAILED         |
| ----------------- | --------------  | -------------  |
| main              | prod:passing    | prod:passing   |
| not main>         | staging:passing | staging:failed |

The pipeline step generted by this project can be customized according to these environment variables:

| ENv Var                              | Meaning                                           |
| ------------------------------------ | ------------------------------------------------  |
| JUNIT_FILE_PATH                      | Pointing to the tests artifact containing the Junit tests report    |
| PROJ_ISSUE_REGEXP                    | This regular expression extracts project id/code and issue id from issue name: default: `^proj:(\\w+) id:(\\d+).*` |
| JOB_TOKEN                            | An Access Token used for accessing Gitlab API (CI_JOB_TOKEN not supported because of its limitations in accessing APIs)    |
| CI_SERVER_URL                        | Gitlab Server URL    |
| CI_DEFAULT_BRANCH                    | The access token used for accessing Gitlab API    |
| CI_COMMIT_BRANCH                     | The access token used for accessing Gitlab API    |
| CI_MERGE_REQUEST_SOURCE_BRANCH_NAME  | The access token used for accessing Gitlab API    |
| LABEL_SCOPE_MAIN                     | Configuring the scope of the "main branch" labels      |
| LABEL_SCOPE_STAGING                  | Configuring the scope of the "staging branch" labels     |
| LABEL_VALUE_PASSED                   | Configuring the name of the "passing" labels     |
| LABEL_VALUE_FAILED                   | Configuring the name of the "failed" labels      |
| LABEL_VALUE_SKIPPED                  | Configuring the name of the "skipped" labels     |

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

For pushing image to DockerHub:

- docker login
- docker build -t andreav/gitlab-issue-updater:1.0 .
- docker push andreav/gitlab-issue-updater:1.0
