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
dojo.locale = dojo.locale || String(java.util.Locale.getDefault().toString().replace("_", "-").toLowerCase());
dojo._name = "rhino";
dojo.isRhino = true;
if (typeof print == "function") {
	console.debug = print;
}
if (!("byId" in dojo)) {
	dojo.byId = function (id, doc) {
		if (id && (typeof id == "string" || id instanceof String)) {
			if (!doc) {
				doc = document;
			}
			return doc.getElementById(id);
		}
		return id;
	};
}
dojo._isLocalUrl = function (uri) {
	var local = (new java.io.File(uri)).exists();
	if (!local) {
		var stream;
		try {
			stream = (new java.net.URL(uri)).openStream();
			stream.close();
		}
		finally {
			if (stream && stream.close) {
				stream.close();
			}
		}
	}
	return local;
};
dojo._loadUri = function (uri, cb) {
	if (dojo._loadedUrls[uri]) {
		return true;
	}
	try {
		var local;
		try {
			local = dojo._isLocalUrl(uri);
		}
		catch (e) {
			return false;
		}
		dojo._loadedUrls[uri] = true;
		if (cb) {
			var contents = (local ? readText : readUri)(uri, "UTF-8");
			if (!eval("'\u200f'").length) {
				contents = String(contents).replace(/[\u200E\u200F\u202A-\u202E]/g, function (match) {
					return "\\u" + match.charCodeAt(0).toString(16);
				});
			}
			contents = /^define\(/.test(contents) ? contents : "(" + contents + ")";
			cb(eval(contents));
		} else {
			load(uri);
		}
		dojo._loadedUrls.push(uri);
		return true;
	}
	catch (e) {
		dojo._loadedUrls[uri] = false;
		console.debug("rhino load('" + uri + "') failed. Exception: " + e);
		return false;
	}
};
dojo.exit = function (exitcode) {
	quit(exitcode);
};
function readText(path, encoding) {
	encoding = encoding || "utf-8";
	var jf = new java.io.File(path);
	var is = new java.io.FileInputStream(jf);
	return dj_readInputStream(is, encoding);
}
function readUri(uri, encoding) {
	var conn = (new java.net.URL(uri)).openConnection();
	encoding = encoding || conn.getContentEncoding() || "utf-8";
	var is = conn.getInputStream();
	return dj_readInputStream(is, encoding);
}
function dj_readInputStream(is, encoding) {
	var input = new java.io.BufferedReader(new java.io.InputStreamReader(is, encoding));
	try {
		var sb = new java.lang.StringBuffer();
		var line = "";
		while ((line = input.readLine()) !== null) {
			sb.append(line);
			sb.append(java.lang.System.getProperty("line.separator"));
		}
		return sb.toString();
	}
	finally {
		input.close();
	}
}
dojo._getText = function (uri, fail_ok) {
	try {
		var local = dojo._isLocalUrl(uri);
		var text = (local ? readText : readUri)(uri, "UTF-8");
		if (text !== null) {
			text += "";
		}
		return text;
	}
	catch (e) {
		if (fail_ok) {
			return null;
		} else {
			throw e;
		}
	}
};
dojo.doc = typeof document != "undefined" ? document : null;
dojo.body = function () {
	return document.body;
};
if (typeof setTimeout == "undefined" || typeof clearTimeout == "undefined") {
	dojo._timeouts = [];
	clearTimeout = function (idx) {
		if (!dojo._timeouts[idx]) {
			return;
		}
		dojo._timeouts[idx].stop();
	};
	setTimeout = function (func, delay) {
		var def = {sleepTime:delay, hasSlept:false, run:function () {
			if (!this.hasSlept) {
				this.hasSlept = true;
				java.lang.Thread.currentThread().sleep(this.sleepTime);
			}
			try {
				func();
			}
			catch (e) {
				console.debug("Error running setTimeout thread:" + e);
			}
		}};
		var runnable = new java.lang.Runnable(def);
		var thread = new java.lang.Thread(runnable);
		thread.start();
		return dojo._timeouts.push(thread) - 1;
	};
}
if (dojo.config["modulePaths"]) {
	for (var param in dojo.config["modulePaths"]) {
		dojo.registerModulePath(param, dojo.config["modulePaths"][param]);
	}
}

