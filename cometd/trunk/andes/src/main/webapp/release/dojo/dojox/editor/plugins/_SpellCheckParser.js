/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.editor.plugins._SpellCheckParser"]) {
	dojo._hasResource["dojox.editor.plugins._SpellCheckParser"] = true;
	dojo.provide("dojox.editor.plugins._SpellCheckParser");
	dojo.declare("dojox.editor.plugins._SpellCheckParser", null, {lang:"english", parseIntoWords:function (text) {
		function isCharExt(c) {
			var ch = c.charCodeAt(0);
			return 48 <= ch && ch <= 57 || 65 <= ch && ch <= 90 || 97 <= ch && ch <= 122;
		}
		var words = this.words = [], indices = this.indices = [], index = 0, length = text && text.length, start = 0;
		while (index < length) {
			var ch;
			while (index < length && !isCharExt(ch = text.charAt(index)) && ch != "&") {
				index++;
			}
			if (ch == "&") {
				while (++index < length && (ch = text.charAt(index)) != ";" && isCharExt(ch)) {
				}
			} else {
				start = index;
				while (++index < length && isCharExt(text.charAt(index))) {
				}
				if (start < length) {
					words.push(text.substring(start, index));
					indices.push(start);
				}
			}
		}
		return words;
	}, getIndices:function () {
		return this.indices;
	}});
	dojo.subscribe(dijit._scopeName + ".Editor.plugin.SpellCheck.getParser", null, function (sp) {
		if (sp.parser) {
			return;
		}
		sp.parser = new dojox.editor.plugins._SpellCheckParser();
	});
}

