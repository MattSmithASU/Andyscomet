/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo._base.html"]) {
	dojo._hasResource["dojo._base.html"] = true;
	dojo.provide("dojo._base.html");
	dojo.require("dojo._base.lang");
	try {
		document.execCommand("BackgroundImageCache", false, true);
	}
	catch (e) {
	}
	if (dojo.isIE) {
		dojo.byId = function (id, doc) {
			if (typeof id != "string") {
				return id;
			}
			var _d = doc || dojo.doc, te = _d.getElementById(id);
			if (te && (te.attributes.id.value == id || te.id == id)) {
				return te;
			} else {
				var eles = _d.all[id];
				if (!eles || eles.nodeName) {
					eles = [eles];
				}
				var i = 0;
				while ((te = eles[i++])) {
					if ((te.attributes && te.attributes.id && te.attributes.id.value == id) || te.id == id) {
						return te;
					}
				}
			}
		};
	} else {
		dojo.byId = function (id, doc) {
			return ((typeof id == "string") ? (doc || dojo.doc).getElementById(id) : id) || null;
		};
	}
	(function () {
		var d = dojo;
		var byId = d.byId;
		var _destroyContainer = null, _destroyDoc;
		d.addOnWindowUnload(function () {
			_destroyContainer = null;
		});
		dojo._destroyElement = dojo.destroy = function (node) {
			node = byId(node);
			try {
				var doc = node.ownerDocument;
				if (!_destroyContainer || _destroyDoc != doc) {
					_destroyContainer = doc.createElement("div");
					_destroyDoc = doc;
				}
				_destroyContainer.appendChild(node.parentNode ? node.parentNode.removeChild(node) : node);
				_destroyContainer.innerHTML = "";
			}
			catch (e) {
			}
		};
		dojo.isDescendant = function (node, ancestor) {
			try {
				node = byId(node);
				ancestor = byId(ancestor);
				while (node) {
					if (node == ancestor) {
						return true;
					}
					node = node.parentNode;
				}
			}
			catch (e) {
			}
			return false;
		};
		dojo.setSelectable = function (node, selectable) {
			node = byId(node);
			if (d.isMozilla) {
				node.style.MozUserSelect = selectable ? "" : "none";
			} else {
				if (d.isKhtml || d.isWebKit) {
					node.style.KhtmlUserSelect = selectable ? "auto" : "none";
				} else {
					if (d.isIE) {
						var v = (node.unselectable = selectable ? "" : "on");
						d.query("*", node).forEach("item.unselectable = '" + v + "'");
					}
				}
			}
		};
		var _insertBefore = function (node, ref) {
			var parent = ref.parentNode;
			if (parent) {
				parent.insertBefore(node, ref);
			}
		};
		var _insertAfter = function (node, ref) {
			var parent = ref.parentNode;
			if (parent) {
				if (parent.lastChild == ref) {
					parent.appendChild(node);
				} else {
					parent.insertBefore(node, ref.nextSibling);
				}
			}
		};
		dojo.place = function (node, refNode, position) {
			refNode = byId(refNode);
			if (typeof node == "string") {
				node = /^\s*</.test(node) ? d._toDom(node, refNode.ownerDocument) : byId(node);
			}
			if (typeof position == "number") {
				var cn = refNode.childNodes;
				if (!cn.length || cn.length <= position) {
					refNode.appendChild(node);
				} else {
					_insertBefore(node, cn[position < 0 ? 0 : position]);
				}
			} else {
				switch (position) {
				  case "before":
					_insertBefore(node, refNode);
					break;
				  case "after":
					_insertAfter(node, refNode);
					break;
				  case "replace":
					refNode.parentNode.replaceChild(node, refNode);
					break;
				  case "only":
					d.empty(refNode);
					refNode.appendChild(node);
					break;
				  case "first":
					if (refNode.firstChild) {
						_insertBefore(node, refNode.firstChild);
						break;
					}
				  default:
					refNode.appendChild(node);
				}
			}
			return node;
		};
		dojo.boxModel = "content-box";
		if (d.isIE) {
			d.boxModel = document.compatMode == "BackCompat" ? "border-box" : "content-box";
		}
		var gcs;
		if (d.isWebKit) {
			gcs = function (node) {
				var s;
				if (node.nodeType == 1) {
					var dv = node.ownerDocument.defaultView;
					s = dv.getComputedStyle(node, null);
					if (!s && node.style) {
						node.style.display = "";
						s = dv.getComputedStyle(node, null);
					}
				}
				return s || {};
			};
		} else {
			if (d.isIE) {
				gcs = function (node) {
					return node.nodeType == 1 ? node.currentStyle : {};
				};
			} else {
				gcs = function (node) {
					return node.nodeType == 1 ? node.ownerDocument.defaultView.getComputedStyle(node, null) : {};
				};
			}
		}
		dojo.getComputedStyle = gcs;
		if (!d.isIE) {
			d._toPixelValue = function (element, value) {
				return parseFloat(value) || 0;
			};
		} else {
			d._toPixelValue = function (element, avalue) {
				if (!avalue) {
					return 0;
				}
				if (avalue == "medium") {
					return 4;
				}
				if (avalue.slice && avalue.slice(-2) == "px") {
					return parseFloat(avalue);
				}
				with (element) {
					var sLeft = style.left;
					var rsLeft = runtimeStyle.left;
					runtimeStyle.left = currentStyle.left;
					try {
						style.left = avalue;
						avalue = style.pixelLeft;
					}
					catch (e) {
						avalue = 0;
					}
					style.left = sLeft;
					runtimeStyle.left = rsLeft;
				}
				return avalue;
			};
		}
		var px = d._toPixelValue;
		var astr = "DXImageTransform.Microsoft.Alpha";
		var af = function (n, f) {
			try {
				return n.filters.item(astr);
			}
			catch (e) {
				return f ? {} : null;
			}
		};
		dojo._getOpacity = d.isIE < 9 ? function (node) {
			try {
				return af(node).Opacity / 100;
			}
			catch (e) {
				return 1;
			}
		} : function (node) {
			return gcs(node).opacity;
		};
		dojo._setOpacity = d.isIE < 9 ? function (node, opacity) {
			var ov = opacity * 100, opaque = opacity == 1;
			node.style.zoom = opaque ? "" : 1;
			if (!af(node)) {
				if (opaque) {
					return opacity;
				}
				node.style.filter += " progid:" + astr + "(Opacity=" + ov + ")";
			} else {
				af(node, 1).Opacity = ov;
			}
			af(node, 1).Enabled = !opaque;
			if (node.nodeName.toLowerCase() == "tr") {
				d.query("> td", node).forEach(function (i) {
					d._setOpacity(i, opacity);
				});
			}
			return opacity;
		} : function (node, opacity) {
			return node.style.opacity = opacity;
		};
		var _pixelNamesCache = {left:true, top:true};
		var _pixelRegExp = /margin|padding|width|height|max|min|offset/;
		var _toStyleValue = function (node, type, value) {
			type = type.toLowerCase();
			if (d.isIE) {
				if (value == "auto") {
					if (type == "height") {
						return node.offsetHeight;
					}
					if (type == "width") {
						return node.offsetWidth;
					}
				}
				if (type == "fontweight") {
					switch (value) {
					  case 700:
						return "bold";
					  case 400:
					  default:
						return "normal";
					}
				}
			}
			if (!(type in _pixelNamesCache)) {
				_pixelNamesCache[type] = _pixelRegExp.test(type);
			}
			return _pixelNamesCache[type] ? px(node, value) : value;
		};
		var _floatStyle = d.isIE ? "styleFloat" : "cssFloat", _floatAliases = {"cssFloat":_floatStyle, "styleFloat":_floatStyle, "float":_floatStyle};
		dojo.style = function (node, style, value) {
			var n = byId(node), args = arguments.length, op = (style == "opacity");
			style = _floatAliases[style] || style;
			if (args == 3) {
				return op ? d._setOpacity(n, value) : n.style[style] = value;
			}
			if (args == 2 && op) {
				return d._getOpacity(n);
			}
			var s = gcs(n);
			if (args == 2 && typeof style != "string") {
				for (var x in style) {
					d.style(node, x, style[x]);
				}
				return s;
			}
			return (args == 1) ? s : _toStyleValue(n, style, s[style] || n.style[style]);
		};
		dojo._getPadExtents = function (n, computedStyle) {
			var s = computedStyle || gcs(n), l = px(n, s.paddingLeft), t = px(n, s.paddingTop);
			return {l:l, t:t, w:l + px(n, s.paddingRight), h:t + px(n, s.paddingBottom)};
		};
		dojo._getBorderExtents = function (n, computedStyle) {
			var ne = "none", s = computedStyle || gcs(n), bl = (s.borderLeftStyle != ne ? px(n, s.borderLeftWidth) : 0), bt = (s.borderTopStyle != ne ? px(n, s.borderTopWidth) : 0);
			return {l:bl, t:bt, w:bl + (s.borderRightStyle != ne ? px(n, s.borderRightWidth) : 0), h:bt + (s.borderBottomStyle != ne ? px(n, s.borderBottomWidth) : 0)};
		};
		dojo._getPadBorderExtents = function (n, computedStyle) {
			var s = computedStyle || gcs(n), p = d._getPadExtents(n, s), b = d._getBorderExtents(n, s);
			return {l:p.l + b.l, t:p.t + b.t, w:p.w + b.w, h:p.h + b.h};
		};
		dojo._getMarginExtents = function (n, computedStyle) {
			var s = computedStyle || gcs(n), l = px(n, s.marginLeft), t = px(n, s.marginTop), r = px(n, s.marginRight), b = px(n, s.marginBottom);
			if (d.isWebKit && (s.position != "absolute")) {
				r = l;
			}
			return {l:l, t:t, w:l + r, h:t + b};
		};
		dojo._getMarginBox = function (node, computedStyle) {
			var s = computedStyle || gcs(node), me = d._getMarginExtents(node, s);
			var l = node.offsetLeft - me.l, t = node.offsetTop - me.t, p = node.parentNode;
			if (d.isMoz) {
				var sl = parseFloat(s.left), st = parseFloat(s.top);
				if (!isNaN(sl) && !isNaN(st)) {
					l = sl, t = st;
				} else {
					if (p && p.style) {
						var pcs = gcs(p);
						if (pcs.overflow != "visible") {
							var be = d._getBorderExtents(p, pcs);
							l += be.l, t += be.t;
						}
					}
				}
			} else {
				if (d.isOpera || (d.isIE > 7 && !d.isQuirks)) {
					if (p) {
						be = d._getBorderExtents(p);
						l -= be.l;
						t -= be.t;
					}
				}
			}
			return {l:l, t:t, w:node.offsetWidth + me.w, h:node.offsetHeight + me.h};
		};
		dojo._getMarginSize = function (node, computedStyle) {
			node = byId(node);
			var me = d._getMarginExtents(node, computedStyle || gcs(node));
			var size = node.getBoundingClientRect();
			return {w:(size.right - size.left) + me.w, h:(size.bottom - size.top) + me.h};
		};
		dojo._getContentBox = function (node, computedStyle) {
			var s = computedStyle || gcs(node), pe = d._getPadExtents(node, s), be = d._getBorderExtents(node, s), w = node.clientWidth, h;
			if (!w) {
				w = node.offsetWidth, h = node.offsetHeight;
			} else {
				h = node.clientHeight, be.w = be.h = 0;
			}
			if (d.isOpera) {
				pe.l += be.l;
				pe.t += be.t;
			}
			return {l:pe.l, t:pe.t, w:w - pe.w - be.w, h:h - pe.h - be.h};
		};
		dojo._getBorderBox = function (node, computedStyle) {
			var s = computedStyle || gcs(node), pe = d._getPadExtents(node, s), cb = d._getContentBox(node, s);
			return {l:cb.l - pe.l, t:cb.t - pe.t, w:cb.w + pe.w, h:cb.h + pe.h};
		};
		dojo._setBox = function (node, l, t, w, h, u) {
			u = u || "px";
			var s = node.style;
			if (!isNaN(l)) {
				s.left = l + u;
			}
			if (!isNaN(t)) {
				s.top = t + u;
			}
			if (w >= 0) {
				s.width = w + u;
			}
			if (h >= 0) {
				s.height = h + u;
			}
		};
		dojo._isButtonTag = function (node) {
			return node.tagName == "BUTTON" || node.tagName == "INPUT" && (node.getAttribute("type") || "").toUpperCase() == "BUTTON";
		};
		dojo._usesBorderBox = function (node) {
			var n = node.tagName;
			return d.boxModel == "border-box" || n == "TABLE" || d._isButtonTag(node);
		};
		dojo._setContentSize = function (node, widthPx, heightPx, computedStyle) {
			if (d._usesBorderBox(node)) {
				var pb = d._getPadBorderExtents(node, computedStyle);
				if (widthPx >= 0) {
					widthPx += pb.w;
				}
				if (heightPx >= 0) {
					heightPx += pb.h;
				}
			}
			d._setBox(node, NaN, NaN, widthPx, heightPx);
		};
		dojo._setMarginBox = function (node, leftPx, topPx, widthPx, heightPx, computedStyle) {
			var s = computedStyle || gcs(node), bb = d._usesBorderBox(node), pb = bb ? _nilExtents : d._getPadBorderExtents(node, s);
			if (d.isWebKit) {
				if (d._isButtonTag(node)) {
					var ns = node.style;
					if (widthPx >= 0 && !ns.width) {
						ns.width = "4px";
					}
					if (heightPx >= 0 && !ns.height) {
						ns.height = "4px";
					}
				}
			}
			var mb = d._getMarginExtents(node, s);
			if (widthPx >= 0) {
				widthPx = Math.max(widthPx - pb.w - mb.w, 0);
			}
			if (heightPx >= 0) {
				heightPx = Math.max(heightPx - pb.h - mb.h, 0);
			}
			d._setBox(node, leftPx, topPx, widthPx, heightPx);
		};
		var _nilExtents = {l:0, t:0, w:0, h:0};
		dojo.marginBox = function (node, box) {
			var n = byId(node), s = gcs(n), b = box;
			return !b ? d._getMarginBox(n, s) : d._setMarginBox(n, b.l, b.t, b.w, b.h, s);
		};
		dojo.contentBox = function (node, box) {
			var n = byId(node), s = gcs(n), b = box;
			return !b ? d._getContentBox(n, s) : d._setContentSize(n, b.w, b.h, s);
		};
		var _sumAncestorProperties = function (node, prop) {
			if (!(node = (node || 0).parentNode)) {
				return 0;
			}
			var val, retVal = 0, _b = d.body();
			while (node && node.style) {
				if (gcs(node).position == "fixed") {
					return 0;
				}
				val = node[prop];
				if (val) {
					retVal += val - 0;
					if (node == _b) {
						break;
					}
				}
				node = node.parentNode;
			}
			return retVal;
		};
		dojo._docScroll = function () {
			var n = d.global;
			return "pageXOffset" in n ? {x:n.pageXOffset, y:n.pageYOffset} : (n = d.isQuirks ? d.doc.body : d.doc.documentElement, {x:d._fixIeBiDiScrollLeft(n.scrollLeft || 0), y:n.scrollTop || 0});
		};
		dojo._isBodyLtr = function () {
			return "_bodyLtr" in d ? d._bodyLtr : d._bodyLtr = (d.body().dir || d.doc.documentElement.dir || "ltr").toLowerCase() == "ltr";
		};
		dojo._getIeDocumentElementOffset = function () {
			var de = d.doc.documentElement;
			if (d.isIE < 8) {
				var r = de.getBoundingClientRect();
				var l = r.left, t = r.top;
				if (d.isIE < 7) {
					l += de.clientLeft;
					t += de.clientTop;
				}
				return {x:l < 0 ? 0 : l, y:t < 0 ? 0 : t};
			} else {
				return {x:0, y:0};
			}
		};
		dojo._fixIeBiDiScrollLeft = function (scrollLeft) {
			var ie = d.isIE;
			if (ie && !d._isBodyLtr()) {
				var qk = d.isQuirks, de = qk ? d.doc.body : d.doc.documentElement;
				if (ie == 6 && !qk && d.global.frameElement && de.scrollHeight > de.clientHeight) {
					scrollLeft += de.clientLeft;
				}
				return (ie < 8 || qk) ? (scrollLeft + de.clientWidth - de.scrollWidth) : -scrollLeft;
			}
			return scrollLeft;
		};
		dojo._abs = dojo.position = function (node, includeScroll) {
			node = byId(node);
			var db = d.body(), dh = db.parentNode, ret = node.getBoundingClientRect();
			ret = {x:ret.left, y:ret.top, w:ret.right - ret.left, h:ret.bottom - ret.top};
			if (d.isIE) {
				var offset = d._getIeDocumentElementOffset();
				ret.x -= offset.x + (d.isQuirks ? db.clientLeft + db.offsetLeft : 0);
				ret.y -= offset.y + (d.isQuirks ? db.clientTop + db.offsetTop : 0);
			} else {
				if (d.isFF == 3) {
					var cs = gcs(dh);
					ret.x -= px(dh, cs.marginLeft) + px(dh, cs.borderLeftWidth);
					ret.y -= px(dh, cs.marginTop) + px(dh, cs.borderTopWidth);
				}
			}
			if (includeScroll) {
				var scroll = d._docScroll();
				ret.x += scroll.x;
				ret.y += scroll.y;
			}
			return ret;
		};
		dojo.coords = function (node, includeScroll) {
			var n = byId(node), s = gcs(n), mb = d._getMarginBox(n, s);
			var abs = d.position(n, includeScroll);
			mb.x = abs.x;
			mb.y = abs.y;
			return mb;
		};
		var _propNames = {"class":"className", "for":"htmlFor", tabindex:"tabIndex", readonly:"readOnly", colspan:"colSpan", frameborder:"frameBorder", rowspan:"rowSpan", valuetype:"valueType"}, _attrNames = {classname:"class", htmlfor:"for", tabindex:"tabIndex", readonly:"readOnly"}, _forcePropNames = {innerHTML:1, className:1, htmlFor:d.isIE, value:1};
		var _fixAttrName = function (name) {
			return _attrNames[name.toLowerCase()] || name;
		};
		var _hasAttr = function (node, name) {
			var attr = node.getAttributeNode && node.getAttributeNode(name);
			return attr && attr.specified;
		};
		dojo.hasAttr = function (node, name) {
			var lc = name.toLowerCase();
			return _forcePropNames[_propNames[lc] || name] || _hasAttr(byId(node), _attrNames[lc] || name);
		};
		var _evtHdlrMap = {}, _ctr = 0, _attrId = dojo._scopeName + "attrid", _roInnerHtml = {col:1, colgroup:1, table:1, tbody:1, tfoot:1, thead:1, tr:1, title:1};
		dojo.attr = function (node, name, value) {
			node = byId(node);
			var args = arguments.length, prop;
			if (args == 2 && typeof name != "string") {
				for (var x in name) {
					d.attr(node, x, name[x]);
				}
				return node;
			}
			var lc = name.toLowerCase(), propName = _propNames[lc] || name, forceProp = _forcePropNames[propName], attrName = _attrNames[lc] || name;
			if (args == 3) {
				do {
					if (propName == "style" && typeof value != "string") {
						d.style(node, value);
						break;
					}
					if (propName == "innerHTML") {
						if (d.isIE && node.tagName.toLowerCase() in _roInnerHtml) {
							d.empty(node);
							node.appendChild(d._toDom(value, node.ownerDocument));
						} else {
							node[propName] = value;
						}
						break;
					}
					if (d.isFunction(value)) {
						var attrId = d.attr(node, _attrId);
						if (!attrId) {
							attrId = _ctr++;
							d.attr(node, _attrId, attrId);
						}
						if (!_evtHdlrMap[attrId]) {
							_evtHdlrMap[attrId] = {};
						}
						var h = _evtHdlrMap[attrId][propName];
						if (h) {
							d.disconnect(h);
						} else {
							try {
								delete node[propName];
							}
							catch (e) {
							}
						}
						_evtHdlrMap[attrId][propName] = d.connect(node, propName, value);
						break;
					}
					if (forceProp || typeof value == "boolean") {
						node[propName] = value;
						break;
					}
					node.setAttribute(attrName, value);
				} while (false);
				return node;
			}
			value = node[propName];
			if (forceProp && typeof value != "undefined") {
				return value;
			}
			if (propName != "href" && (typeof value == "boolean" || d.isFunction(value))) {
				return value;
			}
			return _hasAttr(node, attrName) ? node.getAttribute(attrName) : null;
		};
		dojo.removeAttr = function (node, name) {
			byId(node).removeAttribute(_fixAttrName(name));
		};
		dojo.getNodeProp = function (node, name) {
			node = byId(node);
			var lc = name.toLowerCase(), propName = _propNames[lc] || name;
			if ((propName in node) && propName != "href") {
				return node[propName];
			}
			var attrName = _attrNames[lc] || name;
			return _hasAttr(node, attrName) ? node.getAttribute(attrName) : null;
		};
		dojo.create = function (tag, attrs, refNode, pos) {
			var doc = d.doc;
			if (refNode) {
				refNode = byId(refNode);
				doc = refNode.ownerDocument;
			}
			if (typeof tag == "string") {
				tag = doc.createElement(tag);
			}
			if (attrs) {
				d.attr(tag, attrs);
			}
			if (refNode) {
				d.place(tag, refNode, pos);
			}
			return tag;
		};
		d.empty = d.isIE ? function (node) {
			node = byId(node);
			for (var c; c = node.lastChild; ) {
				d.destroy(c);
			}
		} : function (node) {
			byId(node).innerHTML = "";
		};
		var tagWrap = {option:["select"], tbody:["table"], thead:["table"], tfoot:["table"], tr:["table", "tbody"], td:["table", "tbody", "tr"], th:["table", "thead", "tr"], legend:["fieldset"], caption:["table"], colgroup:["table"], col:["table", "colgroup"], li:["ul"]}, reTag = /<\s*([\w\:]+)/, masterNode = {}, masterNum = 0, masterName = "__" + d._scopeName + "ToDomId";
		for (var param in tagWrap) {
			if (tagWrap.hasOwnProperty(param)) {
				var tw = tagWrap[param];
				tw.pre = param == "option" ? "<select multiple=\"multiple\">" : "<" + tw.join("><") + ">";
				tw.post = "</" + tw.reverse().join("></") + ">";
			}
		}
		d._toDom = function (frag, doc) {
			doc = doc || d.doc;
			var masterId = doc[masterName];
			if (!masterId) {
				doc[masterName] = masterId = ++masterNum + "";
				masterNode[masterId] = doc.createElement("div");
			}
			frag += "";
			var match = frag.match(reTag), tag = match ? match[1].toLowerCase() : "", master = masterNode[masterId], wrap, i, fc, df;
			if (match && tagWrap[tag]) {
				wrap = tagWrap[tag];
				master.innerHTML = wrap.pre + frag + wrap.post;
				for (i = wrap.length; i; --i) {
					master = master.firstChild;
				}
			} else {
				master.innerHTML = frag;
			}
			if (master.childNodes.length == 1) {
				return master.removeChild(master.firstChild);
			}
			df = doc.createDocumentFragment();
			while (fc = master.firstChild) {
				df.appendChild(fc);
			}
			return df;
		};
		var _className = "className";
		dojo.hasClass = function (node, classStr) {
			return ((" " + byId(node)[_className] + " ").indexOf(" " + classStr + " ") >= 0);
		};
		var spaces = /\s+/, a1 = [""], fakeNode = {}, str2array = function (s) {
			if (typeof s == "string" || s instanceof String) {
				if (s.indexOf(" ") < 0) {
					a1[0] = s;
					return a1;
				} else {
					return s.split(spaces);
				}
			}
			return s || "";
		};
		dojo.addClass = function (node, classStr) {
			node = byId(node);
			classStr = str2array(classStr);
			var cls = node[_className], oldLen;
			cls = cls ? " " + cls + " " : " ";
			oldLen = cls.length;
			for (var i = 0, len = classStr.length, c; i < len; ++i) {
				c = classStr[i];
				if (c && cls.indexOf(" " + c + " ") < 0) {
					cls += c + " ";
				}
			}
			if (oldLen < cls.length) {
				node[_className] = cls.substr(1, cls.length - 2);
			}
		};
		dojo.removeClass = function (node, classStr) {
			node = byId(node);
			var cls;
			if (classStr !== undefined) {
				classStr = str2array(classStr);
				cls = " " + node[_className] + " ";
				for (var i = 0, len = classStr.length; i < len; ++i) {
					cls = cls.replace(" " + classStr[i] + " ", " ");
				}
				cls = d.trim(cls);
			} else {
				cls = "";
			}
			if (node[_className] != cls) {
				node[_className] = cls;
			}
		};
		dojo.replaceClass = function (node, addClassStr, removeClassStr) {
			node = byId(node);
			fakeNode.className = node.className;
			dojo.removeClass(fakeNode, removeClassStr);
			dojo.addClass(fakeNode, addClassStr);
			if (node.className !== fakeNode.className) {
				node.className = fakeNode.className;
			}
		};
		dojo.toggleClass = function (node, classStr, condition) {
			if (condition === undefined) {
				condition = !d.hasClass(node, classStr);
			}
			d[condition ? "addClass" : "removeClass"](node, classStr);
		};
	})();
}

