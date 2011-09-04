/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (dojo.config["baseUrl"]) {
	dojo.baseUrl = dojo.config["baseUrl"];
} else {
	dojo.baseUrl = "./";
}
dojo._name = "spidermonkey";
dojo.isSpidermonkey = true;
dojo.exit = function (exitcode) {
	quit(exitcode);
};
if (typeof print == "function") {
	console.debug = print;
}
if (typeof line2pc == "undefined") {
	throw new Error("attempt to use SpiderMonkey host environment when no 'line2pc' global");
}
dojo._spidermonkeyCurrentFile = function (depth) {
	var s = "";
	try {
		throw Error("whatever");
	}
	catch (e) {
		s = e.stack;
	}
	var matches = s.match(/[^@]*\.js/gi);
	if (!matches) {
		throw Error("could not parse stack string: '" + s + "'");
	}
	var fname = (typeof depth != "undefined" && depth) ? matches[depth + 1] : matches[matches.length - 1];
	if (!fname) {
		throw Error("could not find file name in stack string '" + s + "'");
	}
	return fname;
};
dojo._loadUri = function (uri) {
	var ok = load(uri);
	return 1;
};
if (dojo.config["modulePaths"]) {
	for (var param in dojo.config["modulePaths"]) {
		dojo.registerModulePath(param, dojo.config["modulePaths"][param]);
	}
}

