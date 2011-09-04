/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo._base.json"]) {
	dojo._hasResource["dojo._base.json"] = true;
	dojo.provide("dojo._base.json");
	dojo.require("dojo.json");
	dojo.fromJson = function (js) {
		return eval("(" + js + ")");
	};
	dojo._escapeString = dojo.json.stringify;
	dojo.toJsonIndentStr = "\t";
	dojo.toJson = function (it, prettyPrint, _indentStr) {
		return dojo.json.stringify(it, function (key, value) {
			if (value) {
				var tf = value.__json__ || value.json;
				if (typeof tf == "function") {
					return tf.call(value);
				}
			}
			return value;
		}, prettyPrint && dojo.toJsonIndentStr);
	};
}

