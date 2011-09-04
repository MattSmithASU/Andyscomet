/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.fx.style"]) {
	dojo._hasResource["dojox.fx.style"] = true;
	dojo.provide("dojox.fx.style");
	dojo.experimental("dojox.fx.style");
	dojo.require("dojo.fx");
	(function () {
		var d = dojo;
		var _getStyleSnapshot = function (cache) {
			return d.map(dojox.fx._allowedProperties, function (style) {
				return cache[style];
			});
		};
		var _getCalculatedStyleChanges = function (node, cssClass, addClass) {
			node = d.byId(node);
			var cs = d.getComputedStyle(node);
			var _before = _getStyleSnapshot(cs);
			d[(addClass ? "addClass" : "removeClass")](node, cssClass);
			var _after = _getStyleSnapshot(cs);
			d[(addClass ? "removeClass" : "addClass")](node, cssClass);
			var calculated = {}, i = 0;
			d.forEach(dojox.fx._allowedProperties, function (prop) {
				if (_before[i] != _after[i]) {
					calculated[prop] = parseInt(_after[i]);
				}
				i++;
			});
			return calculated;
		};
		d.mixin(dojox.fx, {addClass:function (node, cssClass, args) {
			node = d.byId(node);
			var pushClass = (function (n) {
				return function () {
					d.addClass(n, cssClass);
					n.style.cssText = _beforeStyle;
				};
			})(node);
			var mixedProperties = _getCalculatedStyleChanges(node, cssClass, true);
			var _beforeStyle = node.style.cssText;
			var _anim = d.animateProperty(d.mixin({node:node, properties:mixedProperties}, args));
			d.connect(_anim, "onEnd", _anim, pushClass);
			return _anim;
		}, removeClass:function (node, cssClass, args) {
			node = d.byId(node);
			var pullClass = (function (n) {
				return function () {
					d.removeClass(n, cssClass);
					n.style.cssText = _beforeStyle;
				};
			})(node);
			var mixedProperties = _getCalculatedStyleChanges(node, cssClass);
			var _beforeStyle = node.style.cssText;
			var _anim = d.animateProperty(d.mixin({node:node, properties:mixedProperties}, args));
			d.connect(_anim, "onEnd", _anim, pullClass);
			return _anim;
		}, toggleClass:function (node, cssClass, condition, args) {
			if (typeof condition == "undefined") {
				condition = !d.hasClass(node, cssClass);
			}
			return dojox.fx[(condition ? "addClass" : "removeClass")](node, cssClass, args);
		}, _allowedProperties:["width", "height", "left", "top", "backgroundColor", "color", "borderBottomWidth", "borderTopWidth", "borderLeftWidth", "borderRightWidth", "paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "marginLeft", "marginTop", "marginRight", "marginBottom", "lineHeight", "letterSpacing", "fontSize"]});
	})();
}

