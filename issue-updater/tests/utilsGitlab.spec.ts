import { assert } from "chai";
import { isMainBranch, updateIssue } from "../src/utilsGitlab";

describe("Gitlab Utils", () => {
    it("isOnMain from .env is not on main", () => {
        const isOnMain = isMainBranch(process.env.CI_DEFAULT_BRANCH!, process.env.CI_COMMIT_BRANCH, process.env.CI_MERGE_REQUEST_SOURCE_BRANCH_NAME)
        assert.equal(isOnMain, false);
    });
    it("isOnMain test on main", () => {
        const isOnMain = isMainBranch("main", "main", undefined)
        assert.equal(isOnMain, true);
    });
    it("isOnMain test on main from merge request", () => {
        const isOnMain = isMainBranch("main", undefined, "main")
        assert.equal(isOnMain, true);
    });
    it("isOnMain test not on main", () => {
        const isOnMain = isMainBranch("main", "other", undefined)
        assert.equal(isOnMain, false);
    });
    it("updateIssue - project name", async () => {
        await updateIssue("testgroup/testproject", "1", true, false, false)
    });
    it("updateIssue - project id - passed", async () => {
        await updateIssue("1", "1", true, false, false)
    });
    it("updateIssue - project id - failed", async () => {
        await updateIssue("1", "1", false, true, false)
    });
});
