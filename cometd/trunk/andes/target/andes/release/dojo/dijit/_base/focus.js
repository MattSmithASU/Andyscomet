/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._base.focus"]) {
	dojo._hasResource["dijit._base.focus"] = true;
	dojo.provide("dijit._base.focus");
	dojo.require("dojo.window");
	dojo.require("dijit._base.manager");
	dojo.mixin(dijit, {_curFocus:null, _prevFocus:null, isCollapsed:function () {
		return dijit.getBookmark().isCollapsed;
	}, getBookmark:function () {
		var bm, rg, tg, sel = dojo.doc.selection, cf = dijit._curFocus;
		if (dojo.global.getSelection) {
			sel = dojo.global.getSelection();
			if (sel) {
				if (sel.isCollapsed) {
					tg = cf ? cf.tagName : "";
					if (tg) {
						tg = tg.toLowerCase();
						if (tg == "textarea" || (tg == "input" && (!cf.type || cf.type.toLowerCase() == "text"))) {
							sel = {start:cf.selectionStart, end:cf.selectionEnd, node:cf, pRange:true};
							return {isCollapsed:(sel.end <= sel.start), mark:sel};
						}
					}
					bm = {isCollapsed:true};
					if (sel.rangeCount) {
						bm.mark = sel.getRangeAt(0).cloneRange();
					}
				} else {
					rg = sel.getRangeAt(0);
					bm = {isCollapsed:false, mark:rg.cloneRange()};
				}
			}
		} else {
			if (sel) {
				tg = cf ? cf.tagName : "";
				tg = tg.toLowerCase();
				if (cf && tg && (tg == "button" || tg == "textarea" || tg == "input")) {
					if (sel.type && sel.type.toLowerCase() == "none") {
						return {isCollapsed:true, mark:null};
					} else {
						rg = sel.createRange();
						return {isCollapsed:rg.text && rg.text.length ? false : true, mark:{range:rg, pRange:true}};
					}
				}
				bm = {};
				try {
					rg = sel.createRange();
					bm.isCollapsed = !(sel.type == "Text" ? rg.htmlText.length : rg.length);
				}
				catch (e) {
					bm.isCollapsed = true;
					return bm;
				}
				if (sel.type.toUpperCase() == "CONTROL") {
					if (rg.length) {
						bm.mark = [];
						var i = 0, len = rg.length;
						while (i < len) {
							bm.mark.push(rg.item(i++));
						}
					} else {
						bm.isCollapsed = true;
						bm.mark = null;
					}
				} else {
					bm.mark = rg.getBookmark();
				}
			} else {
				console.warn("No idea how to store the current selection for this browser!");
			}
		}
		return bm;
	}, moveToBookmark:function (bookmark) {
		var _doc = dojo.doc, mark = bookmark.mark;
		if (mark) {
			if (dojo.global.getSelection) {
				var sel = dojo.global.getSelection();
				if (sel && sel.removeAllRanges) {
					if (mark.pRange) {
						var r = mark;
						var n = r.node;
						n.selectionStart = r.start;
						n.selectionEnd = r.end;
					} else {
						sel.removeAllRanges();
						sel.addRange(mark);
					}
				} else {
					console.warn("No idea how to restore selection for this browser!");
				}
			} else {
				if (_doc.selection && mark) {
					var rg;
					if (mark.pRange) {
						rg = mark.range;
					} else {
						if (dojo.isArray(mark)) {
							rg = _doc.body.createControlRange();
							dojo.forEach(mark, function (n) {
								rg.addElement(n);
							});
						} else {
							rg = _doc.body.createTextRange();
							rg.moveToBookmark(mark);
						}
					}
					rg.select();
				}
			}
		}
	}, getFocus:function (menu, openedForWindow) {
		var node = !dijit._curFocus || (menu && dojo.isDescendant(dijit._curFocus, menu.domNode)) ? dijit._prevFocus : dijit._curFocus;
		return {node:node, bookmark:(node == dijit._curFocus) && dojo.withGlobal(openedForWindow || dojo.global, dijit.getBookmark), openedForWindow:openedForWindow};
	}, focus:function (handle) {
		if (!handle) {
			return;
		}
		var node = "node" in handle ? handle.node : handle, bookmark = handle.bookmark, openedForWindow = handle.openedForWindow, collapsed = bookmark ? bookmark.isCollapsed : false;
		if (node) {
			var focusNode = (node.tagName.toLowerCase() == "iframe") ? node.contentWindow : node;
			if (focusNode && focusNode.focus) {
				try {
					focusNode.focus();
				}
				catch (e) {
				}
			}
			dijit._onFocusNode(node);
		}
		if (bookmark && dojo.withGlobal(openedForWindow || dojo.global, dijit.isCollapsed) && !collapsed) {
			if (openedForWindow) {
				openedForWindow.focus();
			}
			try {
				dojo.withGlobal(openedForWindow || dojo.global, dijit.moveToBookmark, null, [bookmark]);
			}
			catch (e2) {
			}
		}
	}, _activeStack:[], registerIframe:function (iframe) {
		return dijit.registerWin(iframe.contentWindow, iframe);
	}, unregisterIframe:function (handle) {
		dijit.unregisterWin(handle);
	}, registerWin:function (targetWindow, effectiveNode) {
		var mousedownListener = function (evt) {
			dijit._justMouseDowned = true;
			setTimeout(function () {
				dijit._justMouseDowned = false;
			}, 0);
			if (dojo.isIE && evt && evt.srcElement && evt.srcElement.parentNode == null) {
				return;
			}
			dijit._onTouchNode(effectiveNode || evt.target || evt.srcElement, "mouse");
		};
		var doc = dojo.isIE ? targetWindow.document.documentElement : targetWindow.document;
		if (doc) {
			if (dojo.isIE) {
				targetWindow.document.body.attachEvent("onmousedown", mousedownListener);
				var activateListener = function (evt) {
					if (evt.srcElement.tagName.toLowerCase() != "#document" && dijit.isTabNavigable(evt.srcElement)) {
						dijit._onFocusNode(effectiveNode || evt.srcElement);
					} else {
						dijit._onTouchNode(effectiveNode || evt.srcElement);
					}
				};
				doc.attachEvent("onactivate", activateListener);
				var deactivateListener = function (evt) {
					dijit._onBlurNode(effectiveNode || evt.srcElement);
				};
				doc.attachEvent("ondeactivate", deactivateListener);
				return function () {
					targetWindow.document.detachEvent("onmousedown", mousedownListener);
					doc.detachEvent("onactivate", activateListener);
					doc.detachEvent("ondeactivate", deactivateListener);
					doc = null;
				};
			} else {
				doc.body.addEventListener("mousedown", mousedownListener, true);
				var focusListener = function (evt) {
					dijit._onFocusNode(effectiveNode || evt.target);
				};
				doc.addEventListener("focus", focusListener, true);
				var blurListener = function (evt) {
					dijit._onBlurNode(effectiveNode || evt.target);
				};
				doc.addEventListener("blur", blurListener, true);
				return function () {
					doc.body.removeEventListener("mousedown", mousedownListener, true);
					doc.removeEventListener("focus", focusListener, true);
					doc.removeEventListener("blur", blurListener, true);
					doc = null;
				};
			}
		}
	}, unregisterWin:function (handle) {
		handle && handle();
	}, _onBlurNode:function (node) {
		dijit._prevFocus = dijit._curFocus;
		dijit._curFocus = null;
		if (dijit._justMouseDowned) {
			return;
		}
		if (dijit._clearActiveWidgetsTimer) {
			clearTimeout(dijit._clearActiveWidgetsTimer);
		}
		dijit._clearActiveWidgetsTimer = setTimeout(function () {
			delete dijit._clearActiveWidgetsTimer;
			dijit._setStack([]);
			dijit._prevFocus = null;
		}, 100);
	}, _onTouchNode:function (node, by) {
		if (dijit._clearActiveWidgetsTimer) {
			clearTimeout(dijit._clearActiveWidgetsTimer);
			delete dijit._clearActiveWidgetsTimer;
		}
		var newStack = [];
		try {
			while (node) {
				var popupParent = dojo.attr(node, "dijitPopupParent");
				if (popupParent) {
					node = dijit.byId(popupParent).domNode;
				} else {
					if (node.tagName && node.tagName.toLowerCase() == "body") {
						if (node === dojo.body()) {
							break;
						}
						node = dojo.window.get(node.ownerDocument).frameElement;
					} else {
						var id = node.getAttribute && node.getAttribute("widgetId"), widget = id && dijit.byId(id);
						if (widget && !(by == "mouse" && widget.get("disabled"))) {
							newStack.unshift(id);
						}
						node = node.parentNode;
					}
				}
			}
		}
		catch (e) {
		}
		dijit._setStack(newStack, by);
	}, _onFocusNode:function (node) {
		if (!node) {
			return;
		}
		if (node.nodeType == 9) {
			return;
		}
		dijit._onTouchNode(node);
		if (node == dijit._curFocus) {
			return;
		}
		if (dijit._curFocus) {
			dijit._prevFocus = dijit._curFocus;
		}
		dijit._curFocus = node;
		dojo.publish("focusNode", [node]);
	}, _setStack:function (newStack, by) {
		var oldStack = dijit._activeStack;
		dijit._activeStack = newStack;
		for (var nCommon = 0; nCommon < Math.min(oldStack.length, newStack.length); nCommon++) {
			if (oldStack[nCommon] != newStack[nCommon]) {
				break;
			}
		}
		var widget;
		for (var i = oldStack.length - 1; i >= nCommon; i--) {
			widget = dijit.byId(oldStack[i]);
			if (widget) {
				widget._focused = false;
				widget.set("focused", false);
				widget._hasBeenBlurred = true;
				if (widget._onBlur) {
					widget._onBlur(by);
				}
				dojo.publish("widgetBlur", [widget, by]);
			}
		}
		for (i = nCommon; i < newStack.length; i++) {
			widget = dijit.byId(newStack[i]);
			if (widget) {
				widget._focused = true;
				widget.set("focused", true);
				if (widget._onFocus) {
					widget._onFocus(by);
				}
				dojo.publish("widgetFocus", [widget, by]);
			}
		}
	}});
	dojo.addOnLoad(function () {
		var handle = dijit.registerWin(window);
		if (dojo.isIE) {
			dojo.addOnWindowUnload(function () {
				dijit.unregisterWin(handle);
				handle = null;
			});
		}
	});
}

