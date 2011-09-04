/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.calc.Standard"]) {
	dojo._hasResource["dojox.calc.Standard"] = true;
	dojo.provide("dojox.calc.Standard");
	dojo.require("dijit._Templated");
	dojo.require("dojox.math._base");
	dojo.require("dijit.dijit");
	dojo.require("dijit.Menu");
	dojo.require("dijit.form.DropDownButton");
	dojo.require("dijit.TooltipDialog");
	dojo.require("dijit.form.TextBox");
	dojo.require("dijit.form.Button");
	dojo.require("dojox.calc._Executor");
	dojo.experimental("dojox.calc.Standard");
	dojo.declare("dojox.calc.Standard", [dijit._Widget, dijit._Templated], {templateString:dojo.cache("dojox.calc", "templates/Standard.html", "<div class=\"dijitReset dijitInline dojoxCalc\"\n><table class=\"dijitReset dijitInline dojoxCalcLayout\" dojoAttachPoint=\"calcTable\" rules=\"none\" cellspacing=0 cellpadding=0 border=0>\n\t<tr\n\t\t><td colspan=\"4\" class=\"dojoxCalcInputContainer\"\n\t\t\t><input dojoType=\"dijit.form.TextBox\" dojoAttachEvent=\"onBlur:onBlur,onKeyPress:onKeyPress\" dojoAttachPoint='textboxWidget'\n\t\t/></td\n\t></tr>\n\t<tr>\n\t\t<td class=\"dojoxCalcButtonContainer\">\n\t\t\t<button dojoType=\"dijit.form.Button\" dojoAttachPoint=\"seven\" label=\"7\" value='7' dojoAttachEvent='onClick:insertText' />\n\t\t</td>\n\t\t<td class=\"dojoxCalcButtonContainer\">\n\t\t\t<button dojoType=\"dijit.form.Button\" dojoAttachPoint=\"eight\" label=\"8\" value='8' dojoAttachEvent='onClick:insertText' />\n\t\t</td>\n\t\t<td class=\"dojoxCalcButtonContainer\">\n\t\t\t<button dojoType=\"dijit.form.Button\" dojoAttachPoint=\"nine\" label=\"9\" value='9' dojoAttachEvent='onClick:insertText' />\n\t\t</td>\n\t\t<td class=\"dojoxCalcButtonContainer\">\n\t\t\t<button dojoType=\"dijit.form.Button\" dojoAttachPoint=\"divide\" label=\"/\" value='/' dojoAttachEvent='onClick:insertOperator' />\n\t\t</td>\n\t</tr>\n\t<tr>\n\t\t<td class=\"dojoxCalcButtonContainer\">\n\t\t\t<button dojoType=\"dijit.form.Button\" dojoAttachPoint=\"four\" label=\"4\" value='4' dojoAttachEvent='onClick:insertText' />\n\t\t</td>\n\t\t<td class=\"dojoxCalcButtonContainer\">\n\t\t\t<button dojoType=\"dijit.form.Button\" dojoAttachPoint=\"five\" label=\"5\" value='5' dojoAttachEvent='onClick:insertText' />\n\t\t</td>\n\t\t<td class=\"dojoxCalcButtonContainer\">\n\t\t\t<button dojoType=\"dijit.form.Button\" dojoAttachPoint=\"six\" label=\"6\" value='6' dojoAttachEvent='onClick:insertText' />\n\t\t</td>\n\t\t<td class=\"dojoxCalcButtonContainer\">\n\t\t\t<button dojoType=\"dijit.form.Button\" dojoAttachPoint=\"multiply\" label=\"*\" value='*' dojoAttachEvent='onClick:insertOperator' />\n\t\t</td>\n\t</tr>\n\t<tr>\n\t\t<td class=\"dojoxCalcButtonContainer\">\n\t\t\t<button dojoType=\"dijit.form.Button\" dojoAttachPoint=\"one\" label=\"1\" value='1' dojoAttachEvent='onClick:insertText' />\n\t\t</td>\n\t\t<td class=\"dojoxCalcButtonContainer\">\n\t\t\t<button dojoType=\"dijit.form.Button\" dojoAttachPoint=\"two\" label=\"2\" value='2' dojoAttachEvent='onClick:insertText' />\n\t\t</td>\n\t\t<td class=\"dojoxCalcButtonContainer\">\n\t\t\t<button dojoType=\"dijit.form.Button\" dojoAttachPoint=\"three\" label=\"3\" value='3' dojoAttachEvent='onClick:insertText' />\n\t\t</td>\n\t\t<td class=\"dojoxCalcButtonContainer\">\n\t\t\t<button dojoType=\"dijit.form.Button\" dojoAttachPoint=\"add\" label=\"+\" value='+' dojoAttachEvent='onClick:insertOperator' />\n\t\t</td>\n\t</tr>\n\t<tr>\n\t\t<td class=\"dojoxCalcButtonContainer\">\n\t\t\t<button dojoType=\"dijit.form.Button\" dojoAttachPoint=\"decimal\" label=\".\" value='.' dojoAttachEvent='onClick:insertText' />\n\t\t</td>\n\t\t<td class=\"dojoxCalcButtonContainer\">\n\t\t\t<button dojoType=\"dijit.form.Button\" dojoAttachPoint=\"zero\" label=\"0\" value='0' dojoAttachEvent='onClick:insertText' />\n\t\t</td>\n\t\t<td class=\"dojoxCalcButtonContainer\">\n\t\t\t<button dojoType=\"dijit.form.Button\" dojoAttachPoint=\"equals\" label=\"x=y\" value='=' dojoAttachEvent='onClick:insertText' />\n\t\t</td>\n\t\t<td class=\"dojoxCalcMinusButtonContainer\">\n\t\t\t<span dojoType=\"dijit.form.ComboButton\" dojoAttachPoint=\"subtract\" label='-' value='-' dojoAttachEvent='onClick:insertOperator'>\n\n\t\t\t\t<div dojoType=\"dijit.Menu\" style=\"display:none;\">\n\t\t\t\t\t<div dojoType=\"dijit.MenuItem\" dojoAttachEvent=\"onClick:insertMinus\">\n\t\t\t\t\t\t(-)\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</span>\n\t\t</td>\n\t</tr>\n\t<tr>\n\t\t<td class=\"dojoxCalcButtonContainer\">\n\t\t\t<button dojoType=\"dijit.form.Button\" dojoAttachPoint=\"clear\" label=\"Clear\" dojoAttachEvent='onClick:clearText' />\n\t\t</td>\n\t\t<td class=\"dojoxCalcButtonContainer\">\n\t\t\t<button dojoType=\"dijit.form.Button\" dojoAttachPoint=\"sqrt\" label=\"&#x221A;\" value=\"&#x221A;\" dojoAttachEvent='onClick:insertText' />\n\t\t</td>\n\t\t<td class=\"dojoxCalcButtonContainer\">\n\t\t\t<button dojoType=\"dijit.form.Button\" dojoAttachPoint=\"power\" label=\"^\" value=\"^\" dojoAttachEvent='onClick:insertOperator' />\n\t\t</td>\n\t\t<td class=\"dojoxCalcButtonContainer\">\n\t\t\t<button dojoType=\"dijit.form.Button\" dojoAttachPoint=\"comma\" label=\",\" value=',' dojoAttachEvent='onClick:insertText' />\n\t\t</td>\n\t</tr>\n\t<tr>\n\t\t<td class=\"dojoxCalcButtonContainer\">\n\t\t\t<button dojoType=\"dijit.form.Button\" dojoAttachPoint=\"AnsButton\" label=\"Ans\" value=\"Ans\" dojoAttachEvent='onClick:insertText' />\n\t\t</td>\n\t\t<td class=\"dojoxCalcButtonContainer\">\n\t\t\t<button dojoType=\"dijit.form.Button\" dojoAttachPoint=\"LeftParenButton\" label=\"(\" value=\"(\" dojoAttachEvent='onClick:insertText' />\n\t\t</td>\n\t\t<td class=\"dojoxCalcButtonContainer\">\n\t\t\t<button dojoType=\"dijit.form.Button\" dojoAttachPoint=\"RightParenButton\" label=\")\" value=\")\" dojoAttachEvent='onClick:insertText' />\n\t\t</td>\n\t\t<td class=\"dojoxCalcButtonContainer\">\n\t\t\t<button dojoType=\"dijit.form.Button\" dojoAttachPoint=\"enter\" label=\"Enter\" dojoAttachEvent='onClick:parseTextbox' />\n\t\t</td>\n\t</tr>\n</table>\n<span dojoAttachPoint=\"executor\" dojoType=\"dojox.calc._Executor\" dojoAttachEvent=\"onLoad:executorLoaded\"></span>\n</div>\n"), readStore:null, writeStore:null, functions:[], widgetsInTemplate:true, executorLoaded:function () {
		dojo.addOnLoad(dojo.hitch(this, function () {
			this.loadStore(this.readStore, true);
			this.loadStore(this.writeStore);
		}));
	}, saveFunction:function (name, args, body) {
		this.functions[name] = this.executor.normalizedFunction(name, args, body);
		this.functions[name].args = args;
		this.functions[name].body = body;
	}, loadStore:function (store, isReadOnly) {
		function saveFunctions(items) {
			for (var i = 0; i < items.length; i++) {
				this.saveFunction(items[i].name[0], items[i].args[0], items[i].body[0]);
			}
		}
		function saveReadOnlyFunctions(items) {
			for (var i = 0; i < items.length; i++) {
				this.executor.normalizedFunction(items[i].name[0], items[i].args[0], items[i].body[0]);
			}
		}
		if (store == null) {
			return;
		}
		if (isReadOnly) {
			store.fetch({onComplete:dojo.hitch(this, saveReadOnlyFunctions), onError:function (text) {
				console.error(text);
			}});
		} else {
			store.fetch({onComplete:dojo.hitch(this, saveFunctions), onError:function (text) {
				console.error(text);
			}});
		}
	}, parseTextbox:function () {
		var text = this.textboxWidget.textbox.value;
		if (text == "" && this.commandList.length > 0) {
			this.setTextboxValue(this.textboxWidget, this.commandList[this.commandList.length - 1]);
			text = this.textboxWidget.textbox.value;
		}
		if (text != "") {
			var ans = this.executor.eval(text);
			if ((typeof ans == "number" && isNaN(ans))) {
				if (this.commandList.length == 0 || this.commandList[this.commandList.length - 1] != text) {
					this.commandList.push(text);
				}
				this.print(text, false);
				this.print("Not a Number", true);
			} else {
				if (((typeof ans == "object" && "length" in ans) || typeof ans != "object") && typeof ans != "function" && ans != null) {
					this.executor.eval("Ans=" + ans);
					if (this.commandList.length == 0 || this.commandList[this.commandList.length - 1] != text) {
						this.commandList.push(text);
					}
					this.print(text, false);
					this.print(ans, true);
				}
			}
			this.commandIndex = this.commandList.length - 1;
			if (this.hasDisplay) {
				this.displayBox.scrollTop = this.displayBox.scrollHeight;
			}
			dijit.selectInputText(this.textboxWidget.textbox);
		} else {
			this.textboxWidget.focus();
		}
	}, cycleCommands:function (count, node, event) {
		if (count == -1 || this.commandList.length == 0) {
			return;
		}
		var keyNum = event.charOrCode;
		if (keyNum == dojo.keys.UP_ARROW) {
			this.cycleCommandUp();
		} else {
			if (keyNum == dojo.keys.DOWN_ARROW) {
				this.cycleCommandDown();
			}
		}
	}, cycleCommandUp:function () {
		if (this.commandIndex - 1 < 0) {
			this.commandIndex = 0;
		} else {
			this.commandIndex--;
		}
		this.setTextboxValue(this.textboxWidget, this.commandList[this.commandIndex]);
	}, cycleCommandDown:function () {
		if (this.commandIndex + 1 >= this.commandList.length) {
			this.commandIndex = this.commandList.length;
			this.setTextboxValue(this.textboxWidget, "");
		} else {
			this.commandIndex++;
			this.setTextboxValue(this.textboxWidget, this.commandList[this.commandIndex]);
		}
	}, onBlur:function () {
		if (dojo.isIE) {
			var tr = dojo.doc.selection.createRange().duplicate();
			var selectedText = tr.text || "";
			var ntr = this.textboxWidget.textbox.createTextRange();
			tr.move("character", 0);
			ntr.move("character", 0);
			try {
				ntr.setEndPoint("EndToEnd", tr);
				this.textboxWidget.textbox.selectionEnd = (this.textboxWidget.textbox.selectionStart = String(ntr.text).replace(/\r/g, "").length) + selectedText.length;
			}
			catch (e) {
			}
		}
	}, onKeyPress:function (event) {
		if (event.charOrCode == dojo.keys.ENTER) {
			this.parseTextbox();
			dojo.stopEvent(event);
		} else {
			if (event.charOrCode == "!" || event.charOrCode == "^" || event.charOrCode == "*" || event.charOrCode == "/" || event.charOrCode == "-" || event.charOrCode == "+") {
				if (dojo.isIE) {
					var tr = dojo.doc.selection.createRange().duplicate();
					var selectedText = tr.text || "";
					var ntr = this.textboxWidget.textbox.createTextRange();
					tr.move("character", 0);
					ntr.move("character", 0);
					try {
						ntr.setEndPoint("EndToEnd", tr);
						this.textboxWidget.textbox.selectionEnd = (this.textboxWidget.textbox.selectionStart = String(ntr.text).replace(/\r/g, "").length) + selectedText.length;
					}
					catch (e) {
					}
				}
				if (this.textboxWidget.get("value") == "") {
					this.setTextboxValue(this.textboxWidget, "Ans");
				} else {
					if (this.putInAnsIfTextboxIsHighlighted(this.textboxWidget.textbox, event.charOrCode)) {
						this.setTextboxValue(this.textboxWidget, "Ans");
						dijit.selectInputText(this.textboxWidget.textbox, this.textboxWidget.textbox.value.length, this.textboxWidget.textbox.value.length);
					}
				}
			}
		}
	}, insertMinus:function () {
		this.insertText("-");
	}, print:function (text, isRight) {
		var t = "<span style='display:block;";
		if (isRight) {
			t += "text-align:right;'>";
		} else {
			t += "text-align:left;'>";
		}
		t += text + "<br></span>";
		if (this.hasDisplay) {
			this.displayBox.innerHTML += t;
		} else {
			this.setTextboxValue(this.textboxWidget, text);
		}
	}, setTextboxValue:function (widget, val) {
		widget.set("value", val);
	}, putInAnsIfTextboxIsHighlighted:function (node) {
		if (typeof node.selectionStart == "number") {
			if (node.selectionStart == 0 && node.selectionEnd == node.value.length) {
				return true;
			}
		} else {
			if (document.selection) {
				var range = document.selection.createRange();
				if (node.value == range.text) {
					return true;
				}
			}
		}
		return false;
	}, clearText:function () {
		if (this.hasDisplay && this.textboxWidget.get("value") == "") {
			this.displayBox.innerHTML = "";
		} else {
			this.setTextboxValue(this.textboxWidget, "");
		}
		this.textboxWidget.focus();
	}, insertOperator:function (newText) {
		if (typeof newText == "object") {
			newText = newText = dijit.getEnclosingWidget(newText["target"]).value;
		}
		if (this.textboxWidget.get("value") == "" || this.putInAnsIfTextboxIsHighlighted(this.textboxWidget.textbox)) {
			newText = "Ans" + newText;
		}
		this.insertText(newText);
	}, insertText:function (newText) {
		setTimeout(dojo.hitch(this, function () {
			var node = this.textboxWidget.textbox;
			if (node.value == "") {
				node.selectionStart = 0;
				node.selectionEnd = 0;
			}
			if (typeof newText == "object") {
				newText = newText = dijit.getEnclosingWidget(newText["target"]).value;
			}
			var value = node.value.replace(/\r/g, "");
			if (typeof node.selectionStart == "number") {
				var pos = node.selectionStart;
				var cr = 0;
				if (navigator.userAgent.indexOf("Opera") != -1) {
					cr = (node.value.substring(0, pos).match(/\r/g) || []).length;
				}
				node.value = value.substring(0, node.selectionStart - cr) + newText + value.substring(node.selectionEnd - cr);
				node.focus();
				pos += newText.length;
				dijit.selectInputText(this.textboxWidget.textbox, pos, pos);
			} else {
				if (document.selection) {
					if (this.handle) {
						clearTimeout(this.handle);
						this.handle = null;
					}
					node.focus();
					this.handle = setTimeout(function () {
						var range = document.selection.createRange();
						range.text = newText;
						range.select();
						this.handle = null;
					}, 0);
				}
			}
		}), 0);
	}, hasDisplay:false, postCreate:function () {
		this.handle = null;
		this.commandList = [];
		this.commandIndex = 0;
		if (this.displayBox) {
			this.hasDisplay = true;
		}
		if (this.toFracButton && !dojox.calc.toFrac) {
			dojo.style(this.toFracButton.domNode, {visibility:"hidden"});
		}
		if (this.functionMakerButton && !dojox.calc.FuncGen) {
			dojo.style(this.functionMakerButton.domNode, {visibility:"hidden"});
		}
		if (this.grapherMakerButton && !dojox.calc.Grapher) {
			dojo.style(this.grapherMakerButton.domNode, {visibility:"hidden"});
		}
		this._connects.push(dijit.typematic.addKeyListener(this.textboxWidget.textbox, {charOrCode:dojo.keys.UP_ARROW, shiftKey:false, metaKey:false, ctrlKey:false}, this, this.cycleCommands, 200, 200));
		this._connects.push(dijit.typematic.addKeyListener(this.textboxWidget.textbox, {charOrCode:dojo.keys.DOWN_ARROW, shiftKey:false, metaKey:false, ctrlKey:false}, this, this.cycleCommands, 200, 200));
		this.startup();
	}});
}

