/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["andes.WordTip"]) {
	dojo._hasResource["andes.WordTip"] = true;
	dojo.provide("andes.WordTip");
	dojo.declare("andes.WordTip", null, {conEdit:null, stencil:null, constructor:function () {
		this.conEdit = dojo.byId("conEdit");
		dojo.connect(this.conEdit, "keydown", this, "textMonitor");
		console.log("I've got conedit now", this.conEdit);
	}, hasTip:{"rectangle":true, "ellipse":true, "vector":true, "statement":true}, add:function (obj) {
		this.theDrawing = obj;
	}, textMonitor:function (evt) {
		if (evt.keyCode == dojo.keys.SPACE || evt.keyCode == dojo.keys.TAB || evt.keyCode == 188) {
			console.log("andes.WordTip.textMonitor this=", this);
			var tx = dojo.trim(this.conEdit.innerHTML);
			tx = this.removeBreaks(tx);
			var symbol = andes.variablename.parse(tx);
			console.log("---Text for word-suggest----> ", tx, symbol);
			this.sendToServer(tx, symbol);
		}
		if (evt.keyCode == dojo.keys.ENTER || evt.keyCode == dojo.keys.ESCAPE) {
			dijit.hideTooltip(this.conEdit);
		}
		var cn = dojo.connect(document, "mouseup", this, function (evt) {
			dojo.disconnect(cn);
			dijit.hideTooltip(this.conEdit);
		});
	}, removeBreaks:function (txt) {
		dojo.forEach(["<br>", "<br/>", "<br />", "\\n", "\\r"], function (br) {
			txt = txt.replace(new RegExp(br, "gi"), " ");
		});
		return txt;
	}, sendToServer:function (text, symbol) {
		console.assert(this.theDrawing, "WordTip needs drawing initialized");
		var current;
		var andesTypes = andes.convert.andesTypes;
		var stencilID = dojo.attr(this.conEdit.parentNode, "id"), stencilLastSelected = this.theDrawing.stencils.getRecentStencil(), type = stencilLastSelected.combo ? stencilLastSelected.combo.master.type : stencilLastSelected.type, sid = stencilLastSelected.combo ? stencilLastSelected.combo.statement.id : stencilLastSelected.id;
		if (stencilID != sid) {
			type = this.theDrawing.currentType;
			current = andesTypes[type];
		} else {
			var tmp = this.theDrawing.stencils.stencils[stencilID];
			current = tmp.customType || andesTypes[type];
		}
		if (current && this.hasTip[current]) {
			andes.api.suggestWord({type:current, text:text, symbol:symbol});
		}
	}, processResults:function (results) {
		dojo.forEach(results, function (line) {
			if (line.action == "next-words") {
				dijit.hideTooltip(this.conEdit);
				if (line.words.length > 0 || line["last-word"]) {
					var size = Math.min(7, line.words.length);
					var wrd = line["last-word"] ? "&lt;done&gt;" : "";
					for (var i = 0; i < size; i++) {
						if (wrd.length > 0) {
							wrd += ", ";
						}
						wrd += line.words[i];
					}
					if (i < line.words.length) {
						wrd += ", &#8230;";
					}
					console.log("Successfully retrieved tips: ", line.words.join(), " \nminimized to: ", wrd);
					dijit.showTooltip(wrd, this.conEdit, "above");
				}
			}
		}, this);
	}});
}

