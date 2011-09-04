/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.atom.io.Connection"]) {
	dojo._hasResource["dojox.atom.io.Connection"] = true;
	dojo.provide("dojox.atom.io.Connection");
	dojo.require("dojox.atom.io.model");
	dojo.declare("dojox.atom.io.Connection", null, {constructor:function (sync, preventCache) {
		this.sync = sync;
		this.preventCache = preventCache;
	}, preventCache:false, alertsEnabled:false, getFeed:function (url, callback, errorCallback, scope) {
		this._getXmlDoc(url, "feed", new dojox.atom.io.model.Feed(), dojox.atom.io.model._Constants.ATOM_NS, callback, errorCallback, scope);
	}, getService:function (url, callback, errorCallback, scope) {
		this._getXmlDoc(url, "service", new dojox.atom.io.model.Service(url), dojox.atom.io.model._Constants.APP_NS, callback, errorCallback, scope);
	}, getEntry:function (url, callback, errorCallback, scope) {
		this._getXmlDoc(url, "entry", new dojox.atom.io.model.Entry(), dojox.atom.io.model._Constants.ATOM_NS, callback, errorCallback, scope);
	}, _getXmlDoc:function (url, nodeName, newNode, namespace, callback, errorCallback, scope) {
		if (!scope) {
			scope = dojo.global;
		}
		var ae = this.alertsEnabled;
		var xhrArgs = {url:url, handleAs:"xml", sync:this.sync, preventCache:this.preventCache, load:function (data, args) {
			var node = null;
			var evaldObj = data;
			var nodes;
			if (evaldObj) {
				if (typeof (evaldObj.getElementsByTagNameNS) != "undefined") {
					nodes = evaldObj.getElementsByTagNameNS(namespace, nodeName);
					if (nodes && nodes.length > 0) {
						node = nodes.item(0);
					} else {
						if (evaldObj.lastChild) {
							node = evaldObj.lastChild;
						}
					}
				} else {
					if (typeof (evaldObj.getElementsByTagName) != "undefined") {
						nodes = evaldObj.getElementsByTagName(nodeName);
						if (nodes && nodes.length > 0) {
							for (var i = 0; i < nodes.length; i++) {
								if (nodes[i].namespaceURI == namespace) {
									node = nodes[i];
									break;
								}
							}
						} else {
							if (evaldObj.lastChild) {
								node = evaldObj.lastChild;
							}
						}
					} else {
						if (evaldObj.lastChild) {
							node = evaldObj.lastChild;
						} else {
							callback.call(scope, null, null, args);
							return;
						}
					}
				}
				newNode.buildFromDom(node);
				if (callback) {
					callback.call(scope, newNode, evaldObj, args);
				} else {
					if (ae) {
						throw new Error("The callback value does not exist.");
					}
				}
			} else {
				callback.call(scope, null, null, args);
			}
		}};
		if (this.user && this.user !== null) {
			xhrArgs.user = this.user;
		}
		if (this.password && this.password !== null) {
			xhrArgs.password = this.password;
		}
		if (errorCallback) {
			xhrArgs.error = function (error, args) {
				errorCallback.call(scope, error, args);
			};
		} else {
			xhrArgs.error = function () {
				throw new Error("The URL requested cannot be accessed");
			};
		}
		dojo.xhrGet(xhrArgs);
	}, updateEntry:function (entry, callback, errorCallback, retrieveUpdated, xmethod, scope) {
		if (!scope) {
			scope = dojo.global;
		}
		entry.updated = new Date();
		var url = entry.getEditHref();
		if (!url) {
			throw new Error("A URL has not been specified for editing this entry.");
		}
		var self = this;
		var ae = this.alertsEnabled;
		var xhrArgs = {url:url, handleAs:"text", contentType:"text/xml", sync:this.sync, preventCache:this.preventCache, load:function (data, args) {
			var location = null;
			if (retrieveUpdated) {
				location = args.xhr.getResponseHeader("Location");
				if (!location) {
					location = url;
				}
				var handleRetrieve = function (entry, dom, args) {
					if (callback) {
						callback.call(scope, entry, location, args);
					} else {
						if (ae) {
							throw new Error("The callback value does not exist.");
						}
					}
				};
				self.getEntry(location, handleRetrieve);
			} else {
				if (callback) {
					callback.call(scope, entry, args.xhr.getResponseHeader("Location"), args);
				} else {
					if (ae) {
						throw new Error("The callback value does not exist.");
					}
				}
			}
			return data;
		}};
		if (this.user && this.user !== null) {
			xhrArgs.user = this.user;
		}
		if (this.password && this.password !== null) {
			xhrArgs.password = this.password;
		}
		if (errorCallback) {
			xhrArgs.error = function (error, args) {
				errorCallback.call(scope, error, args);
			};
		} else {
			xhrArgs.error = function () {
				throw new Error("The URL requested cannot be accessed");
			};
		}
		if (xmethod) {
			xhrArgs.postData = entry.toString(true);
			xhrArgs.headers = {"X-Method-Override":"PUT"};
			dojo.rawXhrPost(xhrArgs);
		} else {
			xhrArgs.putData = entry.toString(true);
			var xhr = dojo.rawXhrPut(xhrArgs);
		}
	}, addEntry:function (entry, url, callback, errorCallback, retrieveEntry, scope) {
		if (!scope) {
			scope = dojo.global;
		}
		entry.published = new Date();
		entry.updated = new Date();
		var feedUrl = entry.feedUrl;
		var ae = this.alertsEnabled;
		if (!url && feedUrl) {
			url = feedUrl;
		}
		if (!url) {
			if (ae) {
				throw new Error("The request cannot be processed because the URL parameter is missing.");
			}
			return;
		}
		var self = this;
		var xhrArgs = {url:url, handleAs:"text", contentType:"text/xml", sync:this.sync, preventCache:this.preventCache, postData:entry.toString(true), load:function (data, args) {
			var location = args.xhr.getResponseHeader("Location");
			if (!location) {
				location = url;
			}
			if (!args.retrieveEntry) {
				if (callback) {
					callback.call(scope, entry, location, args);
				} else {
					if (ae) {
						throw new Error("The callback value does not exist.");
					}
				}
			} else {
				var handleRetrieve = function (entry, dom, args) {
					if (callback) {
						callback.call(scope, entry, location, args);
					} else {
						if (ae) {
							throw new Error("The callback value does not exist.");
						}
					}
				};
				self.getEntry(location, handleRetrieve);
			}
			return data;
		}};
		if (this.user && this.user !== null) {
			xhrArgs.user = this.user;
		}
		if (this.password && this.password !== null) {
			xhrArgs.password = this.password;
		}
		if (errorCallback) {
			xhrArgs.error = function (error, args) {
				errorCallback.call(scope, error, args);
			};
		} else {
			xhrArgs.error = function () {
				throw new Error("The URL requested cannot be accessed");
			};
		}
		dojo.rawXhrPost(xhrArgs);
	}, deleteEntry:function (entry, callback, errorCallback, xmethod, scope) {
		if (!scope) {
			scope = dojo.global;
		}
		var url = null;
		if (typeof (entry) == "string") {
			url = entry;
		} else {
			url = entry.getEditHref();
		}
		if (!url) {
			callback.call(scope, false, null);
			throw new Error("The request cannot be processed because the URL parameter is missing.");
		}
		var xhrArgs = {url:url, handleAs:"text", sync:this.sync, preventCache:this.preventCache, load:function (data, args) {
			callback.call(scope, args);
			return data;
		}};
		if (this.user && this.user !== null) {
			xhrArgs.user = this.user;
		}
		if (this.password && this.password !== null) {
			xhrArgs.password = this.password;
		}
		if (errorCallback) {
			xhrArgs.error = function (error, args) {
				errorCallback.call(scope, error, args);
			};
		} else {
			xhrArgs.error = function () {
				throw new Error("The URL requested cannot be accessed");
			};
		}
		if (xmethod) {
			xhrArgs.headers = {"X-Method-Override":"DELETE"};
			dojo.xhrPost(xhrArgs);
		} else {
			dojo.xhrDelete(xhrArgs);
		}
	}});
}

