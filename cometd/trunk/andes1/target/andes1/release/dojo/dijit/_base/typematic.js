/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._base.typematic"]) {
	dojo._hasResource["dijit._base.typematic"] = true;
	dojo.provide("dijit._base.typematic");
	dijit.typematic = {_fireEventAndReload:function () {
		this._timer = null;
		this._callback(++this._count, this._node, this._evt);
		this._currentTimeout = Math.max(this._currentTimeout < 0 ? this._initialDelay : (this._subsequentDelay > 1 ? this._subsequentDelay : Math.round(this._currentTimeout * this._subsequentDelay)), this._minDelay);
		this._timer = setTimeout(dojo.hitch(this, "_fireEventAndReload"), this._currentTimeout);
	}, trigger:function (evt, _this, node, callback, obj, subsequentDelay, initialDelay, minDelay) {
		if (obj != this._obj) {
			this.stop();
			this._initialDelay = initialDelay || 500;
			this._subsequentDelay = subsequentDelay || 0.9;
			this._minDelay = minDelay || 10;
			this._obj = obj;
			this._evt = evt;
			this._node = node;
			this._currentTimeout = -1;
			this._count = -1;
			this._callback = dojo.hitch(_this, callback);
			this._fireEventAndReload();
			this._evt = dojo.mixin({faux:true}, evt);
		}
	}, stop:function () {
		if (this._timer) {
			clearTimeout(this._timer);
			this._timer = null;
		}
		if (this._obj) {
			this._callback(-1, this._node, this._evt);
			this._obj = null;
		}
	}, addKeyListener:function (node, keyObject, _this, callback, subsequentDelay, initialDelay, minDelay) {
		if (keyObject.keyCode) {
			keyObject.charOrCode = keyObject.keyCode;
			dojo.deprecated("keyCode attribute parameter for dijit.typematic.addKeyListener is deprecated. Use charOrCode instead.", "", "2.0");
		} else {
			if (keyObject.charCode) {
				keyObject.charOrCode = String.fromCharCode(keyObject.charCode);
				dojo.deprecated("charCode attribute parameter for dijit.typematic.addKeyListener is deprecated. Use charOrCode instead.", "", "2.0");
			}
		}
		return [dojo.connect(node, "onkeypress", this, function (evt) {
			if (evt.charOrCode == keyObject.charOrCode && (keyObject.ctrlKey === undefined || keyObject.ctrlKey == evt.ctrlKey) && (keyObject.altKey === undefined || keyObject.altKey == evt.altKey) && (keyObject.metaKey === undefined || keyObject.metaKey == (evt.metaKey || false)) && (keyObject.shiftKey === undefined || keyObject.shiftKey == evt.shiftKey)) {
				dojo.stopEvent(evt);
				dijit.typematic.trigger(evt, _this, node, callback, keyObject, subsequentDelay, initialDelay, minDelay);
			} else {
				if (dijit.typematic._obj == keyObject) {
					dijit.typematic.stop();
				}
			}
		}), dojo.connect(node, "onkeyup", this, function (evt) {
			if (dijit.typematic._obj == keyObject) {
				dijit.typematic.stop();
			}
		})];
	}, addMouseListener:function (node, _this, callback, subsequentDelay, initialDelay, minDelay) {
		var dc = dojo.connect;
		return [dc(node, "mousedown", this, function (evt) {
			dojo.stopEvent(evt);
			dijit.typematic.trigger(evt, _this, node, callback, node, subsequentDelay, initialDelay, minDelay);
		}), dc(node, "mouseup", this, function (evt) {
			dojo.stopEvent(evt);
			dijit.typematic.stop();
		}), dc(node, "mouseout", this, function (evt) {
			dojo.stopEvent(evt);
			dijit.typematic.stop();
		}), dc(node, "mousemove", this, function (evt) {
			evt.preventDefault();
		}), dc(node, "dblclick", this, function (evt) {
			dojo.stopEvent(evt);
			if (dojo.isIE) {
				dijit.typematic.trigger(evt, _this, node, callback, node, subsequentDelay, initialDelay, minDelay);
				setTimeout(dojo.hitch(this, dijit.typematic.stop), 50);
			}
		})];
	}, addListener:function (mouseNode, keyNode, keyObject, _this, callback, subsequentDelay, initialDelay, minDelay) {
		return this.addKeyListener(keyNode, keyObject, _this, callback, subsequentDelay, initialDelay, minDelay).concat(this.addMouseListener(mouseNode, _this, callback, subsequentDelay, initialDelay, minDelay));
	}};
}

