import { readFileSync } from "fs";
import { parse } from 'junit2json'
import { JunitJsonFile } from "./types";

const junitFilePath = process.env.JUNIT_FILE_PATH
if (!junitFilePath) {
    throw new Error("Environment variable JUNIT_FILE_PATH not set");
}

const gitlabTokenn = process.env.GITLAB_TOKEN
if (!gitlabTokenn) {
    throw new Error("Environment variable GITLAB_TOKEN not set");
}

const DEF_PROJ_ISSUE_REGEXP = "^proj:(\\w+) id:(\\d+).*"
const project_and_issue_regexp = process.env.PROJ_ISSUE_REGEXP ?? DEF_PROJ_ISSUE_REGEXP;
if (!project_and_issue_regexp) {
    throw new Error(`Provide a regexp for identifying project and issue id using environment variable PROJ_ISSUE_REGEXP oterwise default is: ${DEF_PROJ_ISSUE_REGEXP}`);
}
console.log(`using regexp: ---->${project_and_issue_regexp}<---`);

const parseJunitFIle = async (junitFile: string) => {
    const junitFileContent = readFileSync(junitFile)
    // const junitJsonFileContet = await parseStringPromise(junitFileContent);
    const junitJsonFileContet = await parse(junitFileContent)
    console.log("to json ->", JSON.stringify(junitJsonFileContet, null, 2));
    return junitJsonFileContet
}

const extractIssueUrl = (testName: string) => {
    const re = new RegExp(project_and_issue_regexp, "i");
    const matches = testName.match(re);
    if (!matches) {
        console.log(`Cannot find project and issue id in testcase: ${testName}`);
        return [undefined, undefined]
    }
    const proj_id = matches[1]
    const issue_id = matches[2]
    if (proj_id == undefined || issue_id == undefined) {
        console.log(`Cannot find project and issue id in testcase: ${testName}`);
    }
    return [proj_id, issue_id]
}

function updateIssue(proj_id: string, issue_id: string, isPassed: boolean, isFailed: boolean, isSkipped: boolean, gitlabTokenn: string) {
    // throw new Error("Function not implemented.");
}

const main = async () => {
    const junitJsonContent = await parseJunitFIle(junitFilePath) as JunitJsonFile
    if (!junitJsonContent) {
        console.log("Empty file");
        return
    }
    junitJsonContent.testsuite.map((ts) => {
        const tsName = ts.name
        console.log(`-------- Suite: ${tsName}`);

        ts.testcase.map((tc) => {
            const tcName = tc.name
            const isFailed = tc.failure != undefined
            const isSkipped = tc.skipped != undefined
            console.log(` -- TestCase: ${tcName}`);
            const [proj_id, issue_id] = extractIssueUrl(tcName)
            if (proj_id && issue_id) {
                const isPassed = !isFailed && !isSkipped
                updateIssue(proj_id, issue_id, isPassed, isFailed, isSkipped, gitlabTokenn)
            }
        })
    })
}


main()



