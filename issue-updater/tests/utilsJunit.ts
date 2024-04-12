import { assert } from "chai";
import { foreachTestcaseApplyFunction, parseJunitFIle } from "../src/utilsJunit";
import { JunitJsonFile } from "../src/types";
import sinon from "sinon";

const updateIssueLogger = async (proj_id: number | string, issue_id_str: string, isPassed: boolean, isFailed: boolean, isSkipped: boolean) => {
    console.log(`Updating Project/Issue: ${proj_id}/${issue_id_str} - passed/failed/skipped: ${isPassed}/${isFailed}${isSkipped}`);
}

describe("JUnit Utils", () => {
    it("test-results-example", async () => {
        var updateIssueSpy = sinon.fake();

        const content = await parseJunitFIle("tests/test-results-example.xml") as JunitJsonFile
        await foreachTestcaseApplyFunction(content, updateIssueSpy)

        assert(updateIssueSpy.called);
        assert.isTrue(updateIssueSpy.calledWith("testgroup/testproject", "1", true, false, false))
    });
    it("test-results-example-3.xml", async () => {
        var updateIssueSpy = sinon.fake();

        const content = await parseJunitFIle("tests/test-results-example-3.xml") as JunitJsonFile
        await foreachTestcaseApplyFunction(content, updateIssueSpy)

        assert(updateIssueSpy.called);
        assert.isTrue(updateIssueSpy.getCall(0).calledWith("1", "1", true, false, false))
        assert.isTrue(updateIssueSpy.getCall(1).calledWith("1", "2", true, false, false))
        assert.isTrue(updateIssueSpy.getCall(2).calledWith("1", "3", false, true, false))
        assert.isTrue(updateIssueSpy.getCall(3).calledWith("1", "4", false, false, true))
        assert.isTrue(updateIssueSpy.getCall(4).calledWith("1", "5", true, false, false))
        assert.isTrue(updateIssueSpy.getCall(5).calledWith("1", "6", false, true, false))
        assert.isTrue(updateIssueSpy.getCall(6).calledWith("1", "7", false, false, true))
    });
});
