import { readFileSync } from "fs";
import { parse } from 'junit2json'
import { JunitJsonFile } from "./types";

// full project name contains also / => \w is not enought, using \S
const DEF_PROJ_ISSUE_REGEXP = "^proj:(\\S+) id:(\\d+).*"
const project_and_issue_regexp = process.env.PROJ_ISSUE_REGEXP ?? DEF_PROJ_ISSUE_REGEXP;
if (!project_and_issue_regexp) {
    throw new Error(`Provide a regexp for identifying project and issue id using environment variable PROJ_ISSUE_REGEXP overwise default is: ${DEF_PROJ_ISSUE_REGEXP}`);
}
console.log(`using regexp: ---->${project_and_issue_regexp}<---`);

export const parseJunitFIle = async (junitFile: string) => {
    const junitFileContent = readFileSync(junitFile)
    // const junitJsonFileContent = await parseStringPromise(junitFileContent);
    const junitJsonFileContent = await parse(junitFileContent)
    console.log("to json ->", JSON.stringify(junitJsonFileContent, null, 2));
    return junitJsonFileContent
}

export const extractIssueUrl = (testName: string, project_and_issue_regexp: string) => {
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

export const foreachTestcaseApplyFunction = async (
    junitJsonContent: JunitJsonFile,
    updateIssue: (proj_id: number | string, issue_id_str: string, isPassed: boolean, isFailed: boolean, isSkipped: boolean) => Promise<void>) => {
    junitJsonContent.testsuite.map((ts) => {
        const tsName = ts.name
        console.log(`-------- Suite: ${tsName}`);

        ts.testcase?.map(async (tc) => {
            const tcName = tc.classname
            const isFailed = tc.failure != undefined
            const isSkipped = tc.skipped != undefined
            console.log(` -- TestCase: ${tcName}`);
            const [proj_id_or_code, issue_id_str] = extractIssueUrl(tcName, project_and_issue_regexp)
            if (proj_id_or_code && issue_id_str) {
                const isPassed = !isFailed && !isSkipped
                // TODO: parallelize? How much?
                await updateIssue(proj_id_or_code, issue_id_str, isPassed, isFailed, isSkipped)
            }
        })
    })

}
