/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.NodeList-data"]) {
	dojo._hasResource["dojo.NodeList-data"] = true;
	dojo.provide("dojo.NodeList-data");
	(function (d) {
		var dataCache = {}, x = 0, dataattr = "data-dojo-dataid", nl = d.NodeList, dopid = function (node) {
			var pid = d.attr(node, dataattr);
			if (!pid) {
				pid = "pid" + (x++);
				d.attr(node, dataattr, pid);
			}
			return pid;
		};
		var dodata = d._nodeData = function (node, key, value) {
			var pid = dopid(node), r;
			if (!dataCache[pid]) {
				dataCache[pid] = {};
			}
			if (arguments.length == 1) {
				r = dataCache[pid];
			}
			if (typeof key == "string") {
				if (arguments.length > 2) {
					dataCache[pid][key] = value;
				} else {
					r = dataCache[pid][key];
				}
			} else {
				r = d._mixin(dataCache[pid], key);
			}
			return r;
		};
		var removeData = d._removeNodeData = function (node, key) {
			var pid = dopid(node);
			if (dataCache[pid]) {
				if (key) {
					delete dataCache[pid][key];
				} else {
					delete dataCache[pid];
				}
			}
		};
		d._gcNodeData = function () {
			var livePids = dojo.query("[" + dataattr + "]").map(dopid);
			for (var i in dataCache) {
				if (dojo.indexOf(livePids, i) < 0) {
					delete dataCache[i];
				}
			}
		};
		d.extend(nl, {data:nl._adaptWithCondition(dodata, function (a) {
			return a.length === 0 || a.length == 1 && (typeof a[0] == "string");
		}), removeData:nl._adaptAsForEach(removeData)});
	})(dojo);
}

