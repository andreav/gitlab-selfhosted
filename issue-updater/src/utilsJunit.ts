import { readFileSync } from "fs";
import { parse } from 'junit2json'

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
