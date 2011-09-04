/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.layout.ContentPane"]) {
	dojo._hasResource["dijit.layout.ContentPane"] = true;
	dojo.provide("dijit.layout.ContentPane");
	dojo.require("dijit._Widget");
	dojo.require("dijit.layout._ContentPaneResizeMixin");
	dojo.require("dojo.string");
	dojo.require("dojo.html");
	dojo.requireLocalization("dijit", "loading", null, "ROOT,ar,az,ca,cs,da,de,el,es,fi,fr,he,hu,it,ja,kk,ko,nb,nl,pl,pt,pt-pt,ro,ru,sk,sl,sv,th,tr,zh,zh-tw");
	dojo.declare("dijit.layout.ContentPane", [dijit._Widget, dijit.layout._ContentPaneResizeMixin], {href:"", content:"", extractContent:false, parseOnLoad:true, parserScope:dojo._scopeName, preventCache:false, preload:false, refreshOnShow:false, loadingMessage:"<span class='dijitContentPaneLoading'><span class='dijitInline dijitIconLoading'></span>${loadingState}</span>", errorMessage:"<span class='dijitContentPaneError'><span class='dijitInline dijitIconError'></span>${errorState}</span>", isLoaded:false, baseClass:"dijitContentPane", ioArgs:{}, onLoadDeferred:null, _setTitleAttr:null, stopParser:true, template:false, create:function (params, srcNodeRef) {
		if ((!params || !params.template) && srcNodeRef && !("href" in params) && !("content" in params)) {
			var df = dojo.doc.createDocumentFragment();
			srcNodeRef = dojo.byId(srcNodeRef);
			while (srcNodeRef.firstChild) {
				df.appendChild(srcNodeRef.firstChild);
			}
			params = dojo.delegate(params, {content:df});
		}
		this.inherited(arguments, [params, srcNodeRef]);
	}, postMixInProperties:function () {
		this.inherited(arguments);
		var messages = dojo.i18n.getLocalization("dijit", "loading", this.lang);
		this.loadingMessage = dojo.string.substitute(this.loadingMessage, messages);
		this.errorMessage = dojo.string.substitute(this.errorMessage, messages);
	}, buildRendering:function () {
		this.inherited(arguments);
		if (!this.containerNode) {
			this.containerNode = this.domNode;
		}
		this.domNode.title = "";
		if (!dojo.attr(this.domNode, "role")) {
			dijit.setWaiRole(this.domNode, "group");
		}
	}, _startChildren:function () {
		this.inherited(arguments);
		if (this._contentSetter) {
			dojo.forEach(this._contentSetter.parseResults, function (obj) {
				if (!obj._started && !obj._destroyed && dojo.isFunction(obj.startup)) {
					obj.startup();
					obj._started = true;
				}
			}, this);
		}
	}, setHref:function (href) {
		dojo.deprecated("dijit.layout.ContentPane.setHref() is deprecated. Use set('href', ...) instead.", "", "2.0");
		return this.set("href", href);
	}, _setHrefAttr:function (href) {
		this.cancel();
		this.onLoadDeferred = new dojo.Deferred(dojo.hitch(this, "cancel"));
		this.onLoadDeferred.addCallback(dojo.hitch(this, "onLoad"));
		this._set("href", href);
		if (this.preload || (this._created && this._isShown())) {
			this._load();
		} else {
			this._hrefChanged = true;
		}
		return this.onLoadDeferred;
	}, setContent:function (data) {
		dojo.deprecated("dijit.layout.ContentPane.setContent() is deprecated.  Use set('content', ...) instead.", "", "2.0");
		this.set("content", data);
	}, _setContentAttr:function (data) {
		this._set("href", "");
		this.cancel();
		this.onLoadDeferred = new dojo.Deferred(dojo.hitch(this, "cancel"));
		if (this._created) {
			this.onLoadDeferred.addCallback(dojo.hitch(this, "onLoad"));
		}
		this._setContent(data || "");
		this._isDownloaded = false;
		return this.onLoadDeferred;
	}, _getContentAttr:function () {
		return this.containerNode.innerHTML;
	}, cancel:function () {
		if (this._xhrDfd && (this._xhrDfd.fired == -1)) {
			this._xhrDfd.cancel();
		}
		delete this._xhrDfd;
		this.onLoadDeferred = null;
	}, uninitialize:function () {
		if (this._beingDestroyed) {
			this.cancel();
		}
		this.inherited(arguments);
	}, destroyRecursive:function (preserveDom) {
		if (this._beingDestroyed) {
			return;
		}
		this.inherited(arguments);
	}, _onShow:function () {
		this.inherited(arguments);
		if (this.href) {
			if (!this._xhrDfd && (!this.isLoaded || this._hrefChanged || this.refreshOnShow)) {
				return this.refresh();
			}
		}
	}, refresh:function () {
		this.cancel();
		this.onLoadDeferred = new dojo.Deferred(dojo.hitch(this, "cancel"));
		this.onLoadDeferred.addCallback(dojo.hitch(this, "onLoad"));
		this._load();
		return this.onLoadDeferred;
	}, _load:function () {
		this._setContent(this.onDownloadStart(), true);
		var self = this;
		var getArgs = {preventCache:(this.preventCache || this.refreshOnShow), url:this.href, handleAs:"text"};
		if (dojo.isObject(this.ioArgs)) {
			dojo.mixin(getArgs, this.ioArgs);
		}
		var hand = (this._xhrDfd = (this.ioMethod || dojo.xhrGet)(getArgs));
		hand.addCallback(function (html) {
			try {
				self._isDownloaded = true;
				self._setContent(html, false);
				self.onDownloadEnd();
			}
			catch (err) {
				self._onError("Content", err);
			}
			delete self._xhrDfd;
			return html;
		});
		hand.addErrback(function (err) {
			if (!hand.canceled) {
				self._onError("Download", err);
			}
			delete self._xhrDfd;
			return err;
		});
		delete this._hrefChanged;
	}, _onLoadHandler:function (data) {
		this._set("isLoaded", true);
		try {
			this.onLoadDeferred.callback(data);
		}
		catch (e) {
			console.error("Error " + this.widgetId + " running custom onLoad code: " + e.message);
		}
	}, _onUnloadHandler:function () {
		this._set("isLoaded", false);
		try {
			this.onUnload();
		}
		catch (e) {
			console.error("Error " + this.widgetId + " running custom onUnload code: " + e.message);
		}
	}, destroyDescendants:function () {
		if (this.isLoaded) {
			this._onUnloadHandler();
		}
		var setter = this._contentSetter;
		dojo.forEach(this.getChildren(), function (widget) {
			if (widget.destroyRecursive) {
				widget.destroyRecursive();
			}
		});
		if (setter) {
			dojo.forEach(setter.parseResults, function (widget) {
				if (widget.destroyRecursive && widget.domNode && widget.domNode.parentNode == dojo.body()) {
					widget.destroyRecursive();
				}
			});
			delete setter.parseResults;
		}
		dojo.html._emptyNode(this.containerNode);
		delete this._singleChild;
	}, _setContent:function (cont, isFakeContent) {
		this.destroyDescendants();
		var setter = this._contentSetter;
		if (!(setter && setter instanceof dojo.html._ContentSetter)) {
			setter = this._contentSetter = new dojo.html._ContentSetter({node:this.containerNode, _onError:dojo.hitch(this, this._onError), onContentError:dojo.hitch(this, function (e) {
				var errMess = this.onContentError(e);
				try {
					this.containerNode.innerHTML = errMess;
				}
				catch (e) {
					console.error("Fatal " + this.id + " could not change content due to " + e.message, e);
				}
			})});
		}
		var setterParams = dojo.mixin({cleanContent:this.cleanContent, extractContent:this.extractContent, parseContent:!cont.domNode && this.parseOnLoad, parserScope:this.parserScope, startup:false, dir:this.dir, lang:this.lang, textDir:this.textDir}, this._contentSetterParams || {});
		setter.set((dojo.isObject(cont) && cont.domNode) ? cont.domNode : cont, setterParams);
		delete this._contentSetterParams;
		if (this.doLayout) {
			this._checkIfSingleChild();
		}
		if (!isFakeContent) {
			if (this._started) {
				this._startChildren();
				this._scheduleLayout();
			}
			this._onLoadHandler(cont);
		}
	}, _onError:function (type, err, consoleText) {
		this.onLoadDeferred.errback(err);
		var errText = this["on" + type + "Error"].call(this, err);
		if (consoleText) {
			console.error(consoleText, err);
		} else {
			if (errText) {
				this._setContent(errText, true);
			}
		}
	}, onLoad:function (data) {
	}, onUnload:function () {
	}, onDownloadStart:function () {
		return this.loadingMessage;
	}, onContentError:function (error) {
	}, onDownloadError:function (error) {
		return this.errorMessage;
	}, onDownloadEnd:function () {
	}});
}

