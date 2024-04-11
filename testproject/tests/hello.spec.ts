import { assert } from "chai";
import { hello } from "../src/hello";

describe("Hello Tests", () => {
    it("Tesing Hello Endriu", () => {
        const result = hello("Endriu");
        assert.equal(result, "Hello Endriu!");
    });
});
