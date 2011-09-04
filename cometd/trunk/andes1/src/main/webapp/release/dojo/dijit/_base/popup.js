/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._base.popup"]) {
	dojo._hasResource["dijit._base.popup"] = true;
	dojo.provide("dijit._base.popup");
	dojo.require("dijit._base.focus");
	dojo.require("dijit._base.place");
	dojo.require("dijit._base.window");
	dijit.popup = {_stack:[], _beginZIndex:1000, _idGen:1, _createWrapper:function (widget) {
		var wrapper = widget.declaredClass ? widget._popupWrapper : (widget.parentNode && dojo.hasClass(widget.parentNode, "dijitPopup")), node = widget.domNode || widget;
		if (!wrapper) {
			wrapper = dojo.create("div", {"class":"dijitPopup", style:{display:"none"}, role:"presentation"}, dojo.body());
			wrapper.appendChild(node);
			var s = node.style;
			s.display = "";
			s.visibility = "";
			s.position = "";
			s.top = "0px";
			if (widget.declaredClass) {
				widget._popupWrapper = wrapper;
				dojo.connect(widget, "destroy", function () {
					dojo.destroy(wrapper);
					delete widget._popupWrapper;
				});
			}
		}
		return wrapper;
	}, moveOffScreen:function (widget) {
		var wrapper = this._createWrapper(widget);
		dojo.style(wrapper, {visibility:"hidden", top:"-9999px", display:""});
	}, hide:function (widget) {
		var wrapper = this._createWrapper(widget);
		dojo.style(wrapper, "display", "none");
	}, getTopPopup:function () {
		var stack = this._stack;
		for (var pi = stack.length - 1; pi > 0 && stack[pi].parent === stack[pi - 1].widget; pi--) {
		}
		return stack[pi];
	}, open:function (args) {
		var stack = this._stack, widget = args.popup, orient = args.orient || ((args.parent ? args.parent.isLeftToRight() : dojo._isBodyLtr()) ? {"BL":"TL", "BR":"TR", "TL":"BL", "TR":"BR"} : {"BR":"TR", "BL":"TL", "TR":"BR", "TL":"BL"}), around = args.around, id = (args.around && args.around.id) ? (args.around.id + "_dropdown") : ("popup_" + this._idGen++);
		while (stack.length && (!args.parent || !dojo.isDescendant(args.parent.domNode, stack[stack.length - 1].widget.domNode))) {
			dijit.popup.close(stack[stack.length - 1].widget);
		}
		var wrapper = this._createWrapper(widget);
		dojo.attr(wrapper, {id:id, style:{zIndex:this._beginZIndex + stack.length}, "class":"dijitPopup " + (widget.baseClass || widget["class"] || "").split(" ")[0] + "Popup", dijitPopupParent:args.parent ? args.parent.id : ""});
		if (dojo.isIE || dojo.isMoz) {
			if (!widget.bgIframe) {
				widget.bgIframe = new dijit.BackgroundIframe(wrapper);
			}
		}
		var best = around ? dijit.placeOnScreenAroundElement(wrapper, around, orient, widget.orient ? dojo.hitch(widget, "orient") : null) : dijit.placeOnScreen(wrapper, args, orient == "R" ? ["TR", "BR", "TL", "BL"] : ["TL", "BL", "TR", "BR"], args.padding);
		wrapper.style.display = "";
		wrapper.style.visibility = "visible";
		widget.domNode.style.visibility = "visible";
		var handlers = [];
		handlers.push(dojo.connect(wrapper, "onkeypress", this, function (evt) {
			if (evt.charOrCode == dojo.keys.ESCAPE && args.onCancel) {
				dojo.stopEvent(evt);
				args.onCancel();
			} else {
				if (evt.charOrCode === dojo.keys.TAB) {
					dojo.stopEvent(evt);
					var topPopup = this.getTopPopup();
					if (topPopup && topPopup.onCancel) {
						topPopup.onCancel();
					}
				}
			}
		}));
		if (widget.onCancel) {
			handlers.push(dojo.connect(widget, "onCancel", args.onCancel));
		}
		handlers.push(dojo.connect(widget, widget.onExecute ? "onExecute" : "onChange", this, function () {
			var topPopup = this.getTopPopup();
			if (topPopup && topPopup.onExecute) {
				topPopup.onExecute();
			}
		}));
		stack.push({widget:widget, parent:args.parent, onExecute:args.onExecute, onCancel:args.onCancel, onClose:args.onClose, handlers:handlers});
		if (widget.onOpen) {
			widget.onOpen(best);
		}
		return best;
	}, close:function (popup) {
		var stack = this._stack;
		while ((popup && dojo.some(stack, function (elem) {
			return elem.widget == popup;
		})) || (!popup && stack.length)) {
			var top = stack.pop(), widget = top.widget, onClose = top.onClose;
			if (widget.onClose) {
				widget.onClose();
			}
			dojo.forEach(top.handlers, dojo.disconnect);
			if (widget && widget.domNode) {
				this.hide(widget);
			}
			if (onClose) {
				onClose();
			}
		}
	}};
	dijit._frames = new function () {
		var queue = [];
		this.pop = function () {
			var iframe;
			if (queue.length) {
				iframe = queue.pop();
				iframe.style.display = "";
			} else {
				if (dojo.isIE < 9) {
					var burl = dojo.config["dojoBlankHtmlUrl"] || (dojo.moduleUrl("dojo", "resources/blank.html") + "") || "javascript:\"\"";
					var html = "<iframe src='" + burl + "'" + " style='position: absolute; left: 0px; top: 0px;" + "z-index: -1; filter:Alpha(Opacity=\"0\");'>";
					iframe = dojo.doc.createElement(html);
				} else {
					iframe = dojo.create("iframe");
					iframe.src = "javascript:\"\"";
					iframe.className = "dijitBackgroundIframe";
					dojo.style(iframe, "opacity", 0.1);
				}
				iframe.tabIndex = -1;
				dijit.setWaiRole(iframe, "presentation");
			}
			return iframe;
		};
		this.push = function (iframe) {
			iframe.style.display = "none";
			queue.push(iframe);
		};
	}();
	dijit.BackgroundIframe = function (node) {
		if (!node.id) {
			throw new Error("no id");
		}
		if (dojo.isIE || dojo.isMoz) {
			var iframe = (this.iframe = dijit._frames.pop());
			node.appendChild(iframe);
			if (dojo.isIE < 7 || dojo.isQuirks) {
				this.resize(node);
				this._conn = dojo.connect(node, "onresize", this, function () {
					this.resize(node);
				});
			} else {
				dojo.style(iframe, {width:"100%", height:"100%"});
			}
		}
	};
	dojo.extend(dijit.BackgroundIframe, {resize:function (node) {
		if (this.iframe) {
			dojo.style(this.iframe, {width:node.offsetWidth + "px", height:node.offsetHeight + "px"});
		}
	}, destroy:function () {
		if (this._conn) {
			dojo.disconnect(this._conn);
			this._conn = null;
		}
		if (this.iframe) {
			dijit._frames.push(this.iframe);
			delete this.iframe;
		}
	}});
}

