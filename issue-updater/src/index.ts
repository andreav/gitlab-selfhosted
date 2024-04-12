import { JunitJsonFile } from "./types";
import { extractIssueUrl, foreachTestcaseApplyFunction, parseJunitFIle } from "./utilsJunit";
import { updateIssue } from "./utilsGitlab";

const junitFilePath = process.env.JUNIT_FILE_PATH
if (!junitFilePath) {
    throw new Error("Environment variable JUNIT_FILE_PATH not set");
}


const main = async () => {
    const junitJsonContent = await parseJunitFIle(junitFilePath) as JunitJsonFile
    if (!junitJsonContent) {
        console.log("Empty file");
        return
    }

    await foreachTestcaseApplyFunction(junitJsonContent, updateIssue);
}

main()



