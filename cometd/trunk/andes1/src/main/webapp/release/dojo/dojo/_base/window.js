/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo._base.window"]) {
	dojo._hasResource["dojo._base.window"] = true;
	dojo.provide("dojo._base.window");
	dojo.doc = window["document"] || null;
	dojo.body = function () {
		return dojo.doc.body || dojo.doc.getElementsByTagName("body")[0];
	};
	dojo.setContext = function (globalObject, globalDocument) {
		dojo.global = globalObject;
		dojo.doc = globalDocument;
	};
	dojo.withGlobal = function (globalObject, callback, thisObject, cbArguments) {
		var oldGlob = dojo.global;
		try {
			dojo.global = globalObject;
			return dojo.withDoc.call(null, globalObject.document, callback, thisObject, cbArguments);
		}
		finally {
			dojo.global = oldGlob;
		}
	};
	dojo.withDoc = function (documentObject, callback, thisObject, cbArguments) {
		var oldDoc = dojo.doc, oldLtr = dojo._bodyLtr, oldQ = dojo.isQuirks;
		try {
			dojo.doc = documentObject;
			delete dojo._bodyLtr;
			dojo.isQuirks = dojo.doc.compatMode == "BackCompat";
			if (thisObject && typeof callback == "string") {
				callback = thisObject[callback];
			}
			return callback.apply(thisObject, cbArguments || []);
		}
		finally {
			dojo.doc = oldDoc;
			delete dojo._bodyLtr;
			if (oldLtr !== undefined) {
				dojo._bodyLtr = oldLtr;
			}
			dojo.isQuirks = oldQ;
		}
	};
}

