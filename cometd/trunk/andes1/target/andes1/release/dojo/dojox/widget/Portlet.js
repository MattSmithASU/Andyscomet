/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.widget.Portlet"]) {
	dojo._hasResource["dojox.widget.Portlet"] = true;
	dojo.experimental("dojox.widget.Portlet");
	dojo.provide("dojox.widget.Portlet");
	dojo.require("dijit.TitlePane");
	dojo.require("dojo.fx");
	dojo.declare("dojox.widget.Portlet", [dijit.TitlePane, dijit._Container], {resizeChildren:true, closable:true, _parents:null, _size:null, dragRestriction:false, buildRendering:function () {
		this.inherited(arguments);
		dojo.style(this.domNode, "visibility", "hidden");
	}, postCreate:function () {
		this.inherited(arguments);
		dojo.addClass(this.domNode, "dojoxPortlet");
		dojo.removeClass(this.arrowNode, "dijitArrowNode");
		dojo.addClass(this.arrowNode, "dojoxPortletIcon dojoxArrowDown");
		dojo.addClass(this.titleBarNode, "dojoxPortletTitle");
		dojo.addClass(this.hideNode, "dojoxPortletContentOuter");
		dojo.addClass(this.domNode, "dojoxPortlet-" + (!this.dragRestriction ? "movable" : "nonmovable"));
		var _this = this;
		if (this.resizeChildren) {
			this.subscribe("/dnd/drop", function () {
				_this._updateSize();
			});
			this.subscribe("/Portlet/sizechange", function (widget) {
				_this.onSizeChange(widget);
			});
			this.connect(window, "onresize", function () {
				_this._updateSize();
			});
			var doSelectSubscribe = dojo.hitch(this, function (id, lastId) {
				var widget = dijit.byId(id);
				if (widget.selectChild) {
					var s = this.subscribe(id + "-selectChild", function (child) {
						var n = _this.domNode.parentNode;
						while (n) {
							if (n == child.domNode) {
								_this.unsubscribe(s);
								_this._updateSize();
								break;
							}
							n = n.parentNode;
						}
					});
					var child = dijit.byId(lastId);
					if (widget && child) {
						_this._parents.push({parent:widget, child:child});
					}
				}
			});
			var lastId;
			this._parents = [];
			for (var p = this.domNode.parentNode; p != null; p = p.parentNode) {
				var id = p.getAttribute ? p.getAttribute("widgetId") : null;
				if (id) {
					doSelectSubscribe(id, lastId);
					lastId = id;
				}
			}
		}
		this.connect(this.titleBarNode, "onmousedown", function (evt) {
			if (dojo.hasClass(evt.target, "dojoxPortletIcon")) {
				dojo.stopEvent(evt);
				return false;
			}
			return true;
		});
		this.connect(this._wipeOut, "onEnd", function () {
			_this._publish();
		});
		this.connect(this._wipeIn, "onEnd", function () {
			_this._publish();
		});
		if (this.closable) {
			this.closeIcon = this._createIcon("dojoxCloseNode", "dojoxCloseNodeHover", dojo.hitch(this, "onClose"));
			dojo.style(this.closeIcon, "display", "");
		}
	}, startup:function () {
		if (this._started) {
			return;
		}
		var children = this.getChildren();
		this._placeSettingsWidgets();
		dojo.forEach(children, function (child) {
			try {
				if (!child.started && !child._started) {
					child.startup();
				}
			}
			catch (e) {
				console.log(this.id + ":" + this.declaredClass, e);
			}
		});
		this.inherited(arguments);
		dojo.style(this.domNode, "visibility", "visible");
	}, _placeSettingsWidgets:function () {
		dojo.forEach(this.getChildren(), dojo.hitch(this, function (child) {
			if (child.portletIconClass && child.toggle && !child.attr("portlet")) {
				this._createIcon(child.portletIconClass, child.portletIconHoverClass, dojo.hitch(child, "toggle"));
				dojo.place(child.domNode, this.containerNode, "before");
				child.attr("portlet", this);
				this._settingsWidget = child;
			}
		}));
	}, _createIcon:function (clazz, hoverClazz, fn) {
		var icon = dojo.create("div", {"class":"dojoxPortletIcon " + clazz, "waiRole":"presentation"});
		dojo.place(icon, this.arrowNode, "before");
		this.connect(icon, "onclick", fn);
		if (hoverClazz) {
			this.connect(icon, "onmouseover", function () {
				dojo.addClass(icon, hoverClazz);
			});
			this.connect(icon, "onmouseout", function () {
				dojo.removeClass(icon, hoverClazz);
			});
		}
		return icon;
	}, onClose:function (evt) {
		dojo.style(this.domNode, "display", "none");
	}, onSizeChange:function (widget) {
		if (widget == this) {
			return;
		}
		this._updateSize();
	}, _updateSize:function () {
		if (!this.open || !this._started || !this.resizeChildren) {
			return;
		}
		if (this._timer) {
			clearTimeout(this._timer);
		}
		this._timer = setTimeout(dojo.hitch(this, function () {
			var size = {w:dojo.style(this.domNode, "width"), h:dojo.style(this.domNode, "height")};
			for (var i = 0; i < this._parents.length; i++) {
				var p = this._parents[i];
				var sel = p.parent.selectedChildWidget;
				if (sel && sel != p.child) {
					return;
				}
			}
			if (this._size) {
				if (this._size.w == size.w && this._size.h == size.h) {
					return;
				}
			}
			this._size = size;
			var fns = ["resize", "layout"];
			this._timer = null;
			var kids = this.getChildren();
			dojo.forEach(kids, function (child) {
				for (var i = 0; i < fns.length; i++) {
					if (dojo.isFunction(child[fns[i]])) {
						try {
							child[fns[i]]();
						}
						catch (e) {
							console.log(e);
						}
						break;
					}
				}
			});
			this.onUpdateSize();
		}), 100);
	}, onUpdateSize:function () {
	}, _publish:function () {
		dojo.publish("/Portlet/sizechange", [this]);
	}, _onTitleClick:function (evt) {
		if (evt.target == this.arrowNode) {
			this.inherited(arguments);
		}
	}, addChild:function (child) {
		this._size = null;
		this.inherited(arguments);
		if (this._started) {
			this._placeSettingsWidgets();
			this._updateSize();
		}
		if (this._started && !child.started && !child._started) {
			child.startup();
		}
	}, destroyDescendants:function (preserveDom) {
		this.inherited(arguments);
		if (this._settingsWidget) {
			this._settingsWidget.destroyRecursive(preserveDom);
		}
	}, destroy:function () {
		if (this._timer) {
			clearTimeout(this._timer);
		}
		this.inherited(arguments);
	}, _setCss:function () {
		this.inherited(arguments);
		dojo.style(this.arrowNode, "display", this.toggleable ? "" : "none");
	}});
	dojo.declare("dojox.widget.PortletSettings", [dijit._Container, dijit.layout.ContentPane], {portletIconClass:"dojoxPortletSettingsIcon", portletIconHoverClass:"dojoxPortletSettingsIconHover", postCreate:function () {
		dojo.style(this.domNode, "display", "none");
		dojo.addClass(this.domNode, "dojoxPortletSettingsContainer");
		dojo.removeClass(this.domNode, "dijitContentPane");
	}, _setPortletAttr:function (portlet) {
		this.portlet = portlet;
	}, toggle:function () {
		var n = this.domNode;
		if (dojo.style(n, "display") == "none") {
			dojo.style(n, {"display":"block", "height":"1px", "width":"auto"});
			dojo.fx.wipeIn({node:n}).play();
		} else {
			dojo.fx.wipeOut({node:n, onEnd:dojo.hitch(this, function () {
				dojo.style(n, {"display":"none", "height":"", "width":""});
			})}).play();
		}
	}});
	dojo.declare("dojox.widget.PortletDialogSettings", dojox.widget.PortletSettings, {dimensions:null, constructor:function (props, node) {
		this.dimensions = props.dimensions || [300, 100];
	}, toggle:function () {
		if (!this.dialog) {
			dojo["require"]("dijit.Dialog");
			this.dialog = new dijit.Dialog({title:this.title});
			dojo.body().appendChild(this.dialog.domNode);
			this.dialog.containerNode.appendChild(this.domNode);
			dojo.style(this.dialog.domNode, {"width":this.dimensions[0] + "px", "height":this.dimensions[1] + "px"});
			dojo.style(this.domNode, "display", "");
		}
		if (this.dialog.open) {
			this.dialog.hide();
		} else {
			this.dialog.show(this.domNode);
		}
	}});
}

