/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.behavior"]) {
	dojo._hasResource["dojo.behavior"] = true;
	dojo.provide("dojo.behavior");
	dojo.behavior = new function () {
		function arrIn(obj, name) {
			if (!obj[name]) {
				obj[name] = [];
			}
			return obj[name];
		}
		var _inc = 0;
		function forIn(obj, scope, func) {
			var tmpObj = {};
			for (var x in obj) {
				if (typeof tmpObj[x] == "undefined") {
					if (!func) {
						scope(obj[x], x);
					} else {
						func.call(scope, obj[x], x);
					}
				}
			}
		}
		this._behaviors = {};
		this.add = function (behaviorObj) {
			var tmpObj = {};
			forIn(behaviorObj, this, function (behavior, name) {
				var tBehavior = arrIn(this._behaviors, name);
				if (typeof tBehavior["id"] != "number") {
					tBehavior.id = _inc++;
				}
				var cversion = [];
				tBehavior.push(cversion);
				if ((dojo.isString(behavior)) || (dojo.isFunction(behavior))) {
					behavior = {found:behavior};
				}
				forIn(behavior, function (rule, ruleName) {
					arrIn(cversion, ruleName).push(rule);
				});
			});
		};
		var _applyToNode = function (node, action, ruleSetName) {
			if (dojo.isString(action)) {
				if (ruleSetName == "found") {
					dojo.publish(action, [node]);
				} else {
					dojo.connect(node, ruleSetName, function () {
						dojo.publish(action, arguments);
					});
				}
			} else {
				if (dojo.isFunction(action)) {
					if (ruleSetName == "found") {
						action(node);
					} else {
						dojo.connect(node, ruleSetName, action);
					}
				}
			}
		};
		this.apply = function () {
			forIn(this._behaviors, function (tBehavior, id) {
				dojo.query(id).forEach(function (elem) {
					var runFrom = 0;
					var bid = "_dj_behavior_" + tBehavior.id;
					if (typeof elem[bid] == "number") {
						runFrom = elem[bid];
						if (runFrom == (tBehavior.length)) {
							return;
						}
					}
					for (var x = runFrom, tver; tver = tBehavior[x]; x++) {
						forIn(tver, function (ruleSet, ruleSetName) {
							if (dojo.isArray(ruleSet)) {
								dojo.forEach(ruleSet, function (action) {
									_applyToNode(elem, action, ruleSetName);
								});
							}
						});
					}
					elem[bid] = tBehavior.length;
				});
			});
		};
	};
	dojo.addOnLoad(dojo.behavior, "apply");
}

