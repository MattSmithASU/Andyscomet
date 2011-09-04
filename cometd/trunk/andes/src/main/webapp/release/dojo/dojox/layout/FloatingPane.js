/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.layout.FloatingPane"]) {
	dojo._hasResource["dojox.layout.FloatingPane"] = true;
	dojo.provide("dojox.layout.FloatingPane");
	dojo.experimental("dojox.layout.FloatingPane");
	dojo.require("dojo.window");
	dojo.require("dijit._Templated");
	dojo.require("dijit._Widget");
	dojo.require("dojo.dnd.Moveable");
	dojo.require("dojox.layout.ContentPane");
	dojo.require("dojox.layout.ResizeHandle");
	dojo.declare("dojox.layout.FloatingPane", [dojox.layout.ContentPane, dijit._Templated], {closable:true, dockable:true, resizable:false, maxable:false, resizeAxis:"xy", title:"", dockTo:"", duration:400, contentClass:"dojoxFloatingPaneContent", _showAnim:null, _hideAnim:null, _dockNode:null, _restoreState:{}, _allFPs:[], _startZ:100, templateString:dojo.cache("dojox.layout", "resources/FloatingPane.html", "<div class=\"dojoxFloatingPane\" id=\"${id}\">\n\t<div tabindex=\"0\" role=\"button\" class=\"dojoxFloatingPaneTitle\" dojoAttachPoint=\"focusNode\">\n\t\t<span dojoAttachPoint=\"closeNode\" dojoAttachEvent=\"onclick: close\" class=\"dojoxFloatingCloseIcon\"></span>\n\t\t<span dojoAttachPoint=\"maxNode\" dojoAttachEvent=\"onclick: maximize\" class=\"dojoxFloatingMaximizeIcon\">&thinsp;</span>\n\t\t<span dojoAttachPoint=\"restoreNode\" dojoAttachEvent=\"onclick: _restore\" class=\"dojoxFloatingRestoreIcon\">&thinsp;</span>\t\n\t\t<span dojoAttachPoint=\"dockNode\" dojoAttachEvent=\"onclick: minimize\" class=\"dojoxFloatingMinimizeIcon\">&thinsp;</span>\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitInline dijitTitleNode\"></span>\n\t</div>\n\t<div dojoAttachPoint=\"canvas\" class=\"dojoxFloatingPaneCanvas\">\n\t\t<div dojoAttachPoint=\"containerNode\" role=\"region\" tabindex=\"-1\" class=\"${contentClass}\">\n\t\t</div>\n\t\t<span dojoAttachPoint=\"resizeHandle\" class=\"dojoxFloatingResizeHandle\"></span>\n\t</div>\n</div>\n"), attributeMap:dojo.delegate(dijit._Widget.prototype.attributeMap, {title:{type:"innerHTML", node:"titleNode"}}), postCreate:function () {
		this.inherited(arguments);
		new dojo.dnd.Moveable(this.domNode, {handle:this.focusNode});
		if (!this.dockable) {
			this.dockNode.style.display = "none";
		}
		if (!this.closable) {
			this.closeNode.style.display = "none";
		}
		if (!this.maxable) {
			this.maxNode.style.display = "none";
			this.restoreNode.style.display = "none";
		}
		if (!this.resizable) {
			this.resizeHandle.style.display = "none";
		} else {
			this.domNode.style.width = dojo.marginBox(this.domNode).w + "px";
		}
		this._allFPs.push(this);
		this.domNode.style.position = "absolute";
		this.bgIframe = new dijit.BackgroundIframe(this.domNode);
		this._naturalState = dojo.coords(this.domNode);
	}, startup:function () {
		if (this._started) {
			return;
		}
		this.inherited(arguments);
		if (this.resizable) {
			if (dojo.isIE) {
				this.canvas.style.overflow = "auto";
			} else {
				this.containerNode.style.overflow = "auto";
			}
			this._resizeHandle = new dojox.layout.ResizeHandle({targetId:this.id, resizeAxis:this.resizeAxis}, this.resizeHandle);
		}
		if (this.dockable) {
			var tmpName = this.dockTo;
			if (this.dockTo) {
				this.dockTo = dijit.byId(this.dockTo);
			} else {
				this.dockTo = dijit.byId("dojoxGlobalFloatingDock");
			}
			if (!this.dockTo) {
				var tmpId, tmpNode;
				if (tmpName) {
					tmpId = tmpName;
					tmpNode = dojo.byId(tmpName);
				} else {
					tmpNode = dojo.create("div", null, dojo.body());
					dojo.addClass(tmpNode, "dojoxFloatingDockDefault");
					tmpId = "dojoxGlobalFloatingDock";
				}
				this.dockTo = new dojox.layout.Dock({id:tmpId, autoPosition:"south"}, tmpNode);
				this.dockTo.startup();
			}
			if ((this.domNode.style.display == "none") || (this.domNode.style.visibility == "hidden")) {
				this.minimize();
			}
		}
		this.connect(this.focusNode, "onmousedown", "bringToTop");
		this.connect(this.domNode, "onmousedown", "bringToTop");
		this.resize(dojo.coords(this.domNode));
		this._started = true;
	}, setTitle:function (title) {
		dojo.deprecated("pane.setTitle", "Use pane.set('title', someTitle)", "2.0");
		this.set("title", title);
	}, close:function () {
		if (!this.closable) {
			return;
		}
		dojo.unsubscribe(this._listener);
		this.hide(dojo.hitch(this, function () {
			this.destroyRecursive();
		}));
	}, hide:function (callback) {
		dojo.fadeOut({node:this.domNode, duration:this.duration, onEnd:dojo.hitch(this, function () {
			this.domNode.style.display = "none";
			this.domNode.style.visibility = "hidden";
			if (this.dockTo && this.dockable) {
				this.dockTo._positionDock(null);
			}
			if (callback) {
				callback();
			}
		})}).play();
	}, show:function (callback) {
		var anim = dojo.fadeIn({node:this.domNode, duration:this.duration, beforeBegin:dojo.hitch(this, function () {
			this.domNode.style.display = "";
			this.domNode.style.visibility = "visible";
			if (this.dockTo && this.dockable) {
				this.dockTo._positionDock(null);
			}
			if (typeof callback == "function") {
				callback();
			}
			this._isDocked = false;
			if (this._dockNode) {
				this._dockNode.destroy();
				this._dockNode = null;
			}
		})}).play();
		this.resize(dojo.coords(this.domNode));
		this._onShow();
	}, minimize:function () {
		if (!this._isDocked) {
			this.hide(dojo.hitch(this, "_dock"));
		}
	}, maximize:function () {
		if (this._maximized) {
			return;
		}
		this._naturalState = dojo.position(this.domNode);
		if (this._isDocked) {
			this.show();
			setTimeout(dojo.hitch(this, "maximize"), this.duration);
		}
		dojo.addClass(this.focusNode, "floatingPaneMaximized");
		this.resize(dojo.window.getBox());
		this._maximized = true;
	}, _restore:function () {
		if (this._maximized) {
			this.resize(this._naturalState);
			dojo.removeClass(this.focusNode, "floatingPaneMaximized");
			this._maximized = false;
		}
	}, _dock:function () {
		if (!this._isDocked && this.dockable) {
			this._dockNode = this.dockTo.addNode(this);
			this._isDocked = true;
		}
	}, resize:function (dim) {
		dim = dim || this._naturalState;
		this._currentState = dim;
		var dns = this.domNode.style;
		if ("t" in dim) {
			dns.top = dim.t + "px";
		}
		if ("l" in dim) {
			dns.left = dim.l + "px";
		}
		dns.width = dim.w + "px";
		dns.height = dim.h + "px";
		var mbCanvas = {l:0, t:0, w:dim.w, h:(dim.h - this.focusNode.offsetHeight)};
		dojo.marginBox(this.canvas, mbCanvas);
		this._checkIfSingleChild();
		if (this._singleChild && this._singleChild.resize) {
			this._singleChild.resize(mbCanvas);
		}
	}, bringToTop:function () {
		var windows = dojo.filter(this._allFPs, function (i) {
			return i !== this;
		}, this);
		windows.sort(function (a, b) {
			return a.domNode.style.zIndex - b.domNode.style.zIndex;
		});
		windows.push(this);
		dojo.forEach(windows, function (w, x) {
			w.domNode.style.zIndex = this._startZ + (x * 2);
			dojo.removeClass(w.domNode, "dojoxFloatingPaneFg");
		}, this);
		dojo.addClass(this.domNode, "dojoxFloatingPaneFg");
	}, destroy:function () {
		this._allFPs.splice(dojo.indexOf(this._allFPs, this), 1);
		if (this._resizeHandle) {
			this._resizeHandle.destroy();
		}
		this.inherited(arguments);
	}});
	dojo.declare("dojox.layout.Dock", [dijit._Widget, dijit._Templated], {templateString:"<div class=\"dojoxDock\"><ul dojoAttachPoint=\"containerNode\" class=\"dojoxDockList\"></ul></div>", _docked:[], _inPositioning:false, autoPosition:false, addNode:function (refNode) {
		var div = dojo.create("li", null, this.containerNode), node = new dojox.layout._DockNode({title:refNode.title, paneRef:refNode}, div);
		node.startup();
		return node;
	}, startup:function () {
		if (this.id == "dojoxGlobalFloatingDock" || this.isFixedDock) {
			this.connect(window, "onresize", "_positionDock");
			this.connect(window, "onscroll", "_positionDock");
			if (dojo.isIE) {
				this.connect(this.domNode, "onresize", "_positionDock");
			}
		}
		this._positionDock(null);
		this.inherited(arguments);
	}, _positionDock:function (e) {
		if (!this._inPositioning) {
			if (this.autoPosition == "south") {
				setTimeout(dojo.hitch(this, function () {
					this._inPositiononing = true;
					var viewport = dojo.window.getBox();
					var s = this.domNode.style;
					s.left = viewport.l + "px";
					s.width = (viewport.w - 2) + "px";
					s.top = (viewport.h + viewport.t) - this.domNode.offsetHeight + "px";
					this._inPositioning = false;
				}), 125);
			}
		}
	}});
	dojo.declare("dojox.layout._DockNode", [dijit._Widget, dijit._Templated], {title:"", paneRef:null, templateString:"<li dojoAttachEvent=\"onclick: restore\" class=\"dojoxDockNode\">" + "<span dojoAttachPoint=\"restoreNode\" class=\"dojoxDockRestoreButton\" dojoAttachEvent=\"onclick: restore\"></span>" + "<span class=\"dojoxDockTitleNode\" dojoAttachPoint=\"titleNode\">${title}</span>" + "</li>", restore:function () {
		this.paneRef.show();
		this.paneRef.bringToTop();
		this.destroy();
	}});
}

