/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mobile.IconContainer"]) {
	dojo._hasResource["dojox.mobile.IconContainer"] = true;
	dojo.provide("dojox.mobile.IconContainer");
	dojo.require("dojox.mobile");
	dojo.declare("dojox.mobile.IconContainer", [dijit._WidgetBase, dijit._Container, dijit._Contained], {defaultIcon:"", transition:"below", pressedIconOpacity:0.4, iconBase:"", iconPos:"", back:"Home", label:"My Application", single:false, buildRendering:function () {
		this.domNode = this.containerNode = this.srcNodeRef || dojo.doc.createElement("UL");
		this.domNode.className = "mblIconContainer";
		var t = this._terminator = dojo.create("LI");
		t.className = "mblIconItemTerminator";
		t.innerHTML = "&nbsp;";
		this.domNode.appendChild(t);
	}, _setupSubNodes:function (ul) {
		var len = this.domNode.childNodes.length - 1;
		for (i = 0; i < len; i++) {
			child = this.domNode.childNodes[i];
			if (child.nodeType != 1) {
				continue;
			}
			w = dijit.byNode(child);
			if (this.single) {
				w.subNode.firstChild.style.display = "none";
			}
			ul.appendChild(w.subNode);
		}
	}, startup:function () {
		if (this._started) {
			return;
		}
		var ul, i, len, child, w;
		if (this.transition == "below") {
			this._setupSubNodes(this.domNode);
		} else {
			var view = new dojox.mobile.View({id:this.id + "_mblApplView"});
			var _this = this;
			view.onAfterTransitionIn = function (moveTo, dir, transition, context, method) {
				_this._opening._open_1();
			};
			view.domNode.style.visibility = "hidden";
			var heading = view._heading = new dojox.mobile.Heading({back:this._cv(this.back), label:this._cv(this.label), moveTo:this.domNode.parentNode.id, transition:this.transition});
			view.addChild(heading);
			ul = dojo.doc.createElement("UL");
			ul.className = "mblIconContainer";
			ul.style.marginTop = "0px";
			this._setupSubNodes(ul);
			view.domNode.appendChild(ul);
			dojo.doc.body.appendChild(view.domNode);
			heading.startup();
		}
		this.inherited(arguments);
	}, closeAll:function () {
		var len = this.domNode.childNodes.length;
		for (var i = 0; i < len; i++) {
			child = this.domNode.childNodes[i];
			if (child.nodeType != 1) {
				continue;
			}
			if (child == this._terminator) {
				break;
			}
			w = dijit.byNode(child);
			w.containerNode.parentNode.style.display = "none";
			w.setOpacity(w.iconNode, 1);
		}
	}, addChild:function (widget) {
		this.domNode.insertBefore(widget.domNode, this._terminator);
		widget.transition = this.transition;
		if (this.transition == "below") {
			this.domNode.appendChild(widget.subNode);
		}
		widget.inheritParams();
		widget.setIcon();
	}});
	dojo.declare("dojox.mobile.IconItem", dojox.mobile.AbstractItem, {lazy:false, requires:"", timeout:10, closeBtnClass:"mblDomButtonBlueMinus", templateString:"<li class=\"mblIconItem\">" + "<div class=\"mblIconArea\" dojoAttachPoint=\"iconDivNode\">" + "<div><img src=\"${icon}\" dojoAttachPoint=\"iconNode\"></div>${label}" + "</div>" + "</li>", templateStringSub:"<li class=\"mblIconItemSub\" lazy=\"${lazy}\" style=\"display:none;\" dojoAttachPoint=\"contentNode\">" + "<h2 class=\"mblIconContentHeading\" dojoAttachPoint=\"closeNode\">" + "<div class=\"${closeBtnClass}\" style=\"position:absolute;left:4px;top:2px;\" dojoAttachPoint=\"closeIconNode\"></div>${label}" + "</h2>" + "<div class=\"mblContent\" dojoAttachPoint=\"containerNode\"></div>" + "</li>", createTemplate:function (s) {
		dojo.forEach(["lazy", "icon", "label", "closeBtnClass"], function (v) {
			while (s.indexOf("${" + v + "}") != -1) {
				var val = v === "label" ? this._cv(this[v]) : this[v];
				s = s.replace("${" + v + "}", val);
			}
		}, this);
		var div = dojo.doc.createElement("DIV");
		div.innerHTML = s;
		var nodes = div.getElementsByTagName("*");
		var i, len, s1;
		len = nodes.length;
		for (i = 0; i < len; i++) {
			s1 = nodes[i].getAttribute("dojoAttachPoint");
			if (s1) {
				this[s1] = nodes[i];
			}
		}
		var domNode = div.removeChild(div.firstChild);
		div = null;
		return domNode;
	}, buildRendering:function () {
		this.inheritParams();
		this.domNode = this.createTemplate(this.templateString);
		this.subNode = this.createTemplate(this.templateStringSub);
		this.subNode._parentNode = this.domNode;
		if (this.srcNodeRef) {
			for (var i = 0, len = this.srcNodeRef.childNodes.length; i < len; i++) {
				this.containerNode.appendChild(this.srcNodeRef.removeChild(this.srcNodeRef.firstChild));
			}
			this.srcNodeRef.parentNode.replaceChild(this.domNode, this.srcNodeRef);
			this.srcNodeRef = null;
		}
		this.setIcon();
	}, setIcon:function () {
		this.iconNode.src = this.icon;
		dojox.mobile.setupIcon(this.iconNode, this.iconPos);
	}, postCreate:function () {
		dojox.mobile.createDomButton(this.closeIconNode, {top:"-2px", left:"1px"});
		this.connect(this.iconNode, "onmousedown", "onMouseDownIcon");
		this.connect(this.iconNode, "onclick", "iconClicked");
		this.connect(this.closeIconNode, "onclick", "closeIconClicked");
		this.connect(this.iconNode, "onerror", "onError");
	}, highlight:function () {
		dojo.addClass(this.iconDivNode, "mblVibrate");
		if (this.timeout > 0) {
			var _this = this;
			setTimeout(function () {
				_this.unhighlight();
			}, this.timeout * 1000);
		}
	}, unhighlight:function () {
		dojo.removeClass(this.iconDivNode, "mblVibrate");
	}, setOpacity:function (node, val) {
		node.style.opacity = val;
		node.style.mozOpacity = val;
		node.style.khtmlOpacity = val;
		node.style.webkitOpacity = val;
	}, instantiateWidget:function (e) {
		var nodes = this.containerNode.getElementsByTagName("*");
		var len = nodes.length;
		var s;
		for (var i = 0; i < len; i++) {
			s = nodes[i].getAttribute("dojoType");
			if (s) {
				dojo["require"](s);
			}
		}
		if (len > 0) {
			dojo.parser.parse(this.containerNode);
		}
		this.lazy = false;
	}, isOpen:function (e) {
		return this.containerNode.style.display != "none";
	}, onMouseDownIcon:function (e) {
		this.setOpacity(this.iconNode, this.getParent().pressedIconOpacity);
	}, iconClicked:function (e) {
		if (e) {
			setTimeout(dojo.hitch(this, function (d) {
				this.iconClicked();
			}), 0);
			return;
		}
		if (this.moveTo || this.href || this.url) {
			this.transitionTo(this.moveTo, this.href, this.url);
			setTimeout(dojo.hitch(this, function (d) {
				this.setOpacity(this.iconNode, 1);
			}), 1500);
		} else {
			this.open();
		}
	}, closeIconClicked:function (e) {
		if (e) {
			setTimeout(dojo.hitch(this, function (d) {
				this.closeIconClicked();
			}), 0);
			return;
		}
		this.close();
	}, open:function () {
		var parent = this.getParent();
		if (this.transition == "below") {
			if (parent.single) {
				parent.closeAll();
				this.setOpacity(this.iconNode, this.getParent().pressedIconOpacity);
			}
			this._open_1();
		} else {
			parent._opening = this;
			if (parent.single) {
				parent.closeAll();
				var view = dijit.byId(parent.id + "_mblApplView");
				view._heading.setLabel(this.label);
			}
			this.transitionTo(parent.id + "_mblApplView");
		}
	}, _open_1:function () {
		this.contentNode.style.display = "";
		this.unhighlight();
		if (this.lazy) {
			if (this.requires) {
				dojo.forEach(this.requires.split(/,/), function (c) {
					dojo["require"](c);
				});
			}
			this.instantiateWidget();
		}
		this.contentNode.scrollIntoView();
		this.onOpen();
	}, close:function () {
		if (dojo.isWebKit) {
			var t = this.domNode.parentNode.offsetWidth / 8;
			var y = this.iconNode.offsetLeft;
			var pos = 0;
			for (var i = 1; i <= 3; i++) {
				if (t * (2 * i - 1) < y && y <= t * (2 * (i + 1) - 1)) {
					pos = i;
					break;
				}
			}
			dojo.addClass(this.containerNode.parentNode, "mblCloseContent mblShrink" + pos);
		} else {
			this.containerNode.parentNode.style.display = "none";
		}
		this.setOpacity(this.iconNode, 1);
		this.onClose();
	}, onOpen:function () {
	}, onClose:function () {
	}, onError:function () {
		this.iconNode.src = this.getParent().defaultIcon;
	}});
}

