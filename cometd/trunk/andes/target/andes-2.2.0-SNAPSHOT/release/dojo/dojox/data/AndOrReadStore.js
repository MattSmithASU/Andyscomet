/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.data.AndOrReadStore"]) {
	dojo._hasResource["dojox.data.AndOrReadStore"] = true;
	dojo.provide("dojox.data.AndOrReadStore");
	dojo.require("dojo.data.util.filter");
	dojo.require("dojo.data.util.simpleFetch");
	dojo.require("dojo.date.stamp");
	dojo.declare("dojox.data.AndOrReadStore", null, {constructor:function (keywordParameters) {
		this._arrayOfAllItems = [];
		this._arrayOfTopLevelItems = [];
		this._loadFinished = false;
		this._jsonFileUrl = keywordParameters.url;
		this._ccUrl = keywordParameters.url;
		this.url = keywordParameters.url;
		this._jsonData = keywordParameters.data;
		this.data = null;
		this._datatypeMap = keywordParameters.typeMap || {};
		if (!this._datatypeMap["Date"]) {
			this._datatypeMap["Date"] = {type:Date, deserialize:function (value) {
				return dojo.date.stamp.fromISOString(value);
			}};
		}
		this._features = {"dojo.data.api.Read":true, "dojo.data.api.Identity":true};
		this._itemsByIdentity = null;
		this._storeRefPropName = "_S";
		this._itemNumPropName = "_0";
		this._rootItemPropName = "_RI";
		this._reverseRefMap = "_RRM";
		this._loadInProgress = false;
		this._queuedFetches = [];
		if (keywordParameters.urlPreventCache !== undefined) {
			this.urlPreventCache = keywordParameters.urlPreventCache ? true : false;
		}
		if (keywordParameters.hierarchical !== undefined) {
			this.hierarchical = keywordParameters.hierarchical ? true : false;
		}
		if (keywordParameters.clearOnClose) {
			this.clearOnClose = true;
		}
	}, url:"", _ccUrl:"", data:null, typeMap:null, clearOnClose:false, urlPreventCache:false, hierarchical:true, _assertIsItem:function (item) {
		if (!this.isItem(item)) {
			throw new Error("dojox.data.AndOrReadStore: Invalid item argument.");
		}
	}, _assertIsAttribute:function (attribute) {
		if (typeof attribute !== "string") {
			throw new Error("dojox.data.AndOrReadStore: Invalid attribute argument.");
		}
	}, getValue:function (item, attribute, defaultValue) {
		var values = this.getValues(item, attribute);
		return (values.length > 0) ? values[0] : defaultValue;
	}, getValues:function (item, attribute) {
		this._assertIsItem(item);
		this._assertIsAttribute(attribute);
		var arr = item[attribute] || [];
		return arr.slice(0, arr.length);
	}, getAttributes:function (item) {
		this._assertIsItem(item);
		var attributes = [];
		for (var key in item) {
			if ((key !== this._storeRefPropName) && (key !== this._itemNumPropName) && (key !== this._rootItemPropName) && (key !== this._reverseRefMap)) {
				attributes.push(key);
			}
		}
		return attributes;
	}, hasAttribute:function (item, attribute) {
		this._assertIsItem(item);
		this._assertIsAttribute(attribute);
		return (attribute in item);
	}, containsValue:function (item, attribute, value) {
		var regexp = undefined;
		if (typeof value === "string") {
			regexp = dojo.data.util.filter.patternToRegExp(value, false);
		}
		return this._containsValue(item, attribute, value, regexp);
	}, _containsValue:function (item, attribute, value, regexp) {
		return dojo.some(this.getValues(item, attribute), function (possibleValue) {
			if (possibleValue !== null && !dojo.isObject(possibleValue) && regexp) {
				if (possibleValue.toString().match(regexp)) {
					return true;
				}
			} else {
				if (value === possibleValue) {
					return true;
				}
			}
		});
	}, isItem:function (something) {
		if (something && something[this._storeRefPropName] === this) {
			if (this._arrayOfAllItems[something[this._itemNumPropName]] === something) {
				return true;
			}
		}
		return false;
	}, isItemLoaded:function (something) {
		return this.isItem(something);
	}, loadItem:function (keywordArgs) {
		this._assertIsItem(keywordArgs.item);
	}, getFeatures:function () {
		return this._features;
	}, getLabel:function (item) {
		if (this._labelAttr && this.isItem(item)) {
			return this.getValue(item, this._labelAttr);
		}
		return undefined;
	}, getLabelAttributes:function (item) {
		if (this._labelAttr) {
			return [this._labelAttr];
		}
		return null;
	}, _fetchItems:function (keywordArgs, findCallback, errorCallback) {
		var self = this;
		var filter = function (requestArgs, arrayOfItems) {
			var items = [];
			if (requestArgs.query) {
				var query = dojo.fromJson(dojo.toJson(requestArgs.query));
				if (typeof query == "object") {
					var count = 0;
					var p;
					for (p in query) {
						count++;
					}
					if (count > 1 && query.complexQuery) {
						var cq = query.complexQuery;
						var wrapped = false;
						for (p in query) {
							if (p !== "complexQuery") {
								if (!wrapped) {
									cq = "( " + cq + " )";
									wrapped = true;
								}
								var v = requestArgs.query[p];
								if (dojo.isString(v)) {
									v = "'" + v + "'";
								}
								cq += " AND " + p + ":" + v;
								delete query[p];
							}
						}
						query.complexQuery = cq;
					}
				}
				var ignoreCase = requestArgs.queryOptions ? requestArgs.queryOptions.ignoreCase : false;
				if (typeof query != "string") {
					query = dojo.toJson(query);
					query = query.replace(/\\\\/g, "\\");
				}
				query = query.replace(/\\"/g, "\"");
				var complexQuery = dojo.trim(query.replace(/{|}/g, ""));
				var pos2, i;
				if (complexQuery.match(/"? *complexQuery *"?:/)) {
					complexQuery = dojo.trim(complexQuery.replace(/"?\s*complexQuery\s*"?:/, ""));
					var quotes = ["'", "\""];
					var pos1, colon;
					var flag = false;
					for (i = 0; i < quotes.length; i++) {
						pos1 = complexQuery.indexOf(quotes[i]);
						pos2 = complexQuery.indexOf(quotes[i], 1);
						colon = complexQuery.indexOf(":", 1);
						if (pos1 === 0 && pos2 != -1 && colon < pos2) {
							flag = true;
							break;
						}
					}
					if (flag) {
						complexQuery = complexQuery.replace(/^\"|^\'|\"$|\'$/g, "");
					}
				}
				var complexQuerySave = complexQuery;
				var begRegExp = /^,|^NOT |^AND |^OR |^\(|^\)|^!|^&&|^\|\|/i;
				var sQuery = "";
				var op = "";
				var val = "";
				var pos = -1;
				var err = false;
				var key = "";
				var value = "";
				var tok = "";
				pos2 = -1;
				for (i = 0; i < arrayOfItems.length; ++i) {
					var match = true;
					var candidateItem = arrayOfItems[i];
					if (candidateItem === null) {
						match = false;
					} else {
						complexQuery = complexQuerySave;
						sQuery = "";
						while (complexQuery.length > 0 && !err) {
							op = complexQuery.match(begRegExp);
							while (op && !err) {
								complexQuery = dojo.trim(complexQuery.replace(op[0], ""));
								op = dojo.trim(op[0]).toUpperCase();
								op = op == "NOT" ? "!" : op == "AND" || op == "," ? "&&" : op == "OR" ? "||" : op;
								op = " " + op + " ";
								sQuery += op;
								op = complexQuery.match(begRegExp);
							}
							if (complexQuery.length > 0) {
								pos = complexQuery.indexOf(":");
								if (pos == -1) {
									err = true;
									break;
								} else {
									key = dojo.trim(complexQuery.substring(0, pos).replace(/\"|\'/g, ""));
									complexQuery = dojo.trim(complexQuery.substring(pos + 1));
									tok = complexQuery.match(/^\'|^\"/);
									if (tok) {
										tok = tok[0];
										pos = complexQuery.indexOf(tok);
										pos2 = complexQuery.indexOf(tok, pos + 1);
										if (pos2 == -1) {
											err = true;
											break;
										}
										value = complexQuery.substring(pos + 1, pos2);
										if (pos2 == complexQuery.length - 1) {
											complexQuery = "";
										} else {
											complexQuery = dojo.trim(complexQuery.substring(pos2 + 1));
										}
										sQuery += self._containsValue(candidateItem, key, value, dojo.data.util.filter.patternToRegExp(value, ignoreCase));
									} else {
										tok = complexQuery.match(/\s|\)|,/);
										if (tok) {
											var pos3 = new Array(tok.length);
											for (var j = 0; j < tok.length; j++) {
												pos3[j] = complexQuery.indexOf(tok[j]);
											}
											pos = pos3[0];
											if (pos3.length > 1) {
												for (var j = 1; j < pos3.length; j++) {
													pos = Math.min(pos, pos3[j]);
												}
											}
											value = dojo.trim(complexQuery.substring(0, pos));
											complexQuery = dojo.trim(complexQuery.substring(pos));
										} else {
											value = dojo.trim(complexQuery);
											complexQuery = "";
										}
										sQuery += self._containsValue(candidateItem, key, value, dojo.data.util.filter.patternToRegExp(value, ignoreCase));
									}
								}
							}
						}
						match = eval(sQuery);
					}
					if (match) {
						items.push(candidateItem);
					}
				}
				if (err) {
					items = [];
					console.log("The store's _fetchItems failed, probably due to a syntax error in query.");
				}
				findCallback(items, requestArgs);
			} else {
				for (var i = 0; i < arrayOfItems.length; ++i) {
					var item = arrayOfItems[i];
					if (item !== null) {
						items.push(item);
					}
				}
				findCallback(items, requestArgs);
			}
		};
		if (this._loadFinished) {
			filter(keywordArgs, this._getItemsArray(keywordArgs.queryOptions));
		} else {
			if (this._jsonFileUrl !== this._ccUrl) {
				dojo.deprecated("dojox.data.AndOrReadStore: ", "To change the url, set the url property of the store," + " not _jsonFileUrl.  _jsonFileUrl support will be removed in 2.0");
				this._ccUrl = this._jsonFileUrl;
				this.url = this._jsonFileUrl;
			} else {
				if (this.url !== this._ccUrl) {
					this._jsonFileUrl = this.url;
					this._ccUrl = this.url;
				}
			}
			if (this.data != null && this._jsonData == null) {
				this._jsonData = this.data;
				this.data = null;
			}
			if (this._jsonFileUrl) {
				if (this._loadInProgress) {
					this._queuedFetches.push({args:keywordArgs, filter:filter});
				} else {
					this._loadInProgress = true;
					var getArgs = {url:self._jsonFileUrl, handleAs:"json-comment-optional", preventCache:this.urlPreventCache};
					var getHandler = dojo.xhrGet(getArgs);
					getHandler.addCallback(function (data) {
						try {
							self._getItemsFromLoadedData(data);
							self._loadFinished = true;
							self._loadInProgress = false;
							filter(keywordArgs, self._getItemsArray(keywordArgs.queryOptions));
							self._handleQueuedFetches();
						}
						catch (e) {
							self._loadFinished = true;
							self._loadInProgress = false;
							errorCallback(e, keywordArgs);
						}
					});
					getHandler.addErrback(function (error) {
						self._loadInProgress = false;
						errorCallback(error, keywordArgs);
					});
					var oldAbort = null;
					if (keywordArgs.abort) {
						oldAbort = keywordArgs.abort;
					}
					keywordArgs.abort = function () {
						var df = getHandler;
						if (df && df.fired === -1) {
							df.cancel();
							df = null;
						}
						if (oldAbort) {
							oldAbort.call(keywordArgs);
						}
					};
				}
			} else {
				if (this._jsonData) {
					try {
						this._loadFinished = true;
						this._getItemsFromLoadedData(this._jsonData);
						this._jsonData = null;
						filter(keywordArgs, this._getItemsArray(keywordArgs.queryOptions));
					}
					catch (e) {
						errorCallback(e, keywordArgs);
					}
				} else {
					errorCallback(new Error("dojox.data.AndOrReadStore: No JSON source data was provided as either URL or a nested Javascript object."), keywordArgs);
				}
			}
		}
	}, _handleQueuedFetches:function () {
		if (this._queuedFetches.length > 0) {
			for (var i = 0; i < this._queuedFetches.length; i++) {
				var fData = this._queuedFetches[i];
				var delayedQuery = fData.args;
				var delayedFilter = fData.filter;
				if (delayedFilter) {
					delayedFilter(delayedQuery, this._getItemsArray(delayedQuery.queryOptions));
				} else {
					this.fetchItemByIdentity(delayedQuery);
				}
			}
			this._queuedFetches = [];
		}
	}, _getItemsArray:function (queryOptions) {
		if (queryOptions && queryOptions.deep) {
			return this._arrayOfAllItems;
		}
		return this._arrayOfTopLevelItems;
	}, close:function (request) {
		if (this.clearOnClose && this._loadFinished && !this._loadInProgress) {
			if (((this._jsonFileUrl == "" || this._jsonFileUrl == null) && (this.url == "" || this.url == null)) && this.data == null) {
				console.debug("dojox.data.AndOrReadStore: WARNING!  Data reload " + " information has not been provided." + "  Please set 'url' or 'data' to the appropriate value before" + " the next fetch");
			}
			this._arrayOfAllItems = [];
			this._arrayOfTopLevelItems = [];
			this._loadFinished = false;
			this._itemsByIdentity = null;
			this._loadInProgress = false;
			this._queuedFetches = [];
		}
	}, _getItemsFromLoadedData:function (dataObject) {
		var self = this;
		function valueIsAnItem(aValue) {
			var isItem = ((aValue !== null) && (typeof aValue === "object") && (!dojo.isArray(aValue)) && (!dojo.isFunction(aValue)) && (aValue.constructor == Object) && (typeof aValue._reference === "undefined") && (typeof aValue._type === "undefined") && (typeof aValue._value === "undefined") && self.hierarchical);
			return isItem;
		}
		function addItemAndSubItemsToArrayOfAllItems(anItem) {
			self._arrayOfAllItems.push(anItem);
			for (var attribute in anItem) {
				var valueForAttribute = anItem[attribute];
				if (valueForAttribute) {
					if (dojo.isArray(valueForAttribute)) {
						var valueArray = valueForAttribute;
						for (var k = 0; k < valueArray.length; ++k) {
							var singleValue = valueArray[k];
							if (valueIsAnItem(singleValue)) {
								addItemAndSubItemsToArrayOfAllItems(singleValue);
							}
						}
					} else {
						if (valueIsAnItem(valueForAttribute)) {
							addItemAndSubItemsToArrayOfAllItems(valueForAttribute);
						}
					}
				}
			}
		}
		this._labelAttr = dataObject.label;
		var i;
		var item;
		this._arrayOfAllItems = [];
		this._arrayOfTopLevelItems = dataObject.items;
		for (i = 0; i < this._arrayOfTopLevelItems.length; ++i) {
			item = this._arrayOfTopLevelItems[i];
			addItemAndSubItemsToArrayOfAllItems(item);
			item[this._rootItemPropName] = true;
		}
		var allAttributeNames = {};
		var key;
		for (i = 0; i < this._arrayOfAllItems.length; ++i) {
			item = this._arrayOfAllItems[i];
			for (key in item) {
				if (key !== this._rootItemPropName) {
					var value = item[key];
					if (value !== null) {
						if (!dojo.isArray(value)) {
							item[key] = [value];
						}
					} else {
						item[key] = [null];
					}
				}
				allAttributeNames[key] = key;
			}
		}
		while (allAttributeNames[this._storeRefPropName]) {
			this._storeRefPropName += "_";
		}
		while (allAttributeNames[this._itemNumPropName]) {
			this._itemNumPropName += "_";
		}
		while (allAttributeNames[this._reverseRefMap]) {
			this._reverseRefMap += "_";
		}
		var arrayOfValues;
		var identifier = dataObject.identifier;
		if (identifier) {
			this._itemsByIdentity = {};
			this._features["dojo.data.api.Identity"] = identifier;
			for (i = 0; i < this._arrayOfAllItems.length; ++i) {
				item = this._arrayOfAllItems[i];
				arrayOfValues = item[identifier];
				var identity = arrayOfValues[0];
				if (!this._itemsByIdentity[identity]) {
					this._itemsByIdentity[identity] = item;
				} else {
					if (this._jsonFileUrl) {
						throw new Error("dojox.data.AndOrReadStore:  The json data as specified by: [" + this._jsonFileUrl + "] is malformed.  Items within the list have identifier: [" + identifier + "].  Value collided: [" + identity + "]");
					} else {
						if (this._jsonData) {
							throw new Error("dojox.data.AndOrReadStore:  The json data provided by the creation arguments is malformed.  Items within the list have identifier: [" + identifier + "].  Value collided: [" + identity + "]");
						}
					}
				}
			}
		} else {
			this._features["dojo.data.api.Identity"] = Number;
		}
		for (i = 0; i < this._arrayOfAllItems.length; ++i) {
			item = this._arrayOfAllItems[i];
			item[this._storeRefPropName] = this;
			item[this._itemNumPropName] = i;
		}
		for (i = 0; i < this._arrayOfAllItems.length; ++i) {
			item = this._arrayOfAllItems[i];
			for (key in item) {
				arrayOfValues = item[key];
				for (var j = 0; j < arrayOfValues.length; ++j) {
					value = arrayOfValues[j];
					if (value !== null && typeof value == "object") {
						if (("_type" in value) && ("_value" in value)) {
							var type = value._type;
							var mappingObj = this._datatypeMap[type];
							if (!mappingObj) {
								throw new Error("dojox.data.AndOrReadStore: in the typeMap constructor arg, no object class was specified for the datatype '" + type + "'");
							} else {
								if (dojo.isFunction(mappingObj)) {
									arrayOfValues[j] = new mappingObj(value._value);
								} else {
									if (dojo.isFunction(mappingObj.deserialize)) {
										arrayOfValues[j] = mappingObj.deserialize(value._value);
									} else {
										throw new Error("dojox.data.AndOrReadStore: Value provided in typeMap was neither a constructor, nor a an object with a deserialize function");
									}
								}
							}
						}
						if (value._reference) {
							var referenceDescription = value._reference;
							if (!dojo.isObject(referenceDescription)) {
								arrayOfValues[j] = this._getItemByIdentity(referenceDescription);
							} else {
								for (var k = 0; k < this._arrayOfAllItems.length; ++k) {
									var candidateItem = this._arrayOfAllItems[k];
									var found = true;
									for (var refKey in referenceDescription) {
										if (candidateItem[refKey] != referenceDescription[refKey]) {
											found = false;
										}
									}
									if (found) {
										arrayOfValues[j] = candidateItem;
									}
								}
							}
							if (this.referenceIntegrity) {
								var refItem = arrayOfValues[j];
								if (this.isItem(refItem)) {
									this._addReferenceToMap(refItem, item, key);
								}
							}
						} else {
							if (this.isItem(value)) {
								if (this.referenceIntegrity) {
									this._addReferenceToMap(value, item, key);
								}
							}
						}
					}
				}
			}
		}
	}, _addReferenceToMap:function (refItem, parentItem, attribute) {
	}, getIdentity:function (item) {
		var identifier = this._features["dojo.data.api.Identity"];
		if (identifier === Number) {
			return item[this._itemNumPropName];
		} else {
			var arrayOfValues = item[identifier];
			if (arrayOfValues) {
				return arrayOfValues[0];
			}
		}
		return null;
	}, fetchItemByIdentity:function (keywordArgs) {
		if (!this._loadFinished) {
			var self = this;
			if (this._jsonFileUrl !== this._ccUrl) {
				dojo.deprecated("dojox.data.AndOrReadStore: ", "To change the url, set the url property of the store," + " not _jsonFileUrl.  _jsonFileUrl support will be removed in 2.0");
				this._ccUrl = this._jsonFileUrl;
				this.url = this._jsonFileUrl;
			} else {
				if (this.url !== this._ccUrl) {
					this._jsonFileUrl = this.url;
					this._ccUrl = this.url;
				}
			}
			if (this.data != null && this._jsonData == null) {
				this._jsonData = this.data;
				this.data = null;
			}
			if (this._jsonFileUrl) {
				if (this._loadInProgress) {
					this._queuedFetches.push({args:keywordArgs});
				} else {
					this._loadInProgress = true;
					var getArgs = {url:self._jsonFileUrl, handleAs:"json-comment-optional", preventCache:this.urlPreventCache};
					var getHandler = dojo.xhrGet(getArgs);
					getHandler.addCallback(function (data) {
						var scope = keywordArgs.scope ? keywordArgs.scope : dojo.global;
						try {
							self._getItemsFromLoadedData(data);
							self._loadFinished = true;
							self._loadInProgress = false;
							var item = self._getItemByIdentity(keywordArgs.identity);
							if (keywordArgs.onItem) {
								keywordArgs.onItem.call(scope, item);
							}
							self._handleQueuedFetches();
						}
						catch (error) {
							self._loadInProgress = false;
							if (keywordArgs.onError) {
								keywordArgs.onError.call(scope, error);
							}
						}
					});
					getHandler.addErrback(function (error) {
						self._loadInProgress = false;
						if (keywordArgs.onError) {
							var scope = keywordArgs.scope ? keywordArgs.scope : dojo.global;
							keywordArgs.onError.call(scope, error);
						}
					});
				}
			} else {
				if (this._jsonData) {
					self._getItemsFromLoadedData(self._jsonData);
					self._jsonData = null;
					self._loadFinished = true;
					var item = self._getItemByIdentity(keywordArgs.identity);
					if (keywordArgs.onItem) {
						var scope = keywordArgs.scope ? keywordArgs.scope : dojo.global;
						keywordArgs.onItem.call(scope, item);
					}
				}
			}
		} else {
			var item = this._getItemByIdentity(keywordArgs.identity);
			if (keywordArgs.onItem) {
				var scope = keywordArgs.scope ? keywordArgs.scope : dojo.global;
				keywordArgs.onItem.call(scope, item);
			}
		}
	}, _getItemByIdentity:function (identity) {
		var item = null;
		if (this._itemsByIdentity) {
			item = this._itemsByIdentity[identity];
		} else {
			item = this._arrayOfAllItems[identity];
		}
		if (item === undefined) {
			item = null;
		}
		return item;
	}, getIdentityAttributes:function (item) {
		var identifier = this._features["dojo.data.api.Identity"];
		if (identifier === Number) {
			return null;
		} else {
			return [identifier];
		}
	}, _forceLoad:function () {
		var self = this;
		if (this._jsonFileUrl !== this._ccUrl) {
			dojo.deprecated("dojox.data.AndOrReadStore: ", "To change the url, set the url property of the store," + " not _jsonFileUrl.  _jsonFileUrl support will be removed in 2.0");
			this._ccUrl = this._jsonFileUrl;
			this.url = this._jsonFileUrl;
		} else {
			if (this.url !== this._ccUrl) {
				this._jsonFileUrl = this.url;
				this._ccUrl = this.url;
			}
		}
		if (this.data != null && this._jsonData == null) {
			this._jsonData = this.data;
			this.data = null;
		}
		if (this._jsonFileUrl) {
			var getArgs = {url:self._jsonFileUrl, handleAs:"json-comment-optional", preventCache:this.urlPreventCache, sync:true};
			var getHandler = dojo.xhrGet(getArgs);
			getHandler.addCallback(function (data) {
				try {
					if (self._loadInProgress !== true && !self._loadFinished) {
						self._getItemsFromLoadedData(data);
						self._loadFinished = true;
					} else {
						if (self._loadInProgress) {
							throw new Error("dojox.data.AndOrReadStore:  Unable to perform a synchronous load, an async load is in progress.");
						}
					}
				}
				catch (e) {
					console.log(e);
					throw e;
				}
			});
			getHandler.addErrback(function (error) {
				throw error;
			});
		} else {
			if (this._jsonData) {
				self._getItemsFromLoadedData(self._jsonData);
				self._jsonData = null;
				self._loadFinished = true;
			}
		}
	}});
	dojo.extend(dojox.data.AndOrReadStore, dojo.data.util.simpleFetch);
}

