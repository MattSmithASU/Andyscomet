/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["andes.options"]) {
	dojo._hasResource["andes.options"] = true;
	dojo.provide("andes.options");
	dojo.require("dijit.ColorPalette");
	dojo.declare("andes.options", null, {_prefs:{"angleSnap":"setAngleSnap", "clickMode":"setClickMode", "timer":"setShowTimer", "correct":"setCorrectColor", "incorrect":"setIncorrectColor"}, userWidgets:{"angleSnap":"optionsAngleSnap", "clickMode":"optionsClickMode", "save":"optionsSave", "dialog":"options", "showTimer":"showTimer"}, userVisuals:{"correct":"colorCorrect", "incorrect":"colorIncorrect"}, constructor:function () {
		for (var nm in this.userWidgets) {
			this[nm] = dijit.byId(this.userWidgets[nm]);
		}
		for (var nm in this.userVisuals) {
			this[nm] = dojo.byId(this.userVisuals[nm]);
		}
		for (var nm in this._prefs) {
			andes.preferenceRegistry.registerPref(nm, this[this._prefs[nm]], this);
		}
		this.angleSnap.set("value", myDrawing.defaults.angleSnap);
		this.clickMode.set("label", myDrawing.defaults.clickMode ? "enabled" : "disabled");
		this.showTimer.set("label", andes.timer.display ? "enabled" : "disabled");
		dojo.style(this.correct, "background", myDrawing.defaults.correct.color);
		dojo.style(this.incorrect, "background", myDrawing.defaults.incorrect.color);
		var ops = this;
		this.picker = new dijit.ColorPalette({id:"picker", open:false, onChange:function (value) {
			this.onExecute();
		}, onExecute:function () {
			this.open = false;
			dijit.popup.close(this);
		}, onCancel:function (closeAll) {
			this.open = false;
			dijit.popup.close(this);
		}}, dojo.doc.createElement("div"));
		dijit.popup.moveOffScreen(this.picker);
		this.connectMult([[this.angleSnap, "onChange", this, "setAngleSnap"], [this.clickMode, "onChange", this, "setClickMode"], [this.showTimer, "onChange", this, "setShowTimer"], [this.correct, "onclick", this, "colorChange"], [this.incorrect, "onclick", this, "colorChange"], [this.dialog, "onHide", this, function () {
			this.picker.open && this.picker.onCancel();
		}]]);
	}, connectMult:function (c) {
		dojo.forEach(c, function (o) {
			dojo.connect.apply(this, o);
		});
	}, setAngleSnap:function (val) {
		this._setChange("angleSnap", val);
	}, setClickMode:function (val) {
		this.clickMode.set("label", val ? "enabled" : "disabled");
		this._setChange("clickMode", val);
	}, setShowTimer:function (val) {
		this.timer = val;
		this.showTimer.set("label", val ? "enabled" : "disabled");
		this._setChange("timer", val, andes.timer.displayTimer, andes.timer);
	}, setCorrectColor:function (val) {
		this._setColor(this.correct, "correct", val);
	}, setIncorrectColor:function (val) {
		this._setColor(this.incorrect, "incorrect", val);
	}, _setColor:function (node, name, val) {
		var o = {};
		if (typeof (val) == "object") {
			o = val;
		} else {
			var fill = this._getFill(val);
			o = {color:val, fill:fill};
		}
		dojo.style(node, "background", o.color);
		this._setChange(name, o);
	}, _getFill:function (color) {
		var R = Math.round(parseInt(color.substr(1, 2), 16) + 50), G = Math.round(parseInt(color.substr(3, 2), 16) + 50), B = Math.round(parseInt(color.substr(5, 2), 16) + 50);
		R = R > 255 ? 255 : R;
		G = G > 255 ? 255 : G;
		B = B > 255 ? 255 : B;
		return "#" + R.toString(16) + G.toString(16) + B.toString(16);
	}, colorChange:function (evt) {
		var c = dojo.connect(this.picker, "onChange", this, function (value) {
			dojo.disconnect(c);
			if (evt.target == this.correct) {
				this.setCorrectColor(value);
			} else {
				this.setIncorrectColor(value);
			}
		});
		this.picker.open = true;
		dijit.popup.open({popup:this.picker, around:evt.target});
	}, _setChange:function (name, value, f, s) {
		if (!f) {
			var o = {};
			o[name] = value;
			myDrawing.changeDefaults(o, true);
		} else {
			f.call(s, value);
		}
		andes.preferenceRegistry.savePref(name, value);
	}});
}

