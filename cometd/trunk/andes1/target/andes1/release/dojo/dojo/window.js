/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.window"]) {
	dojo._hasResource["dojo.window"] = true;
	dojo.provide("dojo.window");
	dojo.getObject("window", true, dojo);
	dojo.window.getBox = function () {
		var scrollRoot = (dojo.doc.compatMode == "BackCompat") ? dojo.body() : dojo.doc.documentElement;
		var scroll = dojo._docScroll();
		return {w:scrollRoot.clientWidth, h:scrollRoot.clientHeight, l:scroll.x, t:scroll.y};
	};
	dojo.window.get = function (doc) {
		if (dojo.isIE && window !== document.parentWindow) {
			doc.parentWindow.execScript("document._parentWindow = window;", "Javascript");
			var win = doc._parentWindow;
			doc._parentWindow = null;
			return win;
		}
		return doc.parentWindow || doc.defaultView;
	};
	dojo.window.scrollIntoView = function (node, pos) {
		try {
			node = dojo.byId(node);
			var doc = node.ownerDocument || dojo.doc, body = doc.body || dojo.body(), html = doc.documentElement || body.parentNode, isIE = dojo.isIE, isWK = dojo.isWebKit;
			if ((!(dojo.isMoz || isIE || isWK || dojo.isOpera) || node == body || node == html) && (typeof node.scrollIntoView != "undefined")) {
				node.scrollIntoView(false);
				return;
			}
			var backCompat = doc.compatMode == "BackCompat", clientAreaRoot = (isIE >= 9 && node.ownerDocument.parentWindow.frameElement) ? ((html.clientHeight > 0 && html.clientWidth > 0 && (body.clientHeight == 0 || body.clientWidth == 0 || body.clientHeight > html.clientHeight || body.clientWidth > html.clientWidth)) ? html : body) : (backCompat ? body : html), scrollRoot = isWK ? body : clientAreaRoot, rootWidth = clientAreaRoot.clientWidth, rootHeight = clientAreaRoot.clientHeight, rtl = !dojo._isBodyLtr(), nodePos = pos || dojo.position(node), el = node.parentNode, isFixed = function (el) {
				return ((isIE <= 6 || (isIE && backCompat)) ? false : (dojo.style(el, "position").toLowerCase() == "fixed"));
			};
			if (isFixed(node)) {
				return;
			}
			while (el) {
				if (el == body) {
					el = scrollRoot;
				}
				var elPos = dojo.position(el), fixedPos = isFixed(el);
				if (el == scrollRoot) {
					elPos.w = rootWidth;
					elPos.h = rootHeight;
					if (scrollRoot == html && isIE && rtl) {
						elPos.x += scrollRoot.offsetWidth - elPos.w;
					}
					if (elPos.x < 0 || !isIE) {
						elPos.x = 0;
					}
					if (elPos.y < 0 || !isIE) {
						elPos.y = 0;
					}
				} else {
					var pb = dojo._getPadBorderExtents(el);
					elPos.w -= pb.w;
					elPos.h -= pb.h;
					elPos.x += pb.l;
					elPos.y += pb.t;
					var clientSize = el.clientWidth, scrollBarSize = elPos.w - clientSize;
					if (clientSize > 0 && scrollBarSize > 0) {
						elPos.w = clientSize;
						elPos.x += (rtl && (isIE || el.clientLeft > pb.l)) ? scrollBarSize : 0;
					}
					clientSize = el.clientHeight;
					scrollBarSize = elPos.h - clientSize;
					if (clientSize > 0 && scrollBarSize > 0) {
						elPos.h = clientSize;
					}
				}
				if (fixedPos) {
					if (elPos.y < 0) {
						elPos.h += elPos.y;
						elPos.y = 0;
					}
					if (elPos.x < 0) {
						elPos.w += elPos.x;
						elPos.x = 0;
					}
					if (elPos.y + elPos.h > rootHeight) {
						elPos.h = rootHeight - elPos.y;
					}
					if (elPos.x + elPos.w > rootWidth) {
						elPos.w = rootWidth - elPos.x;
					}
				}
				var l = nodePos.x - elPos.x, t = nodePos.y - Math.max(elPos.y, 0), r = l + nodePos.w - elPos.w, bot = t + nodePos.h - elPos.h;
				if (r * l > 0) {
					var s = Math[l < 0 ? "max" : "min"](l, r);
					if (rtl && ((isIE == 8 && !backCompat) || isIE >= 9)) {
						s = -s;
					}
					nodePos.x += el.scrollLeft;
					el.scrollLeft += s;
					nodePos.x -= el.scrollLeft;
				}
				if (bot * t > 0) {
					nodePos.y += el.scrollTop;
					el.scrollTop += Math[t < 0 ? "max" : "min"](t, bot);
					nodePos.y -= el.scrollTop;
				}
				el = (el != scrollRoot) && !fixedPos && el.parentNode;
			}
		}
		catch (error) {
			console.error("scrollIntoView: " + error);
			node.scrollIntoView(false);
		}
	};
}

