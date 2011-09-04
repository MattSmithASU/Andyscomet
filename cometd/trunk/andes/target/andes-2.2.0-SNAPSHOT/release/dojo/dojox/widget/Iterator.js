/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.widget.Iterator"]) {
	dojo._hasResource["dojox.widget.Iterator"] = true;
	dojo.provide("dojox.widget.Iterator");
	dojo.require("dijit.Declaration");
	dojo.experimental("dojox.widget.Iterator");
	dojo.declare("dojox.widget.Iterator", [dijit.Declaration], {constructor:(function () {
		var ctr = 0;
		return function () {
			this.attrs = [];
			this.children = [];
			this.widgetClass = "dojox.widget.Iterator._classes._" + (ctr++);
		};
	})(), start:0, fetchMax:1000, query:{name:"*"}, attrs:[], defaultValue:"", widgetCtor:null, dataValues:[], data:null, store:null, _srcIndex:0, _srcParent:null, _setSrcIndex:function (s) {
		this._srcIndex = 0;
		this._srcParent = s.parentNode;
		var ts = s;
		while (ts.previousSibling) {
			this._srcIndex++;
			ts = ts.previousSibling;
		}
	}, postscript:function (p, s) {
		this._setSrcIndex(s);
		this.inherited("postscript", arguments);
		var wc = this.widgetCtor = dojo.getObject(this.widgetClass);
		this.attrs = dojo.map(wc.prototype.templateString.match(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g), function (s) {
			return s.slice(2, -1);
		});
		dojo.forEach(this.attrs, function (m) {
			wc.prototype[m] = "";
		});
		this.update();
	}, clear:function () {
		if (this.children.length) {
			this._setSrcIndex(this.children[0].domNode);
		}
		dojo.forEach(this.children, "item.destroy();");
		this.children = [];
	}, update:function () {
		if (this.store) {
			this.fetch();
		} else {
			this.onDataAvailable(this.data || this.dataValues);
		}
	}, _addItem:function (config, idx) {
		if (dojo.isString(config)) {
			config = {value:config};
		}
		var widget = new this.widgetCtor(config);
		this.children.push(widget);
		dojo.place(widget.domNode, this._srcParent, this._srcIndex + idx);
	}, getAttrValuesObj:function (item) {
		var obj = {};
		if (dojo.isString(item)) {
			dojo.forEach(this.attrs, function (attr) {
				obj[attr] = (attr == "value") ? item : this.defaultValue;
			}, this);
		} else {
			dojo.forEach(this.attrs, function (attr) {
				if (this.store) {
					obj[attr] = this.store.getValue(item, attr) || this.defaultValue;
				} else {
					obj[attr] = item[attr] || this.defaultValue;
				}
			}, this);
		}
		return obj;
	}, onDataAvailable:function (data) {
		this.clear();
		dojo.forEach(data, function (item, idx) {
			this._addItem(this.getAttrValuesObj(item), idx);
		}, this);
	}, fetch:function (query, start, end) {
		this.store.fetch({query:query || this.query, start:start || this.start, count:end || this.fetchMax, onComplete:dojo.hitch(this, "onDataAvailable")});
	}});
	dojox.widget.Iterator._classes = {};
}
