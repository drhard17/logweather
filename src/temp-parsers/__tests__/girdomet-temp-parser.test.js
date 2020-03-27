const fs = require("fs");

const parser = require("../gidromet-temp-parser");

describe("gidromet", () => {
	let sample1, sample2;

	beforeAll(() => {
		sample1 = fs.readFileSync(`${__dirname}/gidromet-temp-parser/sample-response-1.html`, "utf8");
		sample2 = fs.readFileSync(`${__dirname}/gidromet-temp-parser/sample-response-2.html`, "utf8");
	});

	it("should return correct values for sample1", () => {
		const result = parser.parseFunc(sample1);
		expect(result).toEqual([13, 16, 14, 0, 1.5, 3.5, 5.5]);
	});

	it("should return correct values for sample2", () => {
		const result = parser.parseFunc(sample2);
		expect(result).toEqual([13, 16, 14, 0]);
	});
});

describe("extractTemps", () => {
	it("should work for 1 number", () => {
		expect(parser.extractTemps("+1")).toEqual([1]);
	});
	
	it("should work for 2 numbers", () => {
		expect(parser.extractTemps("+11..13")).toEqual([11, 13]);
	});
	
	it("should work for negative numbers", () => {
		expect(parser.extractTemps("-11..-13")).toEqual([-11, -13]);
	});
});