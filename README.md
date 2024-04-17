# Gitlab TestCase Management

This repository shows a way to manage tests within Gitlab

The goal is to demonstrate how to manage Test Cases as issues in Gitlab, and automatically update their status based on results of test executions.

It implements some ideas provided in [this Gitlab video](https://www.youtube.com/watch?v=FPEfR4NrG_w)

A TestCase is tagged downstream of test execution in a pipeline as:

- master:passed or master:failed
- staging:passed or staging:failed  
Depending on the test execution status and the branch it is executed from.

## Repository structure

Repository is made up of these folders:

- [gitlab](#folder-gitlab)
- [issue-updater](#folder-issue-updater)
- [testproject](#folder-test-project)
- [importer-template](#folder-importer-template)

### Folder: gitlab

Allows you to launch a gitlab stack composed of web-application and runner with a "docker compose up"

### Folder: issue-updater

This project provides the source code to build a node-based docker image usable inside a gitlab pipeline to update issues labels based on the result of the test executions contained in a junit report

The node script can be run with `npm run start` and is fed via a [Junit report](https://docs.gitlab.com/ee/ci/testing/unit_test_reports.html) that it must receive as an artifact from the pipeline.  
This file is the same file used to see the results of a test execution within Gitlab

The node script extract the project id/code and the issue id from test case name.  
To achieve this, it uses a regular expression that can be customized via an environment variable
  
The container produced by this folder is hosted on docker hub [here](https://hub.docker.com/repository/docker/andreav/gitlab-issue-updater)

### Folder: test project

This project is a sample project for quick testing

### Folder: importer-template

This folder contains an excel template for bulk importing test cases with ease.  
It implements [this artcile](https://handbook.gitlab.com/handbook/marketing/brand-and-product-marketing/product-and-solution-marketing/getting-started/104/)  
User can specify Issue attributes in each colum, then some Excel formula aggregate those informations into the Gitlab template.  
This template leverages [quick actions](https://docs.gitlab.com/ee/user/project/quick_actions.html) for implementing all operations supported by filling columns.  

Issue fields supported by this template:

| Column Name | Usage |
| --------- | -------- |
| Raw Title | Test Case Title         |
| Raw Description | Test Case Description         |
| Scenario | Test Case Scenario (generic description)        |
| Precondition | Test Case Precondition         |
| Issue Type | Gitlab label for identifying `Test Case` issues, i.e: type:test        |
| Test Type |  Gitlab label for identifying `Test Case` issues, i.e: type:manual or type::automatic        |
| Link | relates this issue to its Requirement Issue or User Story Issue         |
| Epic | Inserts this issue into the epic specified         |
| Team Label |  Gitlab label for identifying a Team        |
| Effort | Add an effort to the issue         |
| Weight | Add a weight to the issue         |
| Iteration | Inserts the issue into one iteration         |
| Title |  This is the column used by Gitlab during import. It equals to 'Raw Title' column         |
| Description | This is the column used by Gitlab during import. It is transformed by Excel formulas to embed all other columns but "Raw Title"    |

## Usage: from zero to hero

Steps to see issues automatically updated according to test results are:

- Run gitlab, create a project and register one docker runner
- Create Test Cases and implement them in a test project
- Run a pipeline and see Issues updating their status according to test results

### Run gitlab, create a project and register one docker runner

    cd gitlab
    mkdir ./gitlab-ce
    export GITLAB_HOME=$(pwd)/gitlab-ce 
    docker compose up -d

Login to Gitlab visiting <http://localhost:8080>  

- User: `root`  
- Password: the string returned by this command:  

        docker compose exec gitlab grep 'Password:' /etc/gitlab/initial_root_password

Crate a test group and a test project from Gitlab user interface

Now create one runner from Gitlab UI

- Visit: Setting -> CICD -> Runners -> New Project Runner
- Choose Linux
- Chekck "Run untagged jobs"
- Click `Create Runner` button
  Gitlab will redirect you to a broken url, just replace in the address bar <http://gitlab> with <http://localhost:8080>
- Now ou should see the craeted Runner page, take note of the token in the `--token` param
- From a terminal inside the gitlab repositoryu folder containig the docker-compose.yml file, issue this command:  

        docker compose exec gitlab-runner gitlab-runner register -n \
        --url "http://gitlab/" \
        --registration-token <TOKEN_OBTAINED_FROM_UI> \
        --executor docker \
        --description "docker-runner" \
        --docker-image "docker:24.0.5" \
        --docker-privileged \
        --docker-volumes "/certs/client" \
        --docker-network-mode gitlab-network

Congratulation! You have now a running Gitlab instance with a docker runner ready to execute you pipelines.

### Create Test Cases and implement them in a test project

- Clone test project and replace the content of teh cloned repository with the content from this repository in folder: `testproject`  
  This will give you a fast way to get a repository with test up&running  

        git clone http://localhost:8080/testgroup/testproject.git <anywhere>/testproject
        cp -rT ./testproject <anywhere>/testproject

- Now from the Gitlab UI create some issues inside the Test Project

- Link these issues with tests  
  Inside the cloned repository, look at the test file `tests/hello.spec.ts`  
  `testproject` has a default test named `proj:testgroup/testproject id:1 Testing Hello Endriu`  
  Naming the test this way links this test to issue number `1` in Gitlab project `testgroup/testproject`  
  The regular expression for identifying `project code` and `issue id` can be customized directly from the pipeline  
  Default value looks for a test starting with `proj:<project-code> id:<issue-id>`

  Feel free to add more issues and test cases and experiment linking or not linking them

### Run a pipeline and see Issues updating their status according to test results

- Create a token from Gitlab UI
  - Personal Access Token
  - Group Token
  - Project Token

- Pass that token to issue-update-stage inside .gitlab-ci.yaml with JOB_TOKEN param

- Modify as you prefer tests and issue as described in the previous paragraph, then commit and push `testproject`  
  
- This will trigger a pipeline using .gitlab-ci.yaml contained in `testproject`  
  The pipeline has 4 stages
  - install
  - build
  - quality
  - update-issues-status
  
- During the last update-issues-status stage, issues will be updated and labels will be set according to test results.
