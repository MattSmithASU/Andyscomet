/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.drawing.manager.keys"]) {
	dojo._hasResource["dojox.drawing.manager.keys"] = true;
	dojo.provide("dojox.drawing.manager.keys");
	(function () {
		var isEdit = false;
		var enabled = true;
		var alphabet = "abcdefghijklmnopqrstuvwxyz";
		dojox.drawing.manager.keys = {arrowIncrement:1, arrowShiftIncrement:10, shift:false, ctrl:false, alt:false, cmmd:false, meta:false, onDelete:function (evt) {
		}, onEsc:function (evt) {
		}, onEnter:function (evt) {
		}, onArrow:function (evt) {
		}, onKeyDown:function (evt) {
		}, onKeyUp:function (evt) {
		}, listeners:[], register:function (options) {
			var _handle = dojox.drawing.util.uid("listener");
			this.listeners.push({handle:_handle, scope:options.scope || window, callback:options.callback, keyCode:options.keyCode});
		}, _getLetter:function (evt) {
			if (!evt.meta && evt.keyCode >= 65 && evt.keyCode <= 90) {
				return alphabet.charAt(evt.keyCode - 65);
			}
			return null;
		}, _mixin:function (evt) {
			evt.meta = this.meta;
			evt.shift = this.shift;
			evt.alt = this.alt;
			evt.cmmd = this.cmmd;
			evt.letter = this._getLetter(evt);
			return evt;
		}, editMode:function (_isedit) {
			isEdit = _isedit;
		}, enable:function (_enabled) {
			enabled = _enabled;
		}, scanForFields:function () {
			if (this._fieldCons) {
				dojo.forEach(this._fieldCons, dojo.disconnect, dojo);
			}
			this._fieldCons = [];
			dojo.query("input").forEach(function (n) {
				var a = dojo.connect(n, "focus", this, function (evt) {
					this.enable(false);
				});
				var b = dojo.connect(n, "blur", this, function (evt) {
					this.enable(true);
				});
				this._fieldCons.push(a);
				this._fieldCons.push(b);
			}, this);
		}, init:function () {
			setTimeout(dojo.hitch(this, "scanForFields"), 500);
			dojo.connect(document, "blur", this, function (evt) {
				this.meta = this.shift = this.ctrl = this.cmmd = this.alt = false;
			});
			dojo.connect(document, "keydown", this, function (evt) {
				if (!enabled) {
					return;
				}
				if (evt.keyCode == 16) {
					this.shift = true;
				}
				if (evt.keyCode == 17) {
					this.ctrl = true;
				}
				if (evt.keyCode == 18) {
					this.alt = true;
				}
				if (evt.keyCode == 224) {
					this.cmmd = true;
				}
				this.meta = this.shift || this.ctrl || this.cmmd || this.alt;
				if (!isEdit) {
					this.onKeyDown(this._mixin(evt));
					if (evt.keyCode == 8 || evt.keyCode == 46) {
						dojo.stopEvent(evt);
					}
				}
			});
			dojo.connect(document, "keyup", this, function (evt) {
				if (!enabled) {
					return;
				}
				var _stop = false;
				if (evt.keyCode == 16) {
					this.shift = false;
				}
				if (evt.keyCode == 17) {
					this.ctrl = false;
				}
				if (evt.keyCode == 18) {
					this.alt = false;
				}
				if (evt.keyCode == 224) {
					this.cmmd = false;
				}
				this.meta = this.shift || this.ctrl || this.cmmd || this.alt;
				!isEdit && this.onKeyUp(this._mixin(evt));
				if (evt.keyCode == 13) {
					console.warn("KEY ENTER");
					this.onEnter(evt);
					_stop = true;
				}
				if (evt.keyCode == 27) {
					this.onEsc(evt);
					_stop = true;
				}
				if (evt.keyCode == 8 || evt.keyCode == 46) {
					this.onDelete(evt);
					_stop = true;
				}
				if (_stop && !isEdit) {
					dojo.stopEvent(evt);
				}
			});
			dojo.connect(document, "keypress", this, function (evt) {
				if (!enabled) {
					return;
				}
				var inc = this.shift ? this.arrowIncrement * this.arrowShiftIncrement : this.arrowIncrement;
				var x = 0, y = 0;
				if (evt.keyCode == 32 && !isEdit) {
					dojo.stopEvent(evt);
				}
				if (evt.keyCode == 37) {
					x = -inc;
				}
				if (evt.keyCode == 38) {
					y = -inc;
				}
				if (evt.keyCode == 39) {
					x = inc;
				}
				if (evt.keyCode == 40) {
					y = inc;
				}
				if (x || y) {
					evt.x = x;
					evt.y = y;
					evt.shift = this.shift;
					if (!isEdit) {
						this.onArrow(evt);
						dojo.stopEvent(evt);
					}
				}
			});
		}};
		dojo.addOnLoad(dojox.drawing.manager.keys, "init");
	})();
}

