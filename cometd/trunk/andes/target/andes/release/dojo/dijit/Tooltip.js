/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.Tooltip"]) {
	dojo._hasResource["dijit.Tooltip"] = true;
	dojo.provide("dijit.Tooltip");
	dojo.require("dijit._Widget");
	dojo.require("dijit._TemplatedMixin");
	dojo.declare("dijit._MasterTooltip", [dijit._Widget, dijit._TemplatedMixin], {duration:dijit.defaultDuration, templateString:dojo.cache("dijit", "templates/Tooltip.html", "<div class=\"dijitTooltip dijitTooltipLeft\" id=\"dojoTooltip\"\n\t><div class=\"dijitTooltipContainer dijitTooltipContents\" dojoAttachPoint=\"containerNode\" role='alert'></div\n\t><div class=\"dijitTooltipConnector\" dojoAttachPoint=\"connectorNode\"></div\n></div>\n"), postCreate:function () {
		dojo.body().appendChild(this.domNode);
		this.bgIframe = new dijit.BackgroundIframe(this.domNode);
		this.fadeIn = dojo.fadeIn({node:this.domNode, duration:this.duration, onEnd:dojo.hitch(this, "_onShow")});
		this.fadeOut = dojo.fadeOut({node:this.domNode, duration:this.duration, onEnd:dojo.hitch(this, "_onHide")});
	}, show:function (innerHTML, aroundNode, position, rtl) {
		if (this.aroundNode && this.aroundNode === aroundNode) {
			return;
		}
		this.domNode.width = "auto";
		if (this.fadeOut.status() == "playing") {
			this._onDeck = arguments;
			return;
		}
		this.containerNode.innerHTML = innerHTML;
		var pos = dijit.placeOnScreenAroundElement(this.domNode, aroundNode, dijit.getPopupAroundAlignment((position && position.length) ? position : dijit.Tooltip.defaultPosition, !rtl), dojo.hitch(this, "orient"));
		dojo.style(this.domNode, "opacity", 0);
		this.fadeIn.play();
		this.isShowingNow = true;
		this.aroundNode = aroundNode;
	}, orient:function (node, aroundCorner, tooltipCorner, spaceAvailable, aroundNodeCoords) {
		this.connectorNode.style.top = "";
		var tooltipSpaceAvaliableWidth = spaceAvailable.w - this.connectorNode.offsetWidth;
		node.className = "dijitTooltip " + {"BL-TL":"dijitTooltipBelow dijitTooltipABLeft", "TL-BL":"dijitTooltipAbove dijitTooltipABLeft", "BR-TR":"dijitTooltipBelow dijitTooltipABRight", "TR-BR":"dijitTooltipAbove dijitTooltipABRight", "BR-BL":"dijitTooltipRight", "BL-BR":"dijitTooltipLeft"}[aroundCorner + "-" + tooltipCorner];
		this.domNode.style.width = "auto";
		var size = dojo.contentBox(this.domNode);
		var width = Math.min((Math.max(tooltipSpaceAvaliableWidth, 1)), size.w);
		var widthWasReduced = width < size.w;
		this.domNode.style.width = width + "px";
		if (widthWasReduced) {
			this.containerNode.style.overflow = "auto";
			var scrollWidth = this.containerNode.scrollWidth;
			this.containerNode.style.overflow = "visible";
			if (scrollWidth > width) {
				scrollWidth = scrollWidth + dojo.style(this.domNode, "paddingLeft") + dojo.style(this.domNode, "paddingRight");
				this.domNode.style.width = scrollWidth + "px";
			}
		}
		if (tooltipCorner.charAt(0) == "B" && aroundCorner.charAt(0) == "B") {
			var mb = dojo.marginBox(node);
			var tooltipConnectorHeight = this.connectorNode.offsetHeight;
			if (mb.h > spaceAvailable.h) {
				var aroundNodePlacement = spaceAvailable.h - (aroundNodeCoords.h / 2) - (tooltipConnectorHeight / 2);
				this.connectorNode.style.top = aroundNodePlacement + "px";
				this.connectorNode.style.bottom = "";
			} else {
				this.connectorNode.style.bottom = Math.min(Math.max(aroundNodeCoords.h / 2 - tooltipConnectorHeight / 2, 0), mb.h - tooltipConnectorHeight) + "px";
				this.connectorNode.style.top = "";
			}
		} else {
			this.connectorNode.style.top = "";
			this.connectorNode.style.bottom = "";
		}
		return Math.max(0, size.w - tooltipSpaceAvaliableWidth);
	}, _onShow:function () {
		if (dojo.isIE) {
			this.domNode.style.filter = "";
		}
	}, hide:function (aroundNode) {
		if (this._onDeck && this._onDeck[1] == aroundNode) {
			this._onDeck = null;
		} else {
			if (this.aroundNode === aroundNode) {
				this.fadeIn.stop();
				this.isShowingNow = false;
				this.aroundNode = null;
				this.fadeOut.play();
			} else {
			}
		}
	}, _onHide:function () {
		this.domNode.style.cssText = "";
		this.containerNode.innerHTML = "";
		if (this._onDeck) {
			this.show.apply(this, this._onDeck);
			this._onDeck = null;
		}
	}});
	dijit.showTooltip = function (innerHTML, aroundNode, position, rtl) {
		if (!dijit._masterTT) {
			dijit._masterTT = new dijit._MasterTooltip();
		}
		return dijit._masterTT.show(innerHTML, aroundNode, position, rtl);
	};
	dijit.hideTooltip = function (aroundNode) {
		if (!dijit._masterTT) {
			dijit._masterTT = new dijit._MasterTooltip();
		}
		return dijit._masterTT.hide(aroundNode);
	};
	dojo.declare("dijit.Tooltip", dijit._Widget, {label:"", showDelay:400, connectId:[], position:[], _setConnectIdAttr:function (newId) {
		dojo.forEach(this._connections || [], function (nested) {
			dojo.forEach(nested, dojo.hitch(this, "disconnect"));
		}, this);
		var ary = dojo.isArrayLike(newId) ? newId : (newId ? [newId] : []);
		this._connections = dojo.map(ary, function (id) {
			var node = dojo.byId(id);
			return node ? [this.connect(node, "onmouseenter", "_onTargetMouseEnter"), this.connect(node, "onmouseleave", "_onTargetMouseLeave"), this.connect(node, "onfocus", "_onTargetFocus"), this.connect(node, "onblur", "_onTargetBlur")] : [];
		}, this);
		this._set("connectId", newId);
		this._connectIds = ary;
	}, addTarget:function (node) {
		var id = node.id || node;
		if (dojo.indexOf(this._connectIds, id) == -1) {
			this.set("connectId", this._connectIds.concat(id));
		}
	}, removeTarget:function (node) {
		var id = node.id || node, idx = dojo.indexOf(this._connectIds, id);
		if (idx >= 0) {
			this._connectIds.splice(idx, 1);
			this.set("connectId", this._connectIds);
		}
	}, buildRendering:function () {
		this.inherited(arguments);
		dojo.addClass(this.domNode, "dijitTooltipData");
	}, startup:function () {
		this.inherited(arguments);
		var ids = this.connectId;
		dojo.forEach(dojo.isArrayLike(ids) ? ids : [ids], this.addTarget, this);
	}, _onTargetMouseEnter:function (e) {
		this._onHover(e);
	}, _onTargetMouseLeave:function (e) {
		this._onUnHover(e);
	}, _onTargetFocus:function (e) {
		this._focus = true;
		this._onHover(e);
	}, _onTargetBlur:function (e) {
		this._focus = false;
		this._onUnHover(e);
	}, _onHover:function (e) {
		if (!this._showTimer) {
			var target = e.target;
			this._showTimer = setTimeout(dojo.hitch(this, function () {
				this.open(target);
			}), this.showDelay);
		}
	}, _onUnHover:function (e) {
		if (this._focus) {
			return;
		}
		if (this._showTimer) {
			clearTimeout(this._showTimer);
			delete this._showTimer;
		}
		this.close();
	}, open:function (target) {
		if (this._showTimer) {
			clearTimeout(this._showTimer);
			delete this._showTimer;
		}
		dijit.showTooltip(this.label || this.domNode.innerHTML, target, this.position, !this.isLeftToRight());
		this._connectNode = target;
		this.onShow(target, this.position);
	}, close:function () {
		if (this._connectNode) {
			dijit.hideTooltip(this._connectNode);
			delete this._connectNode;
			this.onHide();
		}
		if (this._showTimer) {
			clearTimeout(this._showTimer);
			delete this._showTimer;
		}
	}, onShow:function (target, position) {
	}, onHide:function () {
	}, uninitialize:function () {
		this.close();
		this.inherited(arguments);
	}});
	dijit.Tooltip.defaultPosition = ["after", "before"];
}

