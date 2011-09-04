/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["andes.Combo"]) {
	dojo._hasResource["andes.Combo"] = true;
	dojo.provide("andes.Combo");
	andes.Combo = dojox.drawing.util.oo.declare(function (options) {
		this.master = options.master;
		this.statement = options.statement;
		this.master.combo = this.statement.combo = this;
		this._props = {style:this.master.style, util:this.master.util, parent:this.master.parent, mouse:this.master.mouse};
		dojo.mixin(this, this._props);
		this.id = options.id || this.util.uid(this.type);
		this.linked = [];
		this._cons = [];
		this.master.connectMult([[this.master, "onChangeData", this, function () {
			this.onChangeData(this);
		}], [this.master, "onChangeText", this, function () {
			this.onChangeText(this);
		}]]);
		this.created = options.onCreate ? false : true;
		this._onCreate = options.onCreate;
		var s = this.statement;
		var m = this.master;
		console.warn("combo statement:", this.statement);
		this.statement.connectMult([[this.statement, "onChangeData", this, "textPositionEdit"], [this.statement, "onChangeText", this, "textEdit"], [this.master, "select", this.statement, "highlight"], [this.master, "deselect", this.statement, "unhighlight"], [this.statement, "deselect", this.master, "unhighlight"], [this.statement, "onDelete", this, function () {
			if (!this._masterDestroyed) {
				this._masterDestroyed = true;
				!this._statementDestroyed && this.onDelete(this);
				this.master.destroy();
			}
		}], [this.statement, "select", this, function () {
			this.master.highlight();
			if (this.statement.getText() == "") {
				var text = this.master.getLabel();
				this.statement.setText(text);
			}
		}], [this.master, "onDelete", this, function () {
			if (!this._statementDestroyed) {
				this._statementDestroyed = true;
				!this._masterDestroyed && this.onDelete(this);
				this.statement.destroy();
			}
		}]]);
	}, {type:"andes.Combo", _masterDestroyed:false, _statementDestroyed:false, onChangeData:function (stencil) {
		if (stencil.mod == true) {
			console.log("------------mod, no save to server", stencil.mod);
		}
		console.log("--------------on change combo", stencil.id);
	}, textEdit:function (value) {
		var label = andes.variablename.parse(value);
		var ol = this.master.getLabel();
		if (label) {
			console.log("textEdit:  LABEL=", label, " text=", value);
			this.master.setLabel(label);
			if (value != this.statement.getText()) {
				this.statement.setText(value);
			}
			this.statement.selectOnExec = true;
		} else {
			console.log("textEdit:  NO LABEL, text=", value);
			this.master.setLabel(value);
			this.statement.setText("");
			this.statement.selectOnExec = false;
		}
		if (!this.created) {
			this.created = true;
			this._onCreate();
		} else {
			this.onChangeData(this);
		}
		this.onChangeText(this);
	}, textPositionEdit:function (stencil) {
		if (stencil._prevData && (stencil._prevData.x != stencil.data.x || stencil._prevData.y != stencil.data.y)) {
			this.onChangeData(this);
		}
	}, onChangeText:function (value) {
	}, onDelete:function (value) {
		console.log("combo delete ", value);
	}, getItem:function () {
		return this.statement;
	}, attr:function (a1, a2) {
		if (!a1.text) {
			this.master.attr.call(this.master, a1, a2);
		}
		this.statement.attr.call(this.statement, a1, a2);
	}, connect:function (o, e, s, m, once) {
		var c;
		if (typeof (o) != "object") {
			if (s) {
				m = s;
				s = e;
				e = o;
				o = this;
			} else {
				m = e;
				e = o;
				o = s = this;
			}
		} else {
			if (!m) {
				m = s;
				s = this;
			} else {
				if (once) {
					c = dojo.connect(o, e, function (evt) {
						dojo.hitch(s, m)(evt);
						dojo.disconnect(c);
					});
					this._cons.push(c);
					return c;
				} else {
				}
			}
		}
		c = dojo.connect(o, e, s, m);
		this._cons.push(c);
		return c;
	}, disconnect:function (handles) {
		if (!handles) {
			return;
		}
		if (!dojo.isArray(handles)) {
			handles = [handles];
		}
		dojo.forEach(handles, dojo.disconnect, dojo);
	}});
	andes.buttonCombo = dojox.drawing.util.oo.declare(function (butt, id) {
		this.items = butt;
		this.id = id;
	}, {type:"andes.buttonCombo", onChangeData:function (stencil) {
		if (stencil.mod == true) {
			console.log("------------button mod, no save to server", stencil.mod);
		}
		console.log("--------------on change button combo", stencil.id);
	}, attr:function (a1, a2) {
		dojo.forEach(this.items, function (item) {
			item.master.attr.call(item.master, a1, a2);
			if (item.statement) {
				item.statement.attr.call(item.statement, a1, a2);
			}
		});
	}});
}

