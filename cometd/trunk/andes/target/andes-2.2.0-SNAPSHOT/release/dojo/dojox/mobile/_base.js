/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mobile._base"]) {
	dojo._hasResource["dojox.mobile._base"] = true;
	dojo.provide("dojox.mobile._base");
	dojo.require("dijit._WidgetBase");
	dojo.require("dijit._Container");
	dojo.require("dijit._Contained");
	(function () {
		var d = dojo;
		var ua = navigator.userAgent;
		d.isBB = ua.indexOf("BlackBerry") >= 0 && parseFloat(ua.split("Version/")[1]) || undefined;
		d.isAndroid = parseFloat(ua.split("Android ")[1]) || undefined;
		if (ua.match(/(iPhone|iPod|iPad)/)) {
			var p = "is" + RegExp.$1.replace(/i/, "I");
			var v = ua.match(/OS ([\d_]+)/) ? RegExp.$1 : "1";
			d.isIPhone = d[p] = parseFloat(v.replace(/_/, ".").replace(/_/g, ""));
		}
		var html = d.doc.documentElement;
		html.className += d.trim([d.isBB ? "dj_bb" : "", d.isAndroid ? "dj_android" : "", d.isIPhone ? "dj_iphone" : "", d.isIPod ? "dj_ipod" : "", d.isIPad ? "dj_ipad" : ""].join(" ").replace(/ +/g, " "));
	})();
	dojo.declare("dojox.mobile.View", [dijit._WidgetBase, dijit._Container, dijit._Contained], {selected:false, keepScrollPos:true, constructor:function (params, node) {
		if (node) {
			dojo.byId(node).style.visibility = "hidden";
		}
	}, buildRendering:function () {
		this.domNode = this.containerNode = this.srcNodeRef || dojo.doc.createElement("DIV");
		this.domNode.className = "mblView";
		this.connect(this.domNode, "webkitAnimationEnd", "onAnimationEnd");
		this.connect(this.domNode, "webkitAnimationStart", "onAnimationStart");
		var id = location.href.match(/#(\w+)([^\w=]|$)/) ? RegExp.$1 : null;
		this._visible = this.selected && !id || this.id == id;
		if (this.selected) {
			dojox.mobile._defaultView = this;
		}
	}, startup:function () {
		if (this._started) {
			return;
		}
		var _this = this;
		setTimeout(function () {
			if (!_this._visible) {
				_this.domNode.style.display = "none";
			} else {
				dojox.mobile.currentView = _this;
				_this.onStartView();
			}
			if (_this.domNode.style.visibility != "visible") {
				_this.domNode.style.visibility = "visible";
			}
			var parent = _this.getParent && _this.getParent();
			if (!parent || !parent.resize) {
				_this.resize();
			}
		}, dojo.isIE ? 100 : 0);
		this.inherited(arguments);
	}, resize:function () {
		dojo.forEach(this.getChildren(), function (child) {
			if (child.resize) {
				child.resize();
			}
		});
	}, onStartView:function () {
	}, onBeforeTransitionIn:function (moveTo, dir, transition, context, method) {
	}, onAfterTransitionIn:function (moveTo, dir, transition, context, method) {
	}, onBeforeTransitionOut:function (moveTo, dir, transition, context, method) {
	}, onAfterTransitionOut:function (moveTo, dir, transition, context, method) {
	}, _saveState:function (moveTo, dir, transition, context, method) {
		this._context = context;
		this._method = method;
		if (transition == "none" || !dojo.isWebKit) {
			transition = null;
		}
		this._moveTo = moveTo;
		this._dir = dir;
		this._transition = transition;
		this._arguments = [];
		var i;
		for (i = 0; i < arguments.length; i++) {
			this._arguments.push(arguments[i]);
		}
		this._args = [];
		if (context || method) {
			for (i = 5; i < arguments.length; i++) {
				this._args.push(arguments[i]);
			}
		}
	}, convertToId:function (moveTo) {
		if (typeof (moveTo) == "string") {
			moveTo.match(/^#?([^&]+)/);
			return RegExp.$1;
		}
		return moveTo;
	}, performTransition:function (moveTo, dir, transition, context, method) {
		if (moveTo === "#") {
			return;
		}
		if (dojo.hash) {
			if (typeof (moveTo) == "string" && moveTo.charAt(0) == "#" && !dojox.mobile._params) {
				dojox.mobile._params = [];
				for (var i = 0; i < arguments.length; i++) {
					dojox.mobile._params.push(arguments[i]);
				}
				dojo.hash(moveTo);
				return;
			}
		}
		this._saveState.apply(this, arguments);
		var toNode;
		if (moveTo) {
			toNode = this.convertToId(moveTo);
		} else {
			if (!this._dummyNode) {
				this._dummyNode = dojo.doc.createElement("DIV");
				dojo.body().appendChild(this._dummyNode);
			}
			toNode = this._dummyNode;
		}
		var fromNode = this.domNode;
		var fromTop = fromNode.offsetTop;
		toNode = this.toNode = dojo.byId(toNode);
		if (!toNode) {
			alert("dojox.mobile.View#performTransition: destination view not found: " + moveTo);
			return;
		}
		toNode.style.visibility = "hidden";
		toNode.style.display = "";
		var toWidget = dijit.byNode(toNode);
		if (toWidget) {
			dojox.mobile.resizeAll(null, toWidget);
			if (transition && transition != "none") {
				toWidget.containerNode.style.paddingTop = fromTop + "px";
			}
		}
		this.onBeforeTransitionOut.apply(this, arguments);
		if (toWidget) {
			if (this.keepScrollPos && !this.getParent()) {
				var scrollTop = dojo.body().scrollTop || dojo.doc.documentElement.scrollTop || dojo.global.pageYOffset || 0;
				fromNode._scrollTop = scrollTop;
				var toTop = (dir == 1) ? 0 : (toNode._scrollTop || 0);
				toNode.style.top = "0px";
				if (scrollTop > 1 || toTop !== 0) {
					fromNode.style.top = toTop - scrollTop + "px";
					if (dojo.config["mblHideAddressBar"] !== false) {
						setTimeout(function () {
							dojo.global.scrollTo(0, (toTop || 1));
						}, 0);
					}
				}
			} else {
				toNode.style.top = "0px";
			}
			toWidget.onBeforeTransitionIn.apply(toWidget, arguments);
		}
		toNode.style.display = "none";
		toNode.style.visibility = "visible";
		this._doTransition(fromNode, toNode, transition, dir);
	}, _doTransition:function (fromNode, toNode, transition, dir) {
		var rev = (dir == -1) ? " reverse" : "";
		toNode.style.display = "";
		if (!transition || transition == "none") {
			this.domNode.style.display = "none";
			this.invokeCallback();
		} else {
			dojo.addClass(fromNode, transition + " out" + rev);
			dojo.addClass(toNode, transition + " in" + rev);
		}
	}, onAnimationStart:function (e) {
	}, onAnimationEnd:function (e) {
		if (e.animationName.indexOf("Out") === -1 && e.animationName.indexOf("In") === -1 && e.animationName.indexOf("shrink") === -1) {
			return;
		}
		var isOut = false;
		if (dojo.hasClass(this.domNode, "out")) {
			isOut = true;
			this.domNode.style.display = "none";
			dojo.forEach([this._transition, "in", "out", "reverse"], function (s) {
				dojo.removeClass(this.domNode, s);
			}, this);
		} else {
			this.containerNode.style.paddingTop = "";
		}
		if (e.animationName.indexOf("shrink") === 0) {
			var li = e.target;
			li.style.display = "none";
			dojo.removeClass(li, "mblCloseContent");
		}
		if (isOut) {
			this.invokeCallback();
		}
		this.domNode && (this.domNode.className = "mblView");
	}, invokeCallback:function () {
		this.onAfterTransitionOut.apply(this, this._arguments);
		var toWidget = dijit.byNode(this.toNode);
		if (toWidget) {
			toWidget.onAfterTransitionIn.apply(toWidget, this._arguments);
		}
		dojox.mobile.currentView = toWidget;
		var c = this._context, m = this._method;
		if (!c && !m) {
			return;
		}
		if (!m) {
			m = c;
			c = null;
		}
		c = c || dojo.global;
		if (typeof (m) == "string") {
			c[m].apply(c, this._args);
		} else {
			m.apply(c, this._args);
		}
	}, getShowingView:function () {
		var nodes = this.domNode.parentNode.childNodes;
		for (var i = 0; i < nodes.length; i++) {
			if (dojo.hasClass(nodes[i], "mblView") && dojo.style(nodes[i], "display") != "none") {
				return dijit.byNode(nodes[i]);
			}
		}
	}, show:function () {
		var fs = this.getShowingView().domNode.style;
		var ts = this.domNode.style;
		fs.display = "none";
		ts.display = "";
		dojox.mobile.currentView = this;
	}});
	dojo.declare("dojox.mobile.Heading", [dijit._WidgetBase, dijit._Container, dijit._Contained], {back:"", href:"", moveTo:"", transition:"slide", label:"", iconBase:"", buildRendering:function () {
		this.domNode = this.containerNode = this.srcNodeRef || dojo.doc.createElement("H1");
		this.domNode.className = "mblHeading";
		this._view = this.getParent();
		if (this.label) {
			this.domNode.appendChild(document.createTextNode(this._cv(this.label)));
		} else {
			this.label = "";
			dojo.forEach(this.domNode.childNodes, function (n) {
				if (n.nodeType == 3) {
					this.label += n.nodeValue;
					n.nodeValue = this._cv(n.nodeValue);
				}
			}, this);
			this.label = dojo.trim(this.label);
		}
		if (this.back) {
			var btn = dojo.create("DIV", {className:"mblArrowButton"}, this.domNode, "first");
			var head = dojo.create("DIV", {className:"mblArrowButtonHead"}, btn);
			var body = dojo.create("DIV", {className:"mblArrowButtonBody mblArrowButtonText"}, btn);
			this._body = body;
			this._head = head;
			this._btn = btn;
			body.innerHTML = this._cv(this.back);
			this.connect(body, "onclick", "onClick");
			var neck = dojo.create("DIV", {className:"mblArrowButtonNeck"}, btn);
			btn.style.width = body.offsetWidth + head.offsetWidth + "px";
			this.setLabel(this.label);
		}
	}, startup:function () {
		if (this._started) {
			return;
		}
		var parent = this.getParent && this.getParent();
		if (!parent || !parent.resize) {
			this.resize();
		}
		this.inherited(arguments);
	}, resize:function () {
		if (this._btn) {
			this._btn.style.width = this._body.offsetWidth + this._head.offsetWidth + "px";
		}
		dojo.forEach(this.getChildren(), function (child) {
			if (child.resize) {
				child.resize();
			}
		});
	}, onClick:function (e) {
		var h1 = this.domNode;
		dojo.addClass(h1, "mblArrowButtonSelected");
		setTimeout(function () {
			dojo.removeClass(h1, "mblArrowButtonSelected");
		}, 1000);
		this.goTo(this.moveTo, this.href);
	}, setLabel:function (label) {
		if (label != this.label) {
			this.label = label;
			this.domNode.firstChild.nodeValue = label;
		}
	}, goTo:function (moveTo, href) {
		if (!this._view) {
			this._view = this.getParent();
		}
		if (!this._view) {
			return;
		}
		if (href) {
			this._view.performTransition(null, -1, this.transition, this, function () {
				location.href = href;
			});
		} else {
			if (dojox.mobile.app && dojox.mobile.app.STAGE_CONTROLLER_ACTIVE) {
				dojo.publish("/dojox/mobile/app/goback");
			} else {
				var view = this._view;
				var node = dijit.byId(view.convertToId(moveTo));
				if (node) {
					var parent = node.getParent();
					while (view) {
						var myParent = view.getParent();
						if (parent === myParent) {
							break;
						}
						view = myParent;
					}
				}
				if (view) {
					view.performTransition(moveTo, -1, this.transition);
				}
			}
		}
	}});
	dojo.declare("dojox.mobile.RoundRect", [dijit._WidgetBase, dijit._Container, dijit._Contained], {shadow:false, buildRendering:function () {
		this.domNode = this.containerNode = this.srcNodeRef || dojo.doc.createElement("DIV");
		this.domNode.className = this.shadow ? "mblRoundRect mblShadow" : "mblRoundRect";
	}, resize:function () {
		dojo.forEach(this.getChildren(), function (child) {
			if (child.resize) {
				child.resize();
			}
		});
	}});
	dojo.declare("dojox.mobile.RoundRectCategory", [dijit._WidgetBase, dijit._Contained], {label:"", buildRendering:function () {
		this.domNode = this.containerNode = this.srcNodeRef || dojo.doc.createElement("H2");
		this.domNode.className = "mblRoundRectCategory";
		if (!this.label) {
			this.label = this.domNode.innerHTML;
		}
		this.domNode.innerHTML = this._cv(this.label);
	}});
	dojo.declare("dojox.mobile.EdgeToEdgeCategory", dojox.mobile.RoundRectCategory, {buildRendering:function () {
		this.inherited(arguments);
		this.domNode.className = "mblEdgeToEdgeCategory";
	}});
	dojo.declare("dojox.mobile.RoundRectList", [dijit._WidgetBase, dijit._Container, dijit._Contained], {transition:"slide", iconBase:"", iconPos:"", select:"", buildRendering:function () {
		this.domNode = this.containerNode = this.srcNodeRef || dojo.doc.createElement("UL");
		this.domNode.className = "mblRoundRectList";
	}, onCheckStateChanged:function (listItem, newState) {
	}});
	dojo.declare("dojox.mobile.EdgeToEdgeList", dojox.mobile.RoundRectList, {stateful:false, buildRendering:function () {
		this.inherited(arguments);
		this.domNode.className = "mblEdgeToEdgeList";
	}});
	dojo.declare("dojox.mobile.AbstractItem", [dijit._WidgetBase, dijit._Container, dijit._Contained], {icon:"", iconPos:"", href:"", hrefTarget:"", moveTo:"", scene:"", clickable:false, url:"", urlTarget:"", transition:"", transitionDir:1, callback:null, sync:true, label:"", toggle:false, _duration:800, inheritParams:function () {
		var parent = this.getParent();
		if (parent) {
			if (!this.transition) {
				this.transition = parent.transition;
			}
			if (!this.icon) {
				this.icon = parent.iconBase;
			}
			if (!this.iconPos) {
				this.iconPos = parent.iconPos;
			}
		}
	}, findCurrentView:function (moveTo) {
		var w;
		if (moveTo) {
			w = dijit.byId(moveTo);
			if (w) {
				return w.getShowingView();
			}
		}
		w = this;
		while (true) {
			w = w.getParent();
			if (!w) {
				return null;
			}
			if (w instanceof dojox.mobile.View) {
				break;
			}
		}
		return w;
	}, transitionTo:function (moveTo, href, url, scene) {
		if (!moveTo && !href && !url && !scene) {
			return;
		}
		var w = this.findCurrentView(moveTo);
		if (!w || moveTo && w === dijit.byId(moveTo)) {
			return;
		}
		if (href) {
			if (this.hrefTarget) {
				dojox.mobile.openWindow(this.href, this.hrefTarget);
			} else {
				w.performTransition(null, this.transitionDir, this.transition, this, function () {
					location.href = href;
				});
			}
			return;
		} else {
			if (scene) {
				dojo.publish("/dojox/mobile/app/pushScene", [scene]);
				return;
			}
		}
		if (url) {
			var id;
			if (dojox.mobile._viewMap && dojox.mobile._viewMap[url]) {
				id = dojox.mobile._viewMap[url];
			} else {
				var text = this._text;
				if (!text) {
					if (this.sync) {
						text = dojo.trim(dojo._getText(url));
					} else {
						dojo["require"]("dojo._base.xhr");
						var prog = dojox.mobile.ProgressIndicator.getInstance();
						dojo.body().appendChild(prog.domNode);
						prog.start();
						var xhr = dojo.xhrGet({url:url, handleAs:"text"});
						xhr.addCallback(dojo.hitch(this, function (response, ioArgs) {
							prog.stop();
							if (response) {
								this._text = response;
								this.transitionTo(moveTo, href, url, scene);
							}
						}));
						xhr.addErrback(function (error) {
							prog.stop();
							alert("Failed to load " + url + "\n" + (error.description || error));
						});
						return;
					}
				}
				this._text = null;
				id = this._parse(text);
				if (!dojox.mobile._viewMap) {
					dojox.mobile._viewMap = [];
				}
				dojox.mobile._viewMap[url] = id;
			}
			moveTo = id;
			w = this.findCurrentView(moveTo) || w;
		}
		w.performTransition(moveTo, this.transitionDir, this.transition, this.callback && this, this.callback);
	}, _parse:function (text) {
		var container = dojo.create("DIV");
		var view;
		var id = this.urlTarget;
		var target = dijit.byId(id) && dijit.byId(id).containerNode || dojo.byId(id) || dojox.mobile.currentView && dojox.mobile.currentView.domNode.parentNode || dojo.body();
		if (text.charAt(0) == "<") {
			container.innerHTML = text;
			view = container.firstChild;
			if (!view && view.nodeType != 1) {
				alert("dojox.mobile.AbstractItem#transitionTo: invalid view content");
				return;
			}
			view.style.visibility = "hidden";
			target.appendChild(container);
			dojo.parser.parse(container);
			target.appendChild(target.removeChild(container).firstChild);
			dijit.byNode(view)._visible = true;
		} else {
			if (text.charAt(0) == "{") {
				target.appendChild(container);
				this._ws = [];
				view = this._instantiate(eval("(" + text + ")"), container);
				for (var i = 0; i < this._ws.length; i++) {
					var w = this._ws[i];
					w.startup && !w._started && (!w.getParent || !w.getParent()) && w.startup();
				}
				this._ws = null;
			}
		}
		view.style.display = "none";
		view.style.visibility = "visible";
		var id = view.id;
		return dojo.hash ? "#" + id : id;
	}, _instantiate:function (obj, node, parent) {
		var widget;
		for (var key in obj) {
			if (key.charAt(0) == "@") {
				continue;
			}
			var cls = dojo.getObject(key);
			if (!cls) {
				continue;
			}
			var params = {};
			var proto = cls.prototype;
			var objs = dojo.isArray(obj[key]) ? obj[key] : [obj[key]];
			for (var i = 0; i < objs.length; i++) {
				for (var prop in objs[i]) {
					if (prop.charAt(0) == "@") {
						var val = objs[i][prop];
						prop = prop.substring(1);
						if (typeof proto[prop] == "string") {
							params[prop] = val;
						} else {
							if (typeof proto[prop] == "number") {
								params[prop] = val - 0;
							} else {
								if (typeof proto[prop] == "boolean") {
									params[prop] = (val != "false");
								} else {
									if (typeof proto[prop] == "object") {
										params[prop] = eval("(" + val + ")");
									}
								}
							}
						}
					}
				}
				widget = new cls(params, node);
				if (!node) {
					this._ws.push(widget);
				}
				if (parent && parent.addChild) {
					parent.addChild(widget);
				}
				this._instantiate(objs[i], null, widget);
			}
		}
		return widget && widget.domNode;
	}, select:function (deselect) {
	}, defaultClickAction:function () {
		if (this.toggle) {
			this.select(this.selected);
		} else {
			if (!this.selected) {
				this.select();
				if (!this.selectOne) {
					var _this = this;
					setTimeout(function () {
						_this.select(true);
					}, this._duration);
				}
				if (this.moveTo || this.href || this.url || this.scene) {
					this.transitionTo(this.moveTo, this.href, this.url, this.scene);
				}
			}
		}
	}, getParent:function () {
		var ref = this.srcNodeRef || this.domNode;
		return ref && ref.parentNode ? dijit.getEnclosingWidget(ref.parentNode) : null;
	}});
	dojo.declare("dojox.mobile.ListItem", dojox.mobile.AbstractItem, {rightText:"", btnClass:"", anchorLabel:false, noArrow:false, selected:false, checked:false, rightIconClass:"", arrowClass:"mblDomButtonArrow", checkClass:"mblDomButtonCheck", buildRendering:function () {
		var a = this.anchorNode = dojo.create("A");
		a.className = "mblListItemAnchor";
		var box = dojo.create("DIV");
		box.className = "mblListItemTextBox";
		if (this.anchorLabel) {
			box.style.cursor = "pointer";
		}
		var r = this.srcNodeRef;
		if (r) {
			for (var i = 0, len = r.childNodes.length; i < len; i++) {
				var n = r.firstChild;
				if (n.nodeType === 3 && dojo.trim(n.nodeValue) !== "") {
					n.nodeValue = this._cv(n.nodeValue);
					this.labelNode = dojo.create("SPAN");
					this.labelNode.appendChild(n);
					n = this.labelNode;
				}
				box.appendChild(n);
			}
		}
		if (this.label) {
			this.labelNode = dojo.create("SPAN", {innerHTML:this._cv(this.label)}, box);
		}
		a.appendChild(box);
		if (this.anchorLabel) {
			box.style.display = "inline";
		}
		var li = this.domNode = this.containerNode = this.srcNodeRef || dojo.doc.createElement("LI");
		li.className = "mblListItem" + (this.selected ? " mblItemSelected" : "");
		li.appendChild(a);
	}, startup:function () {
		if (this._started) {
			return;
		}
		this.inheritParams();
		var parent = this.getParent();
		if (this.moveTo || this.href || this.url || this.clickable) {
			if (!this.noArrow && !(parent && parent.stateful)) {
				this._setBtnClassAttr(this.arrowClass);
			}
			this.connect(this.anchorNode, "onclick", "onClick");
		}
		if (parent && parent.select) {
			this.connect(this.anchorNode, "onclick", "onClick");
		}
		this.setIcon();
		this.inherited(arguments);
	}, setIcon:function () {
		if (this.iconNode) {
			return;
		}
		var a = this.anchorNode;
		if (this.icon && this.icon != "none") {
			var img = this.iconNode = dojo.create("IMG");
			img.className = "mblListItemIcon";
			img.src = this.icon;
			this.domNode.insertBefore(img, a);
			dojox.mobile.setupIcon(this.iconNode, this.iconPos);
			dojo.removeClass(a, "mblListItemAnchorNoIcon");
		} else {
			dojo.addClass(a, "mblListItemAnchorNoIcon");
		}
	}, onClick:function (e) {
		var a = e.currentTarget;
		var li = a.parentNode;
		if (dojo.hasClass(li, "mblItemSelected")) {
			return;
		}
		if (this.anchorLabel) {
			for (var p = e.target; p.tagName != "LI"; p = p.parentNode) {
				if (p.className == "mblListItemTextBox") {
					dojo.addClass(p, "mblListItemTextBoxSelected");
					setTimeout(function () {
						dojo.removeClass(p, "mblListItemTextBoxSelected");
					}, 1000);
					this.onAnchorLabelClicked(e);
					return;
				}
			}
		}
		var parent = this.getParent();
		if (parent.stateful) {
			for (var i = 0, c = li.parentNode.childNodes; i < c.length; i++) {
				dojo.removeClass(c[i], "mblItemSelected");
			}
		} else {
			setTimeout(function () {
				dojo.removeClass(li, "mblItemSelected");
			}, 1000);
		}
		if (parent.select) {
			if (parent.select === "single") {
				if (!this.checked) {
					this.set("checked", true);
				}
			} else {
				if (parent.select === "multiple") {
					this.set("checked", !this.checked);
				}
			}
		}
		dojo.addClass(li, "mblItemSelected");
		this.transitionTo(this.moveTo, this.href, this.url, this.scene);
	}, onAnchorLabelClicked:function (e) {
	}, _setBtnClassAttr:function (rightIconClass) {
		var div;
		if (this.rightIconNode) {
			if (this.rightIconNode.className.match(/(mblDomButton\w+)/)) {
				dojo.removeClass(this.rightIconNode, RegExp.$1);
			}
			dojo.addClass(this.rightIconNode, rightIconClass);
			div = this.rightIconNode;
		} else {
			div = dojo.create("DIV", {className:rightIconClass}, this.anchorNode);
		}
		dojox.mobile.createDomButton(div);
		this.rightIconNode = div;
		this.rightIconClass = rightIconClass;
	}, _setCheckedAttr:function (checked) {
		var parent = this.getParent();
		if (parent.select === "single" && !this.checked && checked) {
			dojo.forEach(parent.getChildren(), function (child) {
				child.set("checked", false);
			});
		}
		if (!this.checkNode) {
			this._setBtnClassAttr(this.checkClass);
			this.checkNode = this.rightIconNode;
		}
		this.checkNode.style.display = checked ? "" : "none";
		dojo.toggleClass(this.domNode, "mblItemChecked", checked);
		if (this.checked !== checked) {
			this.getParent().onCheckStateChanged(this, checked);
		}
		this.checked = checked;
	}, _setRightTextAttr:function (text) {
		this.rightText = text;
		if (!this._rightTextNode) {
			this._rightTextNode = dojo.create("DIV", {className:"mblRightText"}, this.anchorNode);
		}
		this._rightTextNode.innerHTML = this._cv(text);
	}, _setLabelAttr:function (text) {
		this.labelNode.innerHTML = this._cv(text);
	}});
	dojo.declare("dojox.mobile.Switch", [dijit._WidgetBase, dijit._Contained], {value:"on", name:"", leftLabel:"ON", rightLabel:"OFF", _width:53, buildRendering:function () {
		this.domNode = dojo.doc.createElement("DIV");
		var c = this.srcNodeRef ? this.srcNodeRef.className : this.className;
		this._swClass = (c || "").replace(/ .*/, "");
		this.domNode.className = "mblSwitch";
		var nameAttr = this.name ? " name=\"" + this.name + "\"" : "";
		this.domNode.innerHTML = "<div class=\"mblSwitchInner\">" + "<div class=\"mblSwitchBg mblSwitchBgLeft\">" + "<div class=\"mblSwitchText mblSwitchTextLeft\">" + this._cv(this.leftLabel) + "</div>" + "</div>" + "<div class=\"mblSwitchBg mblSwitchBgRight\">" + "<div class=\"mblSwitchText mblSwitchTextRight\">" + this._cv(this.rightLabel) + "</div>" + "</div>" + "<div class=\"mblSwitchKnob\"></div>" + "<input type=\"hidden\"" + nameAttr + "></div>" + "</div>";
		var n = this.inner = this.domNode.firstChild;
		this.left = n.childNodes[0];
		this.right = n.childNodes[1];
		this.knob = n.childNodes[2];
		this.input = n.childNodes[3];
	}, postCreate:function () {
		this.connect(this.domNode, "onclick", "onClick");
		this.connect(this.domNode, dojox.mobile.hasTouch ? "touchstart" : "onmousedown", "onTouchStart");
	}, _changeState:function (state, anim) {
		var on = (state === "on");
		this.left.style.display = "";
		this.right.style.display = "";
		this.inner.style.left = "";
		if (anim) {
			dojo.addClass(this.domNode, "mblSwitchAnimation");
		}
		dojo.removeClass(this.domNode, on ? "mblSwitchOff" : "mblSwitchOn");
		dojo.addClass(this.domNode, on ? "mblSwitchOn" : "mblSwitchOff");
		var _this = this;
		setTimeout(function () {
			_this.left.style.display = on ? "" : "none";
			_this.right.style.display = !on ? "" : "none";
			dojo.removeClass(_this.domNode, "mblSwitchAnimation");
		}, anim ? 300 : 0);
	}, startup:function () {
		if (this._swClass.indexOf("Round") != -1) {
			var r = Math.round(this.domNode.offsetHeight / 2);
			this.createRoundMask(this._swClass, r, this.domNode.offsetWidth);
		}
	}, createRoundMask:function (className, r, w) {
		if (!dojo.isWebKit || !className) {
			return;
		}
		if (!this._createdMasks) {
			this._createdMasks = [];
		}
		if (this._createdMasks[className]) {
			return;
		}
		this._createdMasks[className] = 1;
		var ctx = dojo.doc.getCSSCanvasContext("2d", className + "Mask", w, 100);
		ctx.fillStyle = "#000000";
		ctx.beginPath();
		ctx.moveTo(r, 0);
		ctx.arcTo(0, 0, 0, 2 * r, r);
		ctx.arcTo(0, 2 * r, r, 2 * r, r);
		ctx.lineTo(w - r, 2 * r);
		ctx.arcTo(w, 2 * r, w, r, r);
		ctx.arcTo(w, 0, w - r, 0, r);
		ctx.closePath();
		ctx.fill();
	}, onClick:function (e) {
		if (this._moved) {
			return;
		}
		this.value = this.input.value = (this.value == "on") ? "off" : "on";
		this._changeState(this.value, true);
		this.onStateChanged(this.value);
	}, onTouchStart:function (e) {
		this._moved = false;
		this.innerStartX = this.inner.offsetLeft;
		if (!this._conn) {
			this._conn = [];
			this._conn.push(dojo.connect(this.inner, dojox.mobile.hasTouch ? "touchmove" : "onmousemove", this, "onTouchMove"));
			this._conn.push(dojo.connect(this.inner, dojox.mobile.hasTouch ? "touchend" : "onmouseup", this, "onTouchEnd"));
		}
		this.touchStartX = e.touches ? e.touches[0].pageX : e.clientX;
		this.left.style.display = "";
		this.right.style.display = "";
		dojo.stopEvent(e);
	}, onTouchMove:function (e) {
		e.preventDefault();
		var dx;
		if (e.targetTouches) {
			if (e.targetTouches.length != 1) {
				return false;
			}
			dx = e.targetTouches[0].clientX - this.touchStartX;
		} else {
			dx = e.clientX - this.touchStartX;
		}
		var pos = this.innerStartX + dx;
		var d = 10;
		if (pos <= -(this._width - d)) {
			pos = -this._width;
		}
		if (pos >= -d) {
			pos = 0;
		}
		this.inner.style.left = pos + "px";
		if (Math.abs(dx) > d) {
			this._moved = true;
		}
	}, onTouchEnd:function (e) {
		dojo.forEach(this._conn, dojo.disconnect);
		this._conn = null;
		if (this.innerStartX == this.inner.offsetLeft) {
			if (dojox.mobile.hasTouch) {
				var ev = dojo.doc.createEvent("MouseEvents");
				ev.initEvent("click", true, true);
				this.inner.dispatchEvent(ev);
			}
			return;
		}
		var newState = (this.inner.offsetLeft < -(this._width / 2)) ? "off" : "on";
		this._changeState(newState, true);
		if (newState != this.value) {
			this.value = this.input.value = newState;
			this.onStateChanged(newState);
		}
	}, onStateChanged:function (newState) {
	}, _setValueAttr:function (value) {
		this._changeState(value, false);
		if (this.value != value) {
			this.onStateChanged(value);
		}
		this.value = this.input.value = value;
	}});
	dojo.declare("dojox.mobile.ToolBarButton", dojox.mobile.AbstractItem, {selected:false, _defaultColor:"mblColorDefault", _selColor:"mblColorDefaultSel", buildRendering:function () {
		this.domNode = this.containerNode = this.srcNodeRef || dojo.doc.createElement("div");
		this.inheritParams();
		dojo.addClass(this.domNode, "mblToolbarButton mblArrowButtonText");
		var color;
		if (this.selected) {
			color = this._selColor;
		} else {
			if (this.domNode.className.indexOf("mblColor") == -1) {
				color = this._defaultColor;
			}
		}
		dojo.addClass(this.domNode, color);
		if (!this.label) {
			this.label = this.domNode.innerHTML;
		}
		this.domNode.innerHTML = this._cv(this.label);
		if (this.icon && this.icon != "none") {
			var img;
			if (this.iconPos) {
				var iconDiv = dojo.create("DIV", null, this.domNode);
				img = dojo.create("IMG", null, iconDiv);
				img.style.position = "absolute";
				var arr = this.iconPos.split(/[ ,]/);
				dojo.style(iconDiv, {position:"relative", width:arr[2] + "px", height:arr[3] + "px"});
			} else {
				img = dojo.create("IMG", null, this.domNode);
			}
			img.src = this.icon;
			dojox.mobile.setupIcon(img, this.iconPos);
			this.iconNode = img;
		} else {
			if (dojox.mobile.createDomButton(this.domNode)) {
				dojo.addClass(this.domNode, "mblToolbarButtonDomButton");
			}
		}
		this.connect(this.domNode, "onclick", "onClick");
	}, select:function (deselect) {
		dojo.toggleClass(this.domNode, this._selColor, !deselect);
		this.selected = !deselect;
	}, onClick:function (e) {
		this.defaultClickAction();
	}});
	dojo.declare("dojox.mobile.ProgressIndicator", null, {interval:100, colors:["#C0C0C0", "#C0C0C0", "#C0C0C0", "#C0C0C0", "#C0C0C0", "#C0C0C0", "#B8B9B8", "#AEAFAE", "#A4A5A4", "#9A9A9A", "#8E8E8E", "#838383"], _bars:[], constructor:function () {
		this.domNode = dojo.create("DIV");
		this.domNode.className = "mblProgContainer";
		this.spinnerNode = dojo.create("DIV", null, this.domNode);
		for (var i = 0; i < this.colors.length; i++) {
			var div = dojo.create("DIV", {className:"mblProg mblProg" + i}, this.spinnerNode);
			this._bars.push(div);
		}
	}, start:function () {
		if (this.imageNode) {
			var img = this.imageNode;
			var l = Math.round((this.domNode.offsetWidth - img.offsetWidth) / 2);
			var t = Math.round((this.domNode.offsetHeight - img.offsetHeight) / 2);
			img.style.margin = t + "px " + l + "px";
			return;
		}
		var cntr = 0;
		var _this = this;
		var n = this.colors.length;
		this.timer = setInterval(function () {
			cntr--;
			cntr = cntr < 0 ? n - 1 : cntr;
			var c = _this.colors;
			for (var i = 0; i < n; i++) {
				var idx = (cntr + i) % n;
				_this._bars[i].style.backgroundColor = c[idx];
			}
		}, this.interval);
	}, stop:function () {
		if (this.timer) {
			clearInterval(this.timer);
		}
		this.timer = null;
		if (this.domNode.parentNode) {
			this.domNode.parentNode.removeChild(this.domNode);
		}
	}, setImage:function (file) {
		if (file) {
			this.imageNode = dojo.create("IMG", {src:file}, this.domNode);
			this.spinnerNode.style.display = "none";
		} else {
			if (this.imageNode) {
				this.domNode.removeChild(this.imageNode);
				this.imageNode = null;
			}
			this.spinnerNode.style.display = "";
		}
	}});
	dojox.mobile.ProgressIndicator._instance = null;
	dojox.mobile.ProgressIndicator.getInstance = function () {
		if (!dojox.mobile.ProgressIndicator._instance) {
			dojox.mobile.ProgressIndicator._instance = new dojox.mobile.ProgressIndicator();
		}
		return dojox.mobile.ProgressIndicator._instance;
	};
	dojox.mobile.addClass = function () {
		var elems = document.getElementsByTagName("link");
		for (var i = 0, len = elems.length; i < len; i++) {
			if (elems[i].href.match(/dojox\/mobile\/themes\/(\w+)\//)) {
				dojox.mobile.theme = RegExp.$1;
				dojo.addClass(dojo.body(), dojox.mobile.theme);
				break;
			}
		}
	};
	dojox.mobile.setupIcon = function (iconNode, iconPos) {
		if (iconNode && iconPos) {
			var arr = dojo.map(iconPos.split(/[ ,]/), function (item) {
				return item - 0;
			});
			var t = arr[0];
			var r = arr[1] + arr[2];
			var b = arr[0] + arr[3];
			var l = arr[1];
			iconNode.style.clip = "rect(" + t + "px " + r + "px " + b + "px " + l + "px)";
			iconNode.style.top = dojo.style(iconNode, "top") - t + "px";
			iconNode.style.left = dojo.style(iconNode.parentNode, "paddingLeft") - l + "px";
		}
	};
	dojox.mobile.hideAddressBarWait = 1000;
	dojox.mobile.hideAddressBar = function (evt, doResize) {
		dojo.body().style.minHeight = "1000px";
		setTimeout(function () {
			scrollTo(0, 1);
		}, 100);
		setTimeout(function () {
			scrollTo(0, 1);
		}, 400);
		setTimeout(function () {
			scrollTo(0, 1);
			dojo.body().style.minHeight = (dojo.global.innerHeight || dojo.doc.documentElement.clientHeight) + "px";
			if (doResize !== false) {
				dojox.mobile.resizeAll();
			}
		}, dojox.mobile.hideAddressBarWait);
	};
	dojox.mobile.resizeAll = function (evt, root) {
		var isTopLevel = function (w) {
			var parent = w.getParent && w.getParent();
			return !!((!parent || !parent.resize) && w.resize);
		};
		var resizeRecursively = function (w) {
			dojo.forEach(w.getChildren(), function (child) {
				if (isTopLevel(child)) {
					child.resize();
				}
				resizeRecursively(child);
			});
		};
		if (root) {
			if (root.resize) {
				root.resize();
			}
			resizeRecursively(root);
		} else {
			dijit.registry.filter(isTopLevel).forEach(function (w) {
				w.resize();
			});
		}
	};
	dojox.mobile.openWindow = function (url, target) {
		dojo.global.open(url, target || "_blank");
	};
	dojox.mobile.createDomButton = function (refNode, style, toNode) {
		var s = refNode.className;
		var node = toNode || refNode;
		if (s.match(/(mblDomButton\w+)/) && s.indexOf("/") === -1) {
			var btnClass = RegExp.$1;
			var nDiv = 4;
			if (s.match(/(mblDomButton\w+_(\d+))/)) {
				nDiv = RegExp.$2 - 0;
			}
			for (var i = 0, p = node; i < nDiv; i++) {
				p = p.firstChild || dojo.create("DIV", null, p);
			}
			if (toNode) {
				setTimeout(function () {
					dojo.removeClass(refNode, btnClass);
				}, 0);
				dojo.addClass(toNode, btnClass);
			}
		} else {
			if (s.indexOf(".") !== -1) {
				dojo.create("IMG", {src:s}, node);
			} else {
				return null;
			}
		}
		dojo.addClass(node, "mblDomButton");
		dojo.style(node, style);
		return node;
	};
	dojo._loaders.unshift(function () {
		var nodes = dojo.body().getElementsByTagName("*");
		var i, len, s;
		len = nodes.length;
		for (i = 0; i < len; i++) {
			s = nodes[i].getAttribute("dojoType");
			if (s) {
				if (nodes[i].parentNode.getAttribute("lazy") == "true") {
					nodes[i].setAttribute("__dojoType", s);
					nodes[i].removeAttribute("dojoType");
				}
			}
		}
	});
	dojo.addOnLoad(function () {
		dojox.mobile.addClass();
		if (dojo.config["mblApplyPageStyles"] !== false) {
			dojo.addClass(dojo.doc.documentElement, "mobile");
		}
		var f = dojox.mobile.resizeAll;
		if (dojo.config["mblHideAddressBar"] !== false && navigator.appVersion.indexOf("Mobile") != -1 || dojo.config["mblForceHideAddressBar"] === true) {
			dojox.mobile.hideAddressBar();
			if (dojo.config["mblAlwaysHideAddressBar"] === true) {
				f = dojox.mobile.hideAddressBar;
			}
		}
		dojo.connect(null, (dojo.global.onorientationchange !== undefined && !dojo.isAndroid) ? "onorientationchange" : "onresize", null, f);
		var nodes = dojo.body().getElementsByTagName("*");
		var i, len = nodes.length, s;
		for (i = 0; i < len; i++) {
			s = nodes[i].getAttribute("__dojoType");
			if (s) {
				nodes[i].setAttribute("dojoType", s);
				nodes[i].removeAttribute("__dojoType");
			}
		}
		if (dojo.hash) {
			var findWidgets = function (root) {
				var arr;
				arr = dijit.findWidgets(root);
				var widgets = arr;
				for (var i = 0; i < widgets.length; i++) {
					arr = arr.concat(findWidgets(widgets[i].containerNode));
				}
				return arr;
			};
			dojo.subscribe("/dojo/hashchange", null, function (value) {
				var view = dojox.mobile.currentView;
				if (!view) {
					return;
				}
				var params = dojox.mobile._params;
				if (!params) {
					var moveTo = value ? value : dojox.mobile._defaultView.id;
					var widgets = findWidgets(view.domNode);
					var dir = 1, transition = "slide";
					for (i = 0; i < widgets.length; i++) {
						var w = widgets[i];
						if ("#" + moveTo == w.moveTo) {
							transition = w.transition;
							dir = (w instanceof dojox.mobile.Heading) ? -1 : 1;
							break;
						}
					}
					params = [moveTo, dir, transition];
				}
				view.performTransition.apply(view, params);
				dojox.mobile._params = null;
			});
		}
		dojo.body().style.visibility = "visible";
	});
	dijit.getEnclosingWidget = function (node) {
		while (node && node.tagName !== "BODY") {
			if (node.getAttribute && node.getAttribute("widgetId")) {
				return dijit.registry.byId(node.getAttribute("widgetId"));
			}
			node = node._parentNode || node.parentNode;
		}
		return null;
	};
	dojo.extend(dijit._WidgetBase, {_cv:function (s) {
		return s;
	}});
	(function () {
		if (dojo.isWebKit) {
			dojox.mobile.hasTouch = (typeof dojo.doc.documentElement.ontouchstart != "undefined" && navigator.appVersion.indexOf("Mobile") != -1);
		}
	})();
}

