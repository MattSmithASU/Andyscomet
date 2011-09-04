/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.widget.Rotator"]) {
	dojo._hasResource["dojox.widget.Rotator"] = true;
	dojo.provide("dojox.widget.Rotator");
	dojo.require("dojo.parser");
	(function (d) {
		var _defaultTransition = "dojox.widget.rotator.swap", _defaultTransitionDuration = 500, _displayStr = "display", _noneStr = "none", _zIndex = "zIndex";
		d.declare("dojox.widget.Rotator", null, {transition:_defaultTransition, transitionParams:"duration:" + _defaultTransitionDuration, panes:null, constructor:function (params, node) {
			d.mixin(this, params);
			var _t = this, t = _t.transition, tt = _t._transitions = {}, idm = _t._idMap = {}, tp = _t.transitionParams = eval("({ " + _t.transitionParams + " })"), node = _t._domNode = dojo.byId(node), cb = _t._domNodeContentBox = d.contentBox(node), p = {left:0, top:0}, warn = function (bt, dt) {
				console.warn(_t.declaredClass, " - Unable to find transition \"", bt, "\", defaulting to \"", dt, "\".");
			};
			_t.id = node.id || (new Date()).getTime();
			if (d.style(node, "position") == "static") {
				d.style(node, "position", "relative");
			}
			tt[t] = d.getObject(t);
			if (!tt[t]) {
				warn(t, _defaultTransition);
				tt[_t.transition = _defaultTransition] = d.getObject(_defaultTransition);
			}
			if (!tp.duration) {
				tp.duration = _defaultTransitionDuration;
			}
			d.forEach(_t.panes, function (p) {
				d.create("div", p, node);
			});
			var pp = _t.panes = [];
			d.query(">", node).forEach(function (n, i) {
				var q = {node:n, idx:i, params:d.mixin({}, tp, eval("({ " + (d.attr(n, "transitionParams") || "") + " })"))}, r = q.trans = d.attr(n, "transition") || _t.transition;
				d.forEach(["id", "title", "duration", "waitForEvent"], function (a) {
					q[a] = d.attr(n, a);
				});
				if (q.id) {
					idm[q.id] = i;
				}
				if (!tt[r] && !(tt[r] = d.getObject(r))) {
					warn(r, q.trans = _t.transition);
				}
				p.position = "absolute";
				p.display = _noneStr;
				if (_t.idx == null || d.attr(n, "selected")) {
					if (_t.idx != null) {
						d.style(pp[_t.idx].node, _displayStr, _noneStr);
					}
					_t.idx = i;
					p.display = "";
				}
				d.style(n, p);
				d.query("> script[type^='dojo/method']", n).orphan().forEach(function (s) {
					var e = d.attr(s, "event");
					if (e) {
						q[e] = d.parser._functionFromScript(s);
					}
				});
				pp.push(q);
			});
			_t._controlSub = d.subscribe(_t.id + "/rotator/control", _t, "control");
		}, destroy:function () {
			d.forEach([this._controlSub, this.wfe], d.unsubscribe);
			d.destroy(this._domNode);
		}, next:function () {
			return this.go(this.idx + 1);
		}, prev:function () {
			return this.go(this.idx - 1);
		}, go:function (p) {
			var _t = this, i = _t.idx, pp = _t.panes, len = pp.length, idm = _t._idMap[p];
			_t._resetWaitForEvent();
			p = idm != null ? idm : (p || 0);
			p = p < len ? (p < 0 ? len - 1 : p) : 0;
			if (p == i || _t.anim) {
				return null;
			}
			var current = pp[i], next = pp[p];
			d.style(current.node, _zIndex, 2);
			d.style(next.node, _zIndex, 1);
			var info = {current:current, next:next, rotator:_t}, anim = _t.anim = _t._transitions[next.trans](d.mixin({rotatorBox:_t._domNodeContentBox}, info, next.params));
			if (anim) {
				var def = new d.Deferred(), ev = next.waitForEvent, h = d.connect(anim, "onEnd", function () {
					d.style(current.node, {display:_noneStr, left:0, opacity:1, top:0, zIndex:0});
					d.disconnect(h);
					_t.anim = null;
					_t.idx = p;
					if (current.onAfterOut) {
						current.onAfterOut(info);
					}
					if (next.onAfterIn) {
						next.onAfterIn(info);
					}
					_t.onUpdate("onAfterTransition");
					if (!ev) {
						_t._resetWaitForEvent();
						def.callback();
					}
				});
				_t.wfe = ev ? d.subscribe(ev, function () {
					_t._resetWaitForEvent();
					def.callback(true);
				}) : null;
				_t.onUpdate("onBeforeTransition");
				if (current.onBeforeOut) {
					current.onBeforeOut(info);
				}
				if (next.onBeforeIn) {
					next.onBeforeIn(info);
				}
				anim.play();
				return def;
			}
		}, onUpdate:function (type, params) {
			d.publish(this.id + "/rotator/update", [type, this, params || {}]);
		}, _resetWaitForEvent:function () {
			if (this.wfe) {
				d.unsubscribe(this.wfe);
				this.wfe = null;
			}
		}, control:function (action) {
			var args = d._toArray(arguments), _t = this;
			args.shift();
			_t._resetWaitForEvent();
			if (_t[action]) {
				var def = _t[action].apply(_t, args);
				if (def) {
					def.addCallback(function () {
						_t.onUpdate(action);
					});
				}
				_t.onManualChange(action);
			} else {
				console.warn(_t.declaredClass, " - Unsupported action \"", action, "\".");
			}
		}, resize:function (width, height) {
			var b = this._domNodeContentBox = {w:width, h:height};
			d.contentBox(this._domNode, b);
			d.forEach(this.panes, function (p) {
				d.contentBox(p.node, b);
			});
		}, onManualChange:function () {
		}});
		d.setObject(_defaultTransition, function (args) {
			return new d._Animation({play:function () {
				d.style(args.current.node, _displayStr, _noneStr);
				d.style(args.next.node, _displayStr, "");
				this._fire("onEnd");
			}});
		});
	})(dojo);
}

