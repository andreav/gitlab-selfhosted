import { JunitJsonFile } from "./types";
import { extractIssueUrl, parseJunitFIle } from "./utilsJunit";
import { updateIssue } from "./utilsGitlab";

const junitFilePath = process.env.JUNIT_FILE_PATH
if (!junitFilePath) {
    throw new Error("Environment variable JUNIT_FILE_PATH not set");
}


const DEF_PROJ_ISSUE_REGEXP = "^proj:(\\w+) id:(\\d+).*"
const project_and_issue_regexp = process.env.PROJ_ISSUE_REGEXP ?? DEF_PROJ_ISSUE_REGEXP;
if (!project_and_issue_regexp) {
    throw new Error(`Provide a regexp for identifying project and issue id using environment variable PROJ_ISSUE_REGEXP overwise default is: ${DEF_PROJ_ISSUE_REGEXP}`);
}
console.log(`using regexp: ---->${project_and_issue_regexp}<---`);

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
            const [proj_id, issue_id] = extractIssueUrl(tcName, project_and_issue_regexp)
            if (proj_id && issue_id) {
                const isPassed = !isFailed && !isSkipped
                updateIssue(proj_id, issue_id, isPassed, isFailed, isSkipped)
            }
        })
    })
}


main()



