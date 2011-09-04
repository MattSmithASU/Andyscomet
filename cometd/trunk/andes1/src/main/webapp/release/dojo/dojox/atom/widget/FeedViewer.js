/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.atom.widget.FeedViewer"]) {
	dojo._hasResource["dojox.atom.widget.FeedViewer"] = true;
	dojo.provide("dojox.atom.widget.FeedViewer");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.require("dijit._Container");
	dojo.require("dojox.atom.io.Connection");
	dojo.requireLocalization("dojox.atom.widget", "FeedViewerEntry", null, "ROOT,ar,az,ca,cs,da,de,el,es,fi,fr,he,hu,it,ja,kk,ko,nb,nl,pl,pt,pt-pt,ro,ru,sk,sl,sv,th,tr,zh,zh-tw");
	dojo.experimental("dojox.atom.widget.FeedViewer");
	dojo.declare("dojox.atom.widget.FeedViewer", [dijit._Widget, dijit._Templated, dijit._Container], {feedViewerTableBody:null, feedViewerTable:null, entrySelectionTopic:"", url:"", xmethod:false, localSaveOnly:false, templateString:dojo.cache("dojox.atom", "widget/templates/FeedViewer.html", "<div class=\"feedViewerContainer\" dojoAttachPoint=\"feedViewerContainerNode\">\n\t<table cellspacing=\"0\" cellpadding=\"0\" class=\"feedViewerTable\">\n\t\t<tbody dojoAttachPoint=\"feedViewerTableBody\" class=\"feedViewerTableBody\">\n\t\t</tbody>\n\t</table>\n</div>\n"), _feed:null, _currentSelection:null, _includeFilters:null, alertsEnabled:false, postCreate:function () {
		this._includeFilters = [];
		if (this.entrySelectionTopic !== "") {
			this._subscriptions = [dojo.subscribe(this.entrySelectionTopic, this, "_handleEvent")];
		}
		this.atomIO = new dojox.atom.io.Connection();
		this.childWidgets = [];
	}, startup:function () {
		this.containerNode = this.feedViewerTableBody;
		var children = this.getDescendants();
		for (var i in children) {
			var child = children[i];
			if (child && child.isFilter) {
				this._includeFilters.push(new dojox.atom.widget.FeedViewer.CategoryIncludeFilter(child.scheme, child.term, child.label));
				child.destroy();
			}
		}
		if (this.url !== "") {
			this.setFeedFromUrl(this.url);
		}
	}, clear:function () {
		this.destroyDescendants();
	}, setFeedFromUrl:function (url) {
		if (url !== "") {
			if (this._isRelativeURL(url)) {
				var baseUrl = "";
				if (url.charAt(0) !== "/") {
					baseUrl = this._calculateBaseURL(window.location.href, true);
				} else {
					baseUrl = this._calculateBaseURL(window.location.href, false);
				}
				this.url = baseUrl + url;
			}
			this.atomIO.getFeed(url, dojo.hitch(this, this.setFeed));
		}
	}, setFeed:function (feed) {
		this._feed = feed;
		this.clear();
		var entrySorter = function (a, b) {
			var dispA = this._displayDateForEntry(a);
			var dispB = this._displayDateForEntry(b);
			if (dispA > dispB) {
				return -1;
			}
			if (dispA < dispB) {
				return 1;
			}
			return 0;
		};
		var groupingStr = function (dateStr) {
			var dpts = dateStr.split(",");
			dpts.pop();
			return dpts.join(",");
		};
		var sortedEntries = feed.entries.sort(dojo.hitch(this, entrySorter));
		if (feed) {
			var lastSectionTitle = null;
			for (var i = 0; i < sortedEntries.length; i++) {
				var entry = sortedEntries[i];
				if (this._isFilterAccepted(entry)) {
					var time = this._displayDateForEntry(entry);
					var sectionTitle = "";
					if (time !== null) {
						sectionTitle = groupingStr(time.toLocaleString());
						if (sectionTitle === "") {
							sectionTitle = "" + (time.getMonth() + 1) + "/" + time.getDate() + "/" + time.getFullYear();
						}
					}
					if ((lastSectionTitle === null) || (lastSectionTitle != sectionTitle)) {
						this.appendGrouping(sectionTitle);
						lastSectionTitle = sectionTitle;
					}
					this.appendEntry(entry);
				}
			}
		}
	}, _displayDateForEntry:function (entry) {
		if (entry.updated) {
			return entry.updated;
		}
		if (entry.modified) {
			return entry.modified;
		}
		if (entry.issued) {
			return entry.issued;
		}
		return new Date();
	}, appendGrouping:function (titleText) {
		var entryWidget = new dojox.atom.widget.FeedViewerGrouping({});
		entryWidget.setText(titleText);
		this.addChild(entryWidget);
		this.childWidgets.push(entryWidget);
	}, appendEntry:function (entry) {
		var entryWidget = new dojox.atom.widget.FeedViewerEntry({"xmethod":this.xmethod});
		entryWidget.setTitle(entry.title.value);
		entryWidget.setTime(this._displayDateForEntry(entry).toLocaleTimeString());
		entryWidget.entrySelectionTopic = this.entrySelectionTopic;
		entryWidget.feed = this;
		this.addChild(entryWidget);
		this.childWidgets.push(entryWidget);
		this.connect(entryWidget, "onClick", "_rowSelected");
		entry.domNode = entryWidget.entryNode;
		entry._entryWidget = entryWidget;
		entryWidget.entry = entry;
	}, deleteEntry:function (entryRow) {
		if (!this.localSaveOnly) {
			this.atomIO.deleteEntry(entryRow.entry, dojo.hitch(this, this._removeEntry, entryRow), null, this.xmethod);
		} else {
			this._removeEntry(entryRow, true);
		}
		dojo.publish(this.entrySelectionTopic, [{action:"delete", source:this, entry:entryRow.entry}]);
	}, _removeEntry:function (entry, success) {
		if (success) {
			var idx = dojo.indexOf(this.childWidgets, entry);
			var before = this.childWidgets[idx - 1];
			var after = this.childWidgets[idx + 1];
			if (before.declaredClass === "dojox.atom.widget.FeedViewerGrouping" && (after === undefined || after.declaredClass === "dojox.atom.widget.FeedViewerGrouping")) {
				before.destroy();
			}
			entry.destroy();
		} else {
		}
	}, _rowSelected:function (evt) {
		var selectedNode = evt.target;
		while (selectedNode) {
			if (selectedNode.attributes) {
				var widgetid = selectedNode.attributes.getNamedItem("widgetid");
				if (widgetid && widgetid.value.indexOf("FeedViewerEntry") != -1) {
					break;
				}
			}
			selectedNode = selectedNode.parentNode;
		}
		for (var i = 0; i < this._feed.entries.length; i++) {
			var entry = this._feed.entries[i];
			if ((selectedNode === entry.domNode) && (this._currentSelection !== entry)) {
				dojo.addClass(entry.domNode, "feedViewerEntrySelected");
				dojo.removeClass(entry._entryWidget.timeNode, "feedViewerEntryUpdated");
				dojo.addClass(entry._entryWidget.timeNode, "feedViewerEntryUpdatedSelected");
				this.onEntrySelected(entry);
				if (this.entrySelectionTopic !== "") {
					dojo.publish(this.entrySelectionTopic, [{action:"set", source:this, feed:this._feed, entry:entry}]);
				}
				if (this._isEditable(entry)) {
					entry._entryWidget.enableDelete();
				}
				this._deselectCurrentSelection();
				this._currentSelection = entry;
				break;
			} else {
				if ((selectedNode === entry.domNode) && (this._currentSelection === entry)) {
					dojo.publish(this.entrySelectionTopic, [{action:"delete", source:this, entry:entry}]);
					this._deselectCurrentSelection();
					break;
				}
			}
		}
	}, _deselectCurrentSelection:function () {
		if (this._currentSelection) {
			dojo.addClass(this._currentSelection._entryWidget.timeNode, "feedViewerEntryUpdated");
			dojo.removeClass(this._currentSelection.domNode, "feedViewerEntrySelected");
			dojo.removeClass(this._currentSelection._entryWidget.timeNode, "feedViewerEntryUpdatedSelected");
			this._currentSelection._entryWidget.disableDelete();
			this._currentSelection = null;
		}
	}, _isEditable:function (entry) {
		var retVal = false;
		if (entry && entry !== null && entry.links && entry.links !== null) {
			for (var x in entry.links) {
				if (entry.links[x].rel && entry.links[x].rel == "edit") {
					retVal = true;
					break;
				}
			}
		}
		return retVal;
	}, onEntrySelected:function (entry) {
	}, _isRelativeURL:function (url) {
		var isFileURL = function (url) {
			var retVal = false;
			if (url.indexOf("file://") === 0) {
				retVal = true;
			}
			return retVal;
		};
		var isHttpURL = function (url) {
			var retVal = false;
			if (url.indexOf("http://") === 0) {
				retVal = true;
			}
			return retVal;
		};
		var retVal = false;
		if (url !== null) {
			if (!isFileURL(url) && !isHttpURL(url)) {
				retVal = true;
			}
		}
		return retVal;
	}, _calculateBaseURL:function (fullURL, currentPageRelative) {
		var baseURL = null;
		if (fullURL !== null) {
			var index = fullURL.indexOf("?");
			if (index != -1) {
				fullURL = fullURL.substring(0, index);
			}
			if (currentPageRelative) {
				index = fullURL.lastIndexOf("/");
				if ((index > 0) && (index < fullURL.length) && (index !== (fullURL.length - 1))) {
					baseURL = fullURL.substring(0, (index + 1));
				} else {
					baseURL = fullURL;
				}
			} else {
				index = fullURL.indexOf("://");
				if (index > 0) {
					index = index + 3;
					var protocol = fullURL.substring(0, index);
					var fragmentURL = fullURL.substring(index, fullURL.length);
					index = fragmentURL.indexOf("/");
					if ((index < fragmentURL.length) && (index > 0)) {
						baseURL = protocol + fragmentURL.substring(0, index);
					} else {
						baseURL = protocol + fragmentURL;
					}
				}
			}
		}
		return baseURL;
	}, _isFilterAccepted:function (entry) {
		var accepted = false;
		if (this._includeFilters && (this._includeFilters.length > 0)) {
			for (var i = 0; i < this._includeFilters.length; i++) {
				var filter = this._includeFilters[i];
				if (filter.match(entry)) {
					accepted = true;
					break;
				}
			}
		} else {
			accepted = true;
		}
		return accepted;
	}, addCategoryIncludeFilter:function (filter) {
		if (filter) {
			var scheme = filter.scheme;
			var term = filter.term;
			var label = filter.label;
			var addIt = true;
			if (!scheme) {
				scheme = null;
			}
			if (!term) {
				scheme = null;
			}
			if (!label) {
				scheme = null;
			}
			if (this._includeFilters && this._includeFilters.length > 0) {
				for (var i = 0; i < this._includeFilters.length; i++) {
					var eFilter = this._includeFilters[i];
					if ((eFilter.term === term) && (eFilter.scheme === scheme) && (eFilter.label === label)) {
						addIt = false;
						break;
					}
				}
			}
			if (addIt) {
				this._includeFilters.push(dojox.atom.widget.FeedViewer.CategoryIncludeFilter(scheme, term, label));
			}
		}
	}, removeCategoryIncludeFilter:function (filter) {
		if (filter) {
			var scheme = filter.scheme;
			var term = filter.term;
			var label = filter.label;
			if (!scheme) {
				scheme = null;
			}
			if (!term) {
				scheme = null;
			}
			if (!label) {
				scheme = null;
			}
			var newFilters = [];
			if (this._includeFilters && this._includeFilters.length > 0) {
				for (var i = 0; i < this._includeFilters.length; i++) {
					var eFilter = this._includeFilters[i];
					if (!((eFilter.term === term) && (eFilter.scheme === scheme) && (eFilter.label === label))) {
						newFilters.push(eFilter);
					}
				}
				this._includeFilters = newFilters;
			}
		}
	}, _handleEvent:function (entrySelectionEvent) {
		if (entrySelectionEvent.source != this) {
			if (entrySelectionEvent.action == "update" && entrySelectionEvent.entry) {
				var evt = entrySelectionEvent;
				if (!this.localSaveOnly) {
					this.atomIO.updateEntry(evt.entry, dojo.hitch(evt.source, evt.callback), null, true);
				}
				this._currentSelection._entryWidget.setTime(this._displayDateForEntry(evt.entry).toLocaleTimeString());
				this._currentSelection._entryWidget.setTitle(evt.entry.title.value);
			} else {
				if (entrySelectionEvent.action == "post" && entrySelectionEvent.entry) {
					if (!this.localSaveOnly) {
						this.atomIO.addEntry(entrySelectionEvent.entry, this.url, dojo.hitch(this, this._addEntry));
					} else {
						this._addEntry(entrySelectionEvent.entry);
					}
				}
			}
		}
	}, _addEntry:function (entry) {
		this._feed.addEntry(entry);
		this.setFeed(this._feed);
		dojo.publish(this.entrySelectionTopic, [{action:"set", source:this, feed:this._feed, entry:entry}]);
	}, destroy:function () {
		this.clear();
		dojo.forEach(this._subscriptions, dojo.unsubscribe);
	}});
	dojo.declare("dojox.atom.widget.FeedViewerEntry", [dijit._Widget, dijit._Templated], {templateString:dojo.cache("dojox.atom", "widget/templates/FeedViewerEntry.html", "<tr class=\"feedViewerEntry\" dojoAttachPoint=\"entryNode\" dojoAttachEvent=\"onclick:onClick\">\n	<td class=\"feedViewerEntryUpdated\" dojoAttachPoint=\"timeNode\">\n	</td>\n	<td>\n		<table border=\"0\" width=\"100%\" dojoAttachPoint=\"titleRow\">\n			<tr padding=\"0\" border=\"0\">\n				<td class=\"feedViewerEntryTitle\" dojoAttachPoint=\"titleNode\">\n				</td>\n				<td class=\"feedViewerEntryDelete\" align=\"right\">\n					<span dojoAttachPoint=\"deleteButton\" dojoAttachEvent=\"onclick:deleteEntry\" class=\"feedViewerDeleteButton\" style=\"display:none;\">[delete]</span>\n				</td>\n			<tr>\n		</table>\n	</td>\n</tr>\n"), entryNode:null, timeNode:null, deleteButton:null, entry:null, feed:null, postCreate:function () {
		var _nlsResources = dojo.i18n.getLocalization("dojox.atom.widget", "FeedViewerEntry");
		this.deleteButton.innerHTML = _nlsResources.deleteButton;
	}, setTitle:function (text) {
		if (this.titleNode.lastChild) {
			this.titleNode.removeChild(this.titleNode.lastChild);
		}
		var titleTextNode = document.createElement("div");
		titleTextNode.innerHTML = text;
		this.titleNode.appendChild(titleTextNode);
	}, setTime:function (timeText) {
		if (this.timeNode.lastChild) {
			this.timeNode.removeChild(this.timeNode.lastChild);
		}
		var timeTextNode = document.createTextNode(timeText);
		this.timeNode.appendChild(timeTextNode);
	}, enableDelete:function () {
		if (this.deleteButton !== null) {
			this.deleteButton.style.display = "inline";
		}
	}, disableDelete:function () {
		if (this.deleteButton !== null) {
			this.deleteButton.style.display = "none";
		}
	}, deleteEntry:function (event) {
		event.preventDefault();
		event.stopPropagation();
		this.feed.deleteEntry(this);
	}, onClick:function (e) {
	}});
	dojo.declare("dojox.atom.widget.FeedViewerGrouping", [dijit._Widget, dijit._Templated], {templateString:dojo.cache("dojox.atom", "widget/templates/FeedViewerGrouping.html", "<tr dojoAttachPoint=\"groupingNode\" class=\"feedViewerGrouping\">\n\t<td colspan=\"2\" dojoAttachPoint=\"titleNode\" class=\"feedViewerGroupingTitle\">\n\t</td>\n</tr>\n"), groupingNode:null, titleNode:null, setText:function (text) {
		if (this.titleNode.lastChild) {
			this.titleNode.removeChild(this.titleNode.lastChild);
		}
		var textNode = document.createTextNode(text);
		this.titleNode.appendChild(textNode);
	}});
	dojo.declare("dojox.atom.widget.AtomEntryCategoryFilter", [dijit._Widget, dijit._Templated], {scheme:"", term:"", label:"", isFilter:true});
	dojo.declare("dojox.atom.widget.FeedViewer.CategoryIncludeFilter", null, {constructor:function (scheme, term, label) {
		this.scheme = scheme;
		this.term = term;
		this.label = label;
	}, match:function (entry) {
		var matched = false;
		if (entry !== null) {
			var categories = entry.categories;
			if (categories !== null) {
				for (var i = 0; i < categories.length; i++) {
					var category = categories[i];
					if (this.scheme !== "") {
						if (this.scheme !== category.scheme) {
							break;
						}
					}
					if (this.term !== "") {
						if (this.term !== category.term) {
							break;
						}
					}
					if (this.label !== "") {
						if (this.label !== category.label) {
							break;
						}
					}
					matched = true;
				}
			}
		}
		return matched;
	}});
}

