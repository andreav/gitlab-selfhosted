import { assert } from "chai";
import { hello } from "../src/hello";

describe("Hello Tests", () => {
    it("proj:testgroup/testproject id:1 Testing Hello Endriu", () => {
        const result = hello("Endriu");
        assert.equal(result, "Hello Endriu!");
    });
});
