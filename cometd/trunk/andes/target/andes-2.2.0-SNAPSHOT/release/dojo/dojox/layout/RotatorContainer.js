/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.layout.RotatorContainer"]) {
	dojo._hasResource["dojox.layout.RotatorContainer"] = true;
	dojo.provide("dojox.layout.RotatorContainer");
	dojo.require("dojo.fx");
	dojo.require("dijit.layout.StackContainer");
	dojo.require("dijit.layout.StackController");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.require("dijit._Contained");
	dojo.declare("dojox.layout.RotatorContainer", [dijit.layout.StackContainer, dijit._Templated], {templateString:"<div class=\"dojoxRotatorContainer\"><div dojoAttachPoint=\"tabNode\"></div><div class=\"dojoxRotatorPager\" dojoAttachPoint=\"pagerNode\"></div><div class=\"dojoxRotatorContent\" dojoAttachPoint=\"containerNode\"></div></div>", showTabs:true, transitionDelay:5000, transition:"fade", transitionDuration:1000, autoStart:true, suspendOnHover:false, pauseOnManualChange:null, reverse:false, pagerId:"", cycles:-1, pagerClass:"dojox.layout.RotatorPager", postCreate:function () {
		this.inherited(arguments);
		dojo.style(this.domNode, "position", "relative");
		if (this.cycles - 0 == this.cycles && this.cycles != -1) {
			this.cycles++;
		} else {
			this.cycles = -1;
		}
		if (this.pauseOnManualChange === null) {
			this.pauseOnManualChange = !this.suspendOnHover;
		}
		var id = this.id || "rotator" + (new Date()).getTime(), sc = new dijit.layout.StackController({containerId:id}, this.tabNode);
		this.tabNode = sc.domNode;
		this._stackController = sc;
		dojo.style(this.tabNode, "display", this.showTabs ? "" : "none");
		this.connect(sc, "onButtonClick", "_manualChange");
		this._subscriptions = [dojo.subscribe(this.id + "-cycle", this, "_cycle"), dojo.subscribe(this.id + "-state", this, "_state")];
		var d = Math.round(this.transitionDelay * 0.75);
		if (d < this.transitionDuration) {
			this.transitionDuration = d;
		}
		if (this.suspendOnHover) {
			this.connect(this.domNode, "onmouseover", "_onMouseOver");
			this.connect(this.domNode, "onmouseout", "_onMouseOut");
		}
	}, startup:function () {
		if (this._started) {
			return;
		}
		var c = this.getChildren();
		for (var i = 0, len = c.length; i < len; i++) {
			if (c[i].declaredClass == this.pagerClass) {
				this.pagerNode.appendChild(c[i].domNode);
				break;
			}
		}
		this.inherited(arguments);
		if (this.autoStart) {
			setTimeout(dojo.hitch(this, "_play"), 10);
		} else {
			this._updatePager();
		}
	}, destroy:function () {
		dojo.forEach(this._subscriptions, dojo.unsubscribe);
		this.inherited(arguments);
	}, _setShowTabsAttr:function (value) {
		this.showTabs = value;
		dojo.style(this.tabNode, "display", value ? "" : "none");
	}, _updatePager:function () {
		var c = this.getChildren();
		dojo.publish(this.id + "-update", [this._playing, dojo.indexOf(c, this.selectedChildWidget) + 1, c.length]);
	}, _onMouseOver:function () {
		this._resetTimer();
		this._over = true;
	}, _onMouseOut:function () {
		this._over = false;
		if (this._playing) {
			clearTimeout(this._timer);
			this._timer = setTimeout(dojo.hitch(this, "_play", true), 200);
		}
	}, _resetTimer:function () {
		clearTimeout(this._timer);
		this._timer = null;
	}, _cycle:function (next) {
		if (next instanceof Boolean || typeof next == "boolean") {
			this._manualChange();
		}
		var c = this.getChildren(), len = c.length, i = dojo.indexOf(c, this.selectedChildWidget) + (next === false || (next !== true && this.reverse) ? -1 : 1);
		this.selectChild(c[(i < len ? (i < 0 ? len - 1 : i) : 0)]);
		this._updatePager();
	}, _manualChange:function () {
		if (this.pauseOnManualChange) {
			this._playing = false;
		}
		this.cycles = -1;
	}, _play:function (skip) {
		this._playing = true;
		this._resetTimer();
		if (skip !== true && this.cycles > 0) {
			this.cycles--;
		}
		if (this.cycles == 0) {
			this._pause();
		} else {
			if ((!this.suspendOnHover || !this._over) && this.transitionDelay) {
				this._timer = setTimeout(dojo.hitch(this, "_cycle"), this.selectedChildWidget.domNode.getAttribute("transitionDelay") || this.transitionDelay);
			}
		}
		this._updatePager();
	}, _pause:function () {
		this._playing = false;
		this._resetTimer();
	}, _state:function (playing) {
		if (playing) {
			this.cycles = -1;
			this._play();
		} else {
			this._pause();
		}
	}, _transition:function (next, prev) {
		this._resetTimer();
		if (prev && this.transitionDuration) {
			switch (this.transition) {
			  case "fade":
				this._fade(next, prev);
				return;
			}
		}
		this._transitionEnd();
		this.inherited(arguments);
	}, _transitionEnd:function () {
		if (this._playing) {
			this._play();
		} else {
			this._updatePager();
		}
	}, _fade:function (next, prev) {
		this._styleNode(prev.domNode, 1, 1);
		this._styleNode(next.domNode, 0, 2);
		this._showChild(next);
		if (this.doLayout && next.resize) {
			next.resize(this._containerContentBox || this._contentBox);
		}
		var args = {duration:this.transitionDuration}, anim = dojo.fx.combine([dojo["fadeOut"](dojo.mixin({node:prev.domNode}, args)), dojo["fadeIn"](dojo.mixin({node:next.domNode}, args))]);
		this.connect(anim, "onEnd", dojo.hitch(this, function () {
			this._hideChild(prev);
			this._transitionEnd();
		}));
		anim.play();
	}, _styleNode:function (node, opacity, zIndex) {
		dojo.style(node, "opacity", opacity);
		dojo.style(node, "zIndex", zIndex);
		dojo.style(node, "position", "absolute");
	}});
	dojo.declare("dojox.layout.RotatorPager", [dijit._Widget, dijit._Templated, dijit._Contained], {widgetsInTemplate:true, rotatorId:"", postMixInProperties:function () {
		this.templateString = "<div>" + this.srcNodeRef.innerHTML + "</div>";
	}, postCreate:function () {
		var p = dijit.byId(this.rotatorId) || this.getParent();
		if (p && p.declaredClass == "dojox.layout.RotatorContainer") {
			if (this.previous) {
				dojo.connect(this.previous, "onClick", function () {
					dojo.publish(p.id + "-cycle", [false]);
				});
			}
			if (this.next) {
				dojo.connect(this.next, "onClick", function () {
					dojo.publish(p.id + "-cycle", [true]);
				});
			}
			if (this.playPause) {
				dojo.connect(this.playPause, "onClick", function () {
					this.set("label", this.checked ? "Pause" : "Play");
					dojo.publish(p.id + "-state", [this.checked]);
				});
			}
			this._subscriptions = [dojo.subscribe(p.id + "-state", this, "_state"), dojo.subscribe(p.id + "-update", this, "_update")];
		}
	}, destroy:function () {
		dojo.forEach(this._subscriptions, dojo.unsubscribe);
		this.inherited(arguments);
	}, _state:function (playing) {
		if (this.playPause && this.playPause.checked != playing) {
			this.playPause.set("label", playing ? "Pause" : "Play");
			this.playPause.set("checked", playing);
		}
	}, _update:function (playing, current, total) {
		this._state(playing);
		if (this.current && current) {
			this.current.innerHTML = current;
		}
		if (this.total && total) {
			this.total.innerHTML = total;
		}
	}});
}

