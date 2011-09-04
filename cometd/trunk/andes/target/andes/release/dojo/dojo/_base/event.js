/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo._base.event"]) {
	dojo._hasResource["dojo._base.event"] = true;
	dojo.provide("dojo._base.event");
	dojo.require("dojo._base.connect");
	(function () {
		var del = (dojo._event_listener = {add:function (node, name, fp) {
			if (!node) {
				return;
			}
			name = del._normalizeEventName(name);
			fp = del._fixCallback(name, fp);
			if (!dojo.isIE && (name == "mouseenter" || name == "mouseleave")) {
				var ofp = fp;
				name = (name == "mouseenter") ? "mouseover" : "mouseout";
				fp = function (e) {
					if (!dojo.isDescendant(e.relatedTarget, node)) {
						return ofp.call(this, e);
					}
				};
			}
			node.addEventListener(name, fp, false);
			return fp;
		}, remove:function (node, event, handle) {
			if (node) {
				event = del._normalizeEventName(event);
				if (!dojo.isIE && (event == "mouseenter" || event == "mouseleave")) {
					event = (event == "mouseenter") ? "mouseover" : "mouseout";
				}
				node.removeEventListener(event, handle, false);
			}
		}, _normalizeEventName:function (name) {
			return name.slice(0, 2) == "on" ? name.slice(2) : name;
		}, _fixCallback:function (name, fp) {
			return name != "keypress" ? fp : function (e) {
				return fp.call(this, del._fixEvent(e, this));
			};
		}, _fixEvent:function (evt, sender) {
			switch (evt.type) {
			  case "keypress":
				del._setKeyChar(evt);
				break;
			}
			return evt;
		}, _setKeyChar:function (evt) {
			evt.keyChar = evt.charCode >= 32 ? String.fromCharCode(evt.charCode) : "";
			evt.charOrCode = evt.keyChar || evt.keyCode;
		}, _punctMap:{106:42, 111:47, 186:59, 187:43, 188:44, 189:45, 190:46, 191:47, 192:96, 219:91, 220:92, 221:93, 222:39}});
		dojo.fixEvent = function (evt, sender) {
			return del._fixEvent(evt, sender);
		};
		dojo.stopEvent = function (evt) {
			evt.preventDefault();
			evt.stopPropagation();
		};
		var node_listener = dojo._listener;
		dojo._connect = function (obj, event, context, method, dontFix) {
			var isNode = obj && (obj.nodeType || obj.attachEvent || obj.addEventListener);
			var lid = isNode ? (dontFix ? 2 : 1) : 0, l = [dojo._listener, del, node_listener][lid];
			var h = l.add(obj, event, dojo.hitch(context, method));
			return [obj, event, h, lid];
		};
		dojo._disconnect = function (obj, event, handle, listener) {
			([dojo._listener, del, node_listener][listener]).remove(obj, event, handle);
		};
		dojo.keys = {BACKSPACE:8, TAB:9, CLEAR:12, ENTER:13, SHIFT:16, CTRL:17, ALT:18, META:dojo.isSafari ? 91 : 224, PAUSE:19, CAPS_LOCK:20, ESCAPE:27, SPACE:32, PAGE_UP:33, PAGE_DOWN:34, END:35, HOME:36, LEFT_ARROW:37, UP_ARROW:38, RIGHT_ARROW:39, DOWN_ARROW:40, INSERT:45, DELETE:46, HELP:47, LEFT_WINDOW:91, RIGHT_WINDOW:92, SELECT:93, NUMPAD_0:96, NUMPAD_1:97, NUMPAD_2:98, NUMPAD_3:99, NUMPAD_4:100, NUMPAD_5:101, NUMPAD_6:102, NUMPAD_7:103, NUMPAD_8:104, NUMPAD_9:105, NUMPAD_MULTIPLY:106, NUMPAD_PLUS:107, NUMPAD_ENTER:108, NUMPAD_MINUS:109, NUMPAD_PERIOD:110, NUMPAD_DIVIDE:111, F1:112, F2:113, F3:114, F4:115, F5:116, F6:117, F7:118, F8:119, F9:120, F10:121, F11:122, F12:123, F13:124, F14:125, F15:126, NUM_LOCK:144, SCROLL_LOCK:145, copyKey:dojo.isMac && !dojo.isAIR ? (dojo.isSafari ? 91 : 224) : 17};
		var evtCopyKey = dojo.isMac ? "metaKey" : "ctrlKey";
		dojo.isCopyKey = function (e) {
			return e[evtCopyKey];
		};
		if (dojo.isIE < 9 || (dojo.isIE && dojo.isQuirks)) {
			dojo.mouseButtons = {LEFT:1, MIDDLE:4, RIGHT:2, isButton:function (e, button) {
				return e.button & button;
			}, isLeft:function (e) {
				return e.button & 1;
			}, isMiddle:function (e) {
				return e.button & 4;
			}, isRight:function (e) {
				return e.button & 2;
			}};
		} else {
			dojo.mouseButtons = {LEFT:0, MIDDLE:1, RIGHT:2, isButton:function (e, button) {
				return e.button == button;
			}, isLeft:function (e) {
				return e.button == 0;
			}, isMiddle:function (e) {
				return e.button == 1;
			}, isRight:function (e) {
				return e.button == 2;
			}};
		}
		if (dojo.isIE) {
			var _trySetKeyCode = function (e, code) {
				try {
					return (e.keyCode = code);
				}
				catch (e) {
					return 0;
				}
			};
			var iel = dojo._listener;
			var listenersName = (dojo._ieListenersName = "_" + dojo._scopeName + "_listeners");
			if (!dojo.config._allow_leaks) {
				node_listener = iel = dojo._ie_listener = {handlers:[], add:function (source, method, listener) {
					source = source || dojo.global;
					var f = source[method];
					if (!f || !f[listenersName]) {
						var d = dojo._getIeDispatcher();
						d.target = f && (ieh.push(f) - 1);
						d[listenersName] = [];
						f = source[method] = d;
					}
					return f[listenersName].push(ieh.push(listener) - 1);
				}, remove:function (source, method, handle) {
					var f = (source || dojo.global)[method], l = f && f[listenersName];
					if (f && l && handle--) {
						delete ieh[l[handle]];
						delete l[handle];
					}
				}};
				var ieh = iel.handlers;
			}
			dojo.mixin(del, {add:function (node, event, fp) {
				if (!node) {
					return;
				}
				event = del._normalizeEventName(event);
				if (event == "onkeypress") {
					var kd = node.onkeydown;
					if (!kd || !kd[listenersName] || !kd._stealthKeydownHandle) {
						var h = del.add(node, "onkeydown", del._stealthKeyDown);
						kd = node.onkeydown;
						kd._stealthKeydownHandle = h;
						kd._stealthKeydownRefs = 1;
					} else {
						kd._stealthKeydownRefs++;
					}
				}
				return iel.add(node, event, del._fixCallback(fp));
			}, remove:function (node, event, handle) {
				event = del._normalizeEventName(event);
				iel.remove(node, event, handle);
				if (event == "onkeypress") {
					var kd = node.onkeydown;
					if (--kd._stealthKeydownRefs <= 0) {
						iel.remove(node, "onkeydown", kd._stealthKeydownHandle);
						delete kd._stealthKeydownHandle;
					}
				}
			}, _normalizeEventName:function (eventName) {
				return eventName.slice(0, 2) != "on" ? "on" + eventName : eventName;
			}, _nop:function () {
			}, _fixEvent:function (evt, sender) {
				if (!evt) {
					var w = sender && (sender.ownerDocument || sender.document || sender).parentWindow || window;
					evt = w.event;
				}
				if (!evt) {
					return (evt);
				}
				evt.target = evt.srcElement;
				evt.currentTarget = (sender || evt.srcElement);
				evt.layerX = evt.offsetX;
				evt.layerY = evt.offsetY;
				var se = evt.srcElement, doc = (se && se.ownerDocument) || document;
				var docBody = ((dojo.isIE < 6) || (doc["compatMode"] == "BackCompat")) ? doc.body : doc.documentElement;
				var offset = dojo._getIeDocumentElementOffset();
				evt.pageX = evt.clientX + dojo._fixIeBiDiScrollLeft(docBody.scrollLeft || 0) - offset.x;
				evt.pageY = evt.clientY + (docBody.scrollTop || 0) - offset.y;
				if (evt.type == "mouseover") {
					evt.relatedTarget = evt.fromElement;
				}
				if (evt.type == "mouseout") {
					evt.relatedTarget = evt.toElement;
				}
				if (dojo.isIE < 9 || dojo.isQuirks) {
					evt.stopPropagation = del._stopPropagation;
					evt.preventDefault = del._preventDefault;
				}
				return del._fixKeys(evt);
			}, _fixKeys:function (evt) {
				switch (evt.type) {
				  case "keypress":
					var c = ("charCode" in evt ? evt.charCode : evt.keyCode);
					if (c == 10) {
						c = 0;
						evt.keyCode = 13;
					} else {
						if (c == 13 || c == 27) {
							c = 0;
						} else {
							if (c == 3) {
								c = 99;
							}
						}
					}
					evt.charCode = c;
					del._setKeyChar(evt);
					break;
				}
				return evt;
			}, _stealthKeyDown:function (evt) {
				var kp = evt.currentTarget.onkeypress;
				if (!kp || !kp[listenersName]) {
					return;
				}
				var k = evt.keyCode;
				var unprintable = (k != 13 || (dojo.isIE >= 9 && !dojo.isQuirks)) && k != 32 && k != 27 && (k < 48 || k > 90) && (k < 96 || k > 111) && (k < 186 || k > 192) && (k < 219 || k > 222);
				if (unprintable || evt.ctrlKey) {
					var c = unprintable ? 0 : k;
					if (evt.ctrlKey) {
						if (k == 3 || k == 13) {
							return;
						} else {
							if (c > 95 && c < 106) {
								c -= 48;
							} else {
								if ((!evt.shiftKey) && (c >= 65 && c <= 90)) {
									c += 32;
								} else {
									c = del._punctMap[c] || c;
								}
							}
						}
					}
					var faux = del._synthesizeEvent(evt, {type:"keypress", faux:true, charCode:c});
					kp.call(evt.currentTarget, faux);
					if (dojo.isIE < 9 || (dojo.isIE && dojo.isQuirks)) {
						evt.cancelBubble = faux.cancelBubble;
					}
					evt.returnValue = faux.returnValue;
					_trySetKeyCode(evt, faux.keyCode);
				}
			}, _stopPropagation:function () {
				this.cancelBubble = true;
			}, _preventDefault:function () {
				this.bubbledKeyCode = this.keyCode;
				if (this.ctrlKey) {
					_trySetKeyCode(this, 0);
				}
				this.returnValue = false;
			}});
			dojo.stopEvent = (dojo.isIE < 9 || dojo.isQuirks) ? function (evt) {
				evt = evt || window.event;
				del._stopPropagation.call(evt);
				del._preventDefault.call(evt);
			} : dojo.stopEvent;
		}
		del._synthesizeEvent = function (evt, props) {
			var faux = dojo.mixin({}, evt, props);
			del._setKeyChar(faux);
			faux.preventDefault = function () {
				evt.preventDefault();
			};
			faux.stopPropagation = function () {
				evt.stopPropagation();
			};
			return faux;
		};
		if (dojo.isOpera) {
			dojo.mixin(del, {_fixEvent:function (evt, sender) {
				switch (evt.type) {
				  case "keypress":
					var c = evt.which;
					if (c == 3) {
						c = 99;
					}
					c = c < 41 && !evt.shiftKey ? 0 : c;
					if (evt.ctrlKey && !evt.shiftKey && c >= 65 && c <= 90) {
						c += 32;
					}
					return del._synthesizeEvent(evt, {charCode:c});
				}
				return evt;
			}});
		}
		if (dojo.isWebKit) {
			del._add = del.add;
			del._remove = del.remove;
			dojo.mixin(del, {add:function (node, event, fp) {
				if (!node) {
					return;
				}
				var handle = del._add(node, event, fp);
				if (del._normalizeEventName(event) == "keypress") {
					handle._stealthKeyDownHandle = del._add(node, "keydown", function (evt) {
						var k = evt.keyCode;
						var unprintable = k != 13 && k != 32 && (k < 48 || k > 90) && (k < 96 || k > 111) && (k < 186 || k > 192) && (k < 219 || k > 222);
						if (unprintable || evt.ctrlKey) {
							var c = unprintable ? 0 : k;
							if (evt.ctrlKey) {
								if (k == 3 || k == 13) {
									return;
								} else {
									if (c > 95 && c < 106) {
										c -= 48;
									} else {
										if (!evt.shiftKey && c >= 65 && c <= 90) {
											c += 32;
										} else {
											c = del._punctMap[c] || c;
										}
									}
								}
							}
							var faux = del._synthesizeEvent(evt, {type:"keypress", faux:true, charCode:c});
							fp.call(evt.currentTarget, faux);
						}
					});
				}
				return handle;
			}, remove:function (node, event, handle) {
				if (node) {
					if (handle._stealthKeyDownHandle) {
						del._remove(node, "keydown", handle._stealthKeyDownHandle);
					}
					del._remove(node, event, handle);
				}
			}, _fixEvent:function (evt, sender) {
				switch (evt.type) {
				  case "keypress":
					if (evt.faux) {
						return evt;
					}
					var c = evt.charCode;
					c = c >= 32 ? c : 0;
					return del._synthesizeEvent(evt, {charCode:c, faux:true});
				}
				return evt;
			}});
		}
	})();
	if (dojo.isIE) {
		dojo._ieDispatcher = function (args, sender) {
			var ap = Array.prototype, h = dojo._ie_listener.handlers, c = args.callee, ls = c[dojo._ieListenersName], t = h[c.target];
			var r = t && t.apply(sender, args);
			var lls = [].concat(ls);
			for (var i in lls) {
				var f = h[lls[i]];
				if (!(i in ap) && f) {
					f.apply(sender, args);
				}
			}
			return r;
		};
		dojo._getIeDispatcher = function () {
			return new Function(dojo._scopeName + "._ieDispatcher(arguments, this)");
		};
		dojo._event_listener._fixCallback = function (fp) {
			var f = dojo._event_listener._fixEvent;
			return function (e) {
				return fp.call(this, f(e, this));
			};
		};
	}
}

