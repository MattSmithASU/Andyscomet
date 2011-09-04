/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.fx._base"]) {
	dojo._hasResource["dojox.fx._base"] = true;
	dojo.provide("dojox.fx._base");
	dojo.require("dojo.fx");
	dojo.mixin(dojox.fx, {anim:dojo.anim, animateProperty:dojo.animateProperty, fadeTo:dojo._fade, fadeIn:dojo.fadeIn, fadeOut:dojo.fadeOut, combine:dojo.fx.combine, chain:dojo.fx.chain, slideTo:dojo.fx.slideTo, wipeIn:dojo.fx.wipeIn, wipeOut:dojo.fx.wipeOut});
	dojox.fx.sizeTo = function (args) {
		var node = args.node = dojo.byId(args.node), abs = "absolute";
		var method = args.method || "chain";
		if (!args.duration) {
			args.duration = 500;
		}
		if (method == "chain") {
			args.duration = Math.floor(args.duration / 2);
		}
		var top, newTop, left, newLeft, width, height = null;
		var init = (function (n) {
			return function () {
				var cs = dojo.getComputedStyle(n), pos = cs.position, w = cs.width, h = cs.height;
				top = (pos == abs ? n.offsetTop : parseInt(cs.top) || 0);
				left = (pos == abs ? n.offsetLeft : parseInt(cs.left) || 0);
				width = (w == "auto" ? 0 : parseInt(w));
				height = (h == "auto" ? 0 : parseInt(h));
				newLeft = left - Math.floor((args.width - width) / 2);
				newTop = top - Math.floor((args.height - height) / 2);
				if (pos != abs && pos != "relative") {
					var ret = dojo.coords(n, true);
					top = ret.y;
					left = ret.x;
					n.style.position = abs;
					n.style.top = top + "px";
					n.style.left = left + "px";
				}
			};
		})(node);
		var anim1 = dojo.animateProperty(dojo.mixin({properties:{height:function () {
			init();
			return {end:args.height || 0, start:height};
		}, top:function () {
			return {start:top, end:newTop};
		}}}, args));
		var anim2 = dojo.animateProperty(dojo.mixin({properties:{width:function () {
			return {start:width, end:args.width || 0};
		}, left:function () {
			return {start:left, end:newLeft};
		}}}, args));
		var anim = dojo.fx[(args.method == "combine" ? "combine" : "chain")]([anim1, anim2]);
		return anim;
	};
	dojox.fx.slideBy = function (args) {
		var node = args.node = dojo.byId(args.node), top, left;
		var init = (function (n) {
			return function () {
				var cs = dojo.getComputedStyle(n);
				var pos = cs.position;
				top = (pos == "absolute" ? n.offsetTop : parseInt(cs.top) || 0);
				left = (pos == "absolute" ? n.offsetLeft : parseInt(cs.left) || 0);
				if (pos != "absolute" && pos != "relative") {
					var ret = dojo.coords(n, true);
					top = ret.y;
					left = ret.x;
					n.style.position = "absolute";
					n.style.top = top + "px";
					n.style.left = left + "px";
				}
			};
		})(node);
		init();
		var _anim = dojo.animateProperty(dojo.mixin({properties:{top:top + (args.top || 0), left:left + (args.left || 0)}}, args));
		dojo.connect(_anim, "beforeBegin", _anim, init);
		return _anim;
	};
	dojox.fx.crossFade = function (args) {
		var node1 = args.nodes[0] = dojo.byId(args.nodes[0]), op1 = dojo.style(node1, "opacity"), node2 = args.nodes[1] = dojo.byId(args.nodes[1]), op2 = dojo.style(node2, "opacity");
		var _anim = dojo.fx.combine([dojo[(op1 == 0 ? "fadeIn" : "fadeOut")](dojo.mixin({node:node1}, args)), dojo[(op1 == 0 ? "fadeOut" : "fadeIn")](dojo.mixin({node:node2}, args))]);
		return _anim;
	};
	dojox.fx.highlight = function (args) {
		var node = args.node = dojo.byId(args.node);
		args.duration = args.duration || 400;
		var startColor = args.color || "#ffff99", endColor = dojo.style(node, "backgroundColor");
		if (endColor == "rgba(0, 0, 0, 0)") {
			endColor = "transparent";
		}
		var anim = dojo.animateProperty(dojo.mixin({properties:{backgroundColor:{start:startColor, end:endColor}}}, args));
		if (endColor == "transparent") {
			dojo.connect(anim, "onEnd", anim, function () {
				node.style.backgroundColor = endColor;
			});
		}
		return anim;
	};
	dojox.fx.wipeTo = function (args) {
		args.node = dojo.byId(args.node);
		var node = args.node, s = node.style;
		var dir = (args.width ? "width" : "height"), endVal = args[dir], props = {};
		props[dir] = {start:function () {
			s.overflow = "hidden";
			if (s.visibility == "hidden" || s.display == "none") {
				s[dir] = "1px";
				s.display = "";
				s.visibility = "";
				return 1;
			} else {
				var now = dojo.style(node, dir);
				return Math.max(now, 1);
			}
		}, end:endVal};
		var anim = dojo.animateProperty(dojo.mixin({properties:props}, args));
		return anim;
	};
}

