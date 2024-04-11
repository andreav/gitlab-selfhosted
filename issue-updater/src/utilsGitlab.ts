import { Gitlab, Projects } from '@gitbeaker/node';

if (!process.env.CI_JOB_TOKEN) {
    throw new Error("Environment variable CI_JOB_TOKEN not set");
}
if (!process.env.CI_SERVER_URL) {
    throw new Error("Environment variable CI_SERVER_URL not set");
}

if (!process.env.CI_DEFAULT_BRANCH) {
    throw new Error(`Environment variable CI_DEFAULT_BRANCH not set`);
}
if (!process.env.CI_COMMIT_BRANCH && !process.env.CI_MERGE_REQUEST_SOURCE_BRANCH_NAME) {
    throw new Error(`Environment variable CI_COMMIT_BRANCH or CI_MERGE_REQUEST_SOURCE_BRANCH_NAME`);
}

/*
 * CI_DEFAULT_BRANCH - The name of the project’s default branch.
 * CI_COMMIT_BRANCH - The commit branch name. Available in branch pipelines, including pipelines for the default branch. Not available in merge request pipelines or tag pipelines.
 * CI_MERGE_REQUEST_SOURCE_BRANCH_NAME - The source branch name of the merge request
 */
export const isMainBranch = (CI_DEFAULT_BRANCH: string, CI_COMMIT_BRANCH?: string, CI_MERGE_REQUEST_SOURCE_BRANCH_NAME?: string) => {
    return CI_COMMIT_BRANCH == CI_DEFAULT_BRANCH || CI_MERGE_REQUEST_SOURCE_BRANCH_NAME == CI_DEFAULT_BRANCH
}

var api = new Gitlab({
    host: process.env.CI_SERVER_URL,
    token: process.env.CI_JOB_TOKEN,
});

const isOnMain = isMainBranch(process.env.CI_DEFAULT_BRANCH, process.env.CI_COMMIT_BRANCH, process.env.CI_MERGE_REQUEST_SOURCE_BRANCH_NAME)

export const updateIssue = async (proj_id: string, issue_id: string, isPassed: boolean, isFailed: boolean, isSkipped: boolean) => {
    console.log(`Updating Project/Issue: ${proj_id}/${issue_id} - passed/failed/skipped: ${isPassed}/${isFailed}${isSkipped} - isOnMain: ${isOnMain}`);

    try {
        const projects = await api.Projects.all();
        console.log(JSON.stringify(projects, undefined, 2));
    } catch (e) {
        console.error(e);
    }
}




