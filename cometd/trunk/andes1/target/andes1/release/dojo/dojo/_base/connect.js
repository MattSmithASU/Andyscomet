/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo._base.connect"]) {
	dojo._hasResource["dojo._base.connect"] = true;
	dojo.provide("dojo._base.connect");
	dojo.require("dojo._base.lang");
	dojo._listener = {getDispatcher:function () {
		return function () {
			var ap = Array.prototype, c = arguments.callee, ls = c._listeners, t = c.target, r = t && t.apply(this, arguments), i, lls = [].concat(ls);
			for (i in lls) {
				if (!(i in ap)) {
					lls[i].apply(this, arguments);
				}
			}
			return r;
		};
	}, add:function (source, method, listener) {
		source = source || dojo.global;
		var f = source[method];
		if (!f || !f._listeners) {
			var d = dojo._listener.getDispatcher();
			d.target = f;
			d._listeners = [];
			f = source[method] = d;
		}
		return f._listeners.push(listener);
	}, remove:function (source, method, handle) {
		var f = (source || dojo.global)[method];
		if (f && f._listeners && handle--) {
			delete f._listeners[handle];
		}
	}};
	dojo.connect = function (obj, event, context, method, dontFix) {
		var a = arguments, args = [], i = 0;
		args.push(dojo.isString(a[0]) ? null : a[i++], a[i++]);
		var a1 = a[i + 1];
		args.push(dojo.isString(a1) || dojo.isFunction(a1) ? a[i++] : null, a[i++]);
		for (var l = a.length; i < l; i++) {
			args.push(a[i]);
		}
		return dojo._connect.apply(this, args);
	};
	dojo._connect = function (obj, event, context, method) {
		var l = dojo._listener, h = l.add(obj, event, dojo.hitch(context, method));
		return [obj, event, h, l];
	};
	dojo.disconnect = function (handle) {
		if (handle && handle[0] !== undefined) {
			dojo._disconnect.apply(this, handle);
			delete handle[0];
		}
	};
	dojo._disconnect = function (obj, event, handle, listener) {
		listener.remove(obj, event, handle);
	};
	dojo._topics = {};
	dojo.subscribe = function (topic, context, method) {
		return [topic, dojo._listener.add(dojo._topics, topic, dojo.hitch(context, method))];
	};
	dojo.unsubscribe = function (handle) {
		if (handle) {
			dojo._listener.remove(dojo._topics, handle[0], handle[1]);
		}
	};
	dojo.publish = function (topic, args) {
		var f = dojo._topics[topic];
		if (f) {
			f.apply(this, args || []);
		}
	};
	dojo.connectPublisher = function (topic, obj, event) {
		var pf = function () {
			dojo.publish(topic, arguments);
		};
		return event ? dojo.connect(obj, event, pf) : dojo.connect(obj, pf);
	};
}

