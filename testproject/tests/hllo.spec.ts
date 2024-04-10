import { assert } from "chai";
import { hello } from "../src/hello";

describe("Calculator Tests", () => {
    it("should return 5 when 2 is added to 3", () => {
        const result = hello("Endriu");
        assert.equal(result, "Hello Endriu!");
    });
});
