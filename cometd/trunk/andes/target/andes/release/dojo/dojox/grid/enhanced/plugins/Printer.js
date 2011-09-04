/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid.enhanced.plugins.Printer"]) {
	dojo._hasResource["dojox.grid.enhanced.plugins.Printer"] = true;
	dojo.provide("dojox.grid.enhanced.plugins.Printer");
	dojo.require("dojox.grid.enhanced._Plugin");
	dojo.require("dojox.grid.enhanced.plugins.exporter.TableWriter");
	dojo.declare("dojox.grid.enhanced.plugins.Printer", dojox.grid.enhanced._Plugin, {name:"printer", constructor:function (grid) {
		this.grid = grid;
		this._mixinGrid(grid);
		grid.setExportFormatter(function (data, cell, rowIndex, rowItem) {
			return cell.format(rowIndex, rowItem);
		});
	}, _mixinGrid:function () {
		var g = this.grid;
		g.printGrid = dojo.hitch(this, this.printGrid);
		g.printSelected = dojo.hitch(this, this.printSelected);
		g.exportToHTML = dojo.hitch(this, this.exportToHTML);
		g.exportSelectedToHTML = dojo.hitch(this, this.exportSelectedToHTML);
		g.normalizePrintedGrid = dojo.hitch(this, this.normalizeRowHeight);
	}, printGrid:function (args) {
		this.exportToHTML(args, dojo.hitch(this, this._print));
	}, printSelected:function (args) {
		this._print(this.exportSelectedToHTML(args));
	}, exportToHTML:function (args, onExported) {
		args = this._formalizeArgs(args);
		var _this = this;
		this.grid.exportGrid("table", args, function (str) {
			onExported(_this._wrapHTML(args.title, args.cssFiles, args.titleInBody + str));
		});
	}, exportSelectedToHTML:function (args) {
		args = this._formalizeArgs(args);
		var str = this.grid.exportSelected("table", args.writerArgs);
		return this._wrapHTML(args.title, args.cssFiles, args.titleInBody + str);
	}, _print:function (htmlStr) {
		var win, _this = this, fillDoc = function (w) {
			var doc = win.document;
			doc.open();
			doc.write(htmlStr);
			doc.close();
			_this.normalizeRowHeight(doc);
		};
		if (!window.print) {
			return;
		} else {
			if (dojo.isChrome || dojo.isOpera) {
				win = window.open("javascript: ''", "", "status=0,menubar=0,location=0,toolbar=0,width=1,height=1,resizable=0,scrollbars=0");
				fillDoc(win);
				win.print();
				win.close();
			} else {
				var fn = this._printFrame, dn = this.grid.domNode;
				if (!fn) {
					var frameId = dn.id + "_print_frame";
					if (!(fn = dojo.byId(frameId))) {
						fn = dojo.create("iframe");
						fn.id = frameId;
						fn.frameBorder = 0;
						dojo.style(fn, {width:"1px", height:"1px", position:"absolute", right:0, bottoom:0, border:"none", overflow:"hidden"});
						if (!dojo.isIE) {
							dojo.style(fn, "visibility", "hidden");
						}
						dn.appendChild(fn);
					}
					this._printFrame = fn;
				}
				win = fn.contentWindow;
				fillDoc(win);
				dijit.focus(fn);
				win.print();
			}
		}
	}, _wrapHTML:function (title, cssFiles, body_content) {
		var html = ["<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\" \"http://www.w3.org/TR/html4/loose.dtd\">", "<html><head><title>", title, "</title><meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\"></meta>"];
		for (var i = 0; i < cssFiles.length; ++i) {
			html.push("<link rel=\"stylesheet\" type=\"text/css\" href=\"" + cssFiles[i] + "\" />");
		}
		html.push("</head>");
		if (body_content.search(/^\s*<body/i) < 0) {
			body_content = "<body>" + body_content + "</body>";
		}
		html.push(body_content);
		return html.join("\n");
	}, normalizeRowHeight:function (doc) {
		var views = dojo.query("table.grid_view", doc.body);
		var headPerView = dojo.map(views, function (view) {
			return dojo.query("thead.grid_header", view)[0];
		});
		var rowsPerView = dojo.map(views, function (view) {
			return dojo.query("tbody.grid_row", view);
		});
		var rowCount = rowsPerView[0].length;
		var i, v, h, maxHeight = 0;
		for (v = views.length - 1; v >= 0; --v) {
			h = dojo.contentBox(headPerView[v]).h;
			if (h > maxHeight) {
				maxHeight = h;
			}
		}
		for (v = views.length - 1; v >= 0; --v) {
			dojo.style(headPerView[v], "height", maxHeight + "px");
		}
		for (i = 0; i < rowCount; ++i) {
			maxHeight = 0;
			for (v = views.length - 1; v >= 0; --v) {
				h = dojo.contentBox(rowsPerView[v][i]).h;
				if (h > maxHeight) {
					maxHeight = h;
				}
			}
			for (v = views.length - 1; v >= 0; --v) {
				dojo.style(rowsPerView[v][i], "height", maxHeight + "px");
			}
		}
		var left = 0;
		for (v = 0; v < views.length; ++v) {
			dojo.style(views[v], "left", left + "px");
			left += dojo.marginBox(views[v]).w;
		}
	}, _formalizeArgs:function (args) {
		args = (args && dojo.isObject(args)) ? args : {};
		args.title = String(args.title) || "";
		if (!dojo.isArray(args.cssFiles)) {
			args.cssFiles = [args.cssFiles];
		}
		args.titleInBody = args.title ? ["<h1>", args.title, "</h1>"].join("") : "";
		return args;
	}});
	dojox.grid.EnhancedGrid.registerPlugin(dojox.grid.enhanced.plugins.Printer, {"dependency":["exporter"]});
}

