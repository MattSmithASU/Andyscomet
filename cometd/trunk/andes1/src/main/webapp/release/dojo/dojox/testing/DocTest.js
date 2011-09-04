/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.testing.DocTest"]) {
	dojo._hasResource["dojox.testing.DocTest"] = true;
	dojo.provide("dojox.testing.DocTest");
	dojo.require("dojo.string");
	dojo.declare("dojox.testing.DocTest", null, {errors:[], getTests:function (moduleName) {
		var path = dojo.moduleUrl(moduleName).path;
		var file = path.substring(0, path.length - 1) + ".js";
		var xhr = dojo.xhrGet({url:file, handleAs:"text"});
		var data = dojo._getText(file);
		return this._getTestsFromString(data, true);
	}, getTestsFromString:function (data) {
		return this._getTestsFromString(data, false);
	}, _getTestsFromString:function (data, insideComments) {
		var trim = dojo.hitch(dojo.string, "trim");
		var lines = data.split("\n");
		var len = lines.length;
		var tests = [];
		var test = {commands:[], expectedResult:[], line:null};
		for (var i = 0; i < len + 1; i++) {
			var l = trim(lines[i] || "");
			if ((insideComments && l.match(/^\/\/\s+>>>\s.*/)) || l.match(/^\s*>>>\s.*/)) {
				if (!test.line) {
					test.line = i + 1;
				}
				if (test.expectedResult.length > 0) {
					tests.push({commands:test.commands, expectedResult:test.expectedResult.join("\n"), line:test.line});
					test = {commands:[], expectedResult:[], line:i + 1};
				}
				l = insideComments ? trim(l).substring(2, l.length) : l;
				l = trim(l).substring(3, l.length);
				test.commands.push(trim(l));
			} else {
				if ((!insideComments || l.match(/^\/\/\s+.*/)) && test.commands.length && test.expectedResult.length == 0) {
					l = insideComments ? trim(l).substring(3, l.length) : l;
					test.expectedResult.push(trim(l));
				} else {
					if (test.commands.length > 0 && test.expectedResult.length) {
						if (!insideComments || l.match(/^\/\/\s*$/)) {
							tests.push({commands:test.commands, expectedResult:test.expectedResult.join("\n"), line:test.line});
						}
						if (insideComments && !l.match(/^\/\//)) {
							tests.push({commands:test.commands, expectedResult:test.expectedResult.join("\n"), line:test.line});
						}
						test = {commands:[], expectedResult:[], line:0};
					}
				}
			}
		}
		return tests;
	}, run:function (moduleName) {
		this.errors = [];
		var tests = this.getTests(moduleName);
		if (tests) {
			this._run(tests);
		}
	}, _run:function (tests) {
		var len = tests.length;
		this.tests = len;
		var oks = 0;
		for (var i = 0; i < len; i++) {
			var t = tests[i];
			var res = this.runTest(t.commands, t.expectedResult);
			var msg = "Test " + (i + 1) + ": ";
			var viewCommands = t.commands.join(" ");
			viewCommands = (viewCommands.length > 50 ? viewCommands.substr(0, 50) + "..." : viewCommands);
			if (res.success) {
				console.info(msg + "OK: " + viewCommands);
				oks += 1;
			} else {
				this.errors.push({commands:t.commands, actual:res.actualResult, expected:t.expectedResult});
				console.error(msg + "Failed: " + viewCommands, {commands:t.commands, actualResult:res.actualResult, expectedResult:t.expectedResult});
			}
		}
		console.info(len + " tests ran.", oks + " Success,", this.errors.length + " Errors");
	}, runTest:function (commands, expected) {
		var ret = {success:false, actualResult:null};
		var cmds = commands.join("\n");
		ret.actualResult = eval(cmds);
		if ((String(ret.actualResult) == expected) || (dojo.toJson(ret.actualResult) == expected) || ((expected.charAt(0) == "\"") && (expected.charAt(expected.length - 1) == "\"") && (String(ret.actualResult) == expected.substring(1, expected.length - 1)))) {
			ret.success = true;
		}
		return ret;
	}});
}

