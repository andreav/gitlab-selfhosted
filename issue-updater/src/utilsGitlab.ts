import { Gitlab, Projects } from '@gitbeaker/rest';

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

function arrayToString(arr: number[]) {
    return JSON.stringify(arr);
}

export const getAllLabels = () => {
    const labelScopeMain = process.env.LABEL_SCOPE_MAIN ?? "master-status"
    const labelScopeStaging = process.env.LABEL_SCOPE_STAGING ?? "staging-status"

    const labelValuePassed = process.env.LABEL_VALUE_PASSED ?? "passed"
    const labelValueFailed = process.env.LABEL_VALUE_FAILED ?? "failed"
    const labelValueSkipped = process.env.LABEL_VALUE_SKIPPED ?? "skipped"

    // TODO: cache
    return new Map([
        [arrayToString([1, 0, 1, 0, 0]), `${labelScopeMain}:${labelValuePassed}`],
        [arrayToString([1, 0, 0, 1, 0]), `${labelScopeMain}:${labelValueFailed}`],
        [arrayToString([1, 0, 0, 0, 1]), `${labelScopeMain}:${labelValueSkipped}`],
        [arrayToString([0, 1, 1, 0, 0]), `${labelScopeStaging}:${labelValuePassed}`],
        [arrayToString([0, 1, 0, 1, 0]), `${labelScopeStaging}:${labelValueFailed}`],
        [arrayToString([0, 1, 0, 0, 1]), `${labelScopeStaging}:${labelValueSkipped}`],
    ])
}

export const getLabel = (key: number[]) => {
    return getAllLabels().get(arrayToString(key));
}

function getAllLabelsButThis(key: number[]) {
    const result = [];
    const keyString = JSON.stringify(key);

    for (const [k, v] of getAllLabels()) {
        if (k !== keyString) {
            result.push(v);
        }
    }

    return result;
}

export const updateIssue = async (proj_id: number | string, issue_id_str: string, isPassed: boolean, isFailed: boolean, isSkipped: boolean) => {
    console.log(`Updating Project/Issue: ${proj_id}/${issue_id_str} - passed/failed/skipped: ${isPassed}/${isFailed}${isSkipped} - isOnMain: ${isOnMain}`);

    const issue_id = parseInt(issue_id_str)
    if (isNaN(issue_id)) {
        console.error("@@ issue id must be a number");
        return
    }

    try {
        const project = await api.Projects.show(proj_id);
        console.log(JSON.stringify(project, undefined, 2));

        // TODO: add local cache for this operation
        const issue = await api.Issues.show(issue_id, {
            projectId: project.id
        })
        console.log(JSON.stringify(issue, undefined, 2));

        if (!issue.id) {
            console.error("@@ issue associated to test not found.");
            return
        }

        const key = [isOnMain ? 1 : 0, isOnMain ? 0 : 1, isPassed ? 1 : 0, isFailed ? 1 : 0, isSkipped ? 1 : 0]
        const label2Add = getLabel(key)
        if (label2Add === undefined) {
            console.error("@@ INTERNAL ERROR - label2Add not found.");
            return
        }
        const removeLabels = getAllLabelsButThis(key)

        console.log(`label2Add ${label2Add} - removeLabels ${removeLabels.join(",")}`);

        const issueUpdated = await api.Issues.edit(project.id, issue.iid, {
            addLabels: label2Add,
            removeLabels: removeLabels.join(",")
        })
    } catch (e) {
        console.error(e);
    }
}




