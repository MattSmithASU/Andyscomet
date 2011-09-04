/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.string.BidiComplex"]) {
	dojo._hasResource["dojox.string.BidiComplex"] = true;
	dojo.provide("dojox.string.BidiComplex");
	dojo.experimental("dojox.string.BidiComplex");
	(function () {
		var _str0 = [];
		dojox.string.BidiComplex.attachInput = function (field, pattern) {
			field.alt = pattern;
			dojo.connect(field, "onkeydown", this, "_ceKeyDown");
			dojo.connect(field, "onkeyup", this, "_ceKeyUp");
			dojo.connect(field, "oncut", this, "_ceCutText");
			dojo.connect(field, "oncopy", this, "_ceCopyText");
			field.value = dojox.string.BidiComplex.createDisplayString(field.value, field.alt);
		};
		dojox.string.BidiComplex.createDisplayString = function (str, pattern) {
			str = dojox.string.BidiComplex.stripSpecialCharacters(str);
			var segmentsPointers = dojox.string.BidiComplex._parse(str, pattern);
			var buf = "\u202a" + str;
			var shift = 1;
			dojo.forEach(segmentsPointers, function (n) {
				if (n != null) {
					var preStr = buf.substring(0, n + shift);
					var postStr = buf.substring(n + shift, buf.length);
					buf = preStr + "\u200e" + postStr;
					shift++;
				}
			});
			return buf;
		};
		dojox.string.BidiComplex.stripSpecialCharacters = function (str) {
			return str.replace(/[\u200E\u200F\u202A-\u202E]/g, "");
		};
		dojox.string.BidiComplex._ceKeyDown = function (event) {
			var elem = dojo.isIE ? event.srcElement : event.target;
			_str0 = elem.value;
		};
		dojox.string.BidiComplex._ceKeyUp = function (event) {
			var LRM = "\u200e";
			var elem = dojo.isIE ? event.srcElement : event.target;
			var str1 = elem.value;
			var ieKey = event.keyCode;
			if ((ieKey == dojo.keys.HOME) || (ieKey == dojo.keys.END) || (ieKey == dojo.keys.SHIFT)) {
				return;
			}
			var cursorStart, cursorEnd;
			var selection = dojox.string.BidiComplex._getCaretPos(event, elem);
			if (selection) {
				cursorStart = selection[0];
				cursorEnd = selection[1];
			}
			if (dojo.isIE) {
				var cursorStart1 = cursorStart, cursorEnd1 = cursorEnd;
				if (ieKey == dojo.keys.LEFT_ARROW) {
					if ((str1.charAt(cursorEnd - 1) == LRM) && (cursorStart == cursorEnd)) {
						dojox.string.BidiComplex._setSelectedRange(elem, cursorStart - 1, cursorEnd - 1);
					}
					return;
				}
				if (ieKey == dojo.keys.RIGHT_ARROW) {
					if (str1.charAt(cursorEnd - 1) == LRM) {
						cursorEnd1 = cursorEnd + 1;
						if (cursorStart == cursorEnd) {
							cursorStart1 = cursorStart + 1;
						}
					}
					dojox.string.BidiComplex._setSelectedRange(elem, cursorStart1, cursorEnd1);
					return;
				}
			} else {
				if (ieKey == dojo.keys.LEFT_ARROW) {
					if (str1.charAt(cursorEnd - 1) == LRM) {
						dojox.string.BidiComplex._setSelectedRange(elem, cursorStart - 1, cursorEnd - 1);
					}
					return;
				}
				if (ieKey == dojo.keys.RIGHT_ARROW) {
					if (str1.charAt(cursorEnd - 1) == LRM) {
						dojox.string.BidiComplex._setSelectedRange(elem, cursorStart + 1, cursorEnd + 1);
					}
					return;
				}
			}
			var str2 = dojox.string.BidiComplex.createDisplayString(str1, elem.alt);
			if (str1 != str2) {
				window.status = str1 + " c=" + cursorEnd;
				elem.value = str2;
				if ((ieKey == dojo.keys.DELETE) && (str2.charAt(cursorEnd) == LRM)) {
					elem.value = str2.substring(0, cursorEnd) + str2.substring(cursorEnd + 2, str2.length);
				}
				if (ieKey == dojo.keys.DELETE) {
					dojox.string.BidiComplex._setSelectedRange(elem, cursorStart, cursorEnd);
				} else {
					if (ieKey == dojo.keys.BACKSPACE) {
						if ((_str0.length >= cursorEnd) && (_str0.charAt(cursorEnd - 1) == LRM)) {
							dojox.string.BidiComplex._setSelectedRange(elem, cursorStart - 1, cursorEnd - 1);
						} else {
							dojox.string.BidiComplex._setSelectedRange(elem, cursorStart, cursorEnd);
						}
					} else {
						if (elem.value.charAt(cursorEnd) != LRM) {
							dojox.string.BidiComplex._setSelectedRange(elem, cursorStart + 1, cursorEnd + 1);
						}
					}
				}
			}
		};
		dojox.string.BidiComplex._processCopy = function (elem, text, isReverse) {
			if (text == null) {
				if (dojo.isIE) {
					var range = document.selection.createRange();
					text = range.text;
				} else {
					text = elem.value.substring(elem.selectionStart, elem.selectionEnd);
				}
			}
			var textToClipboard = dojox.string.BidiComplex.stripSpecialCharacters(text);
			if (dojo.isIE) {
				window.clipboardData.setData("Text", textToClipboard);
			}
			return true;
		};
		dojox.string.BidiComplex._ceCopyText = function (elem) {
			if (dojo.isIE) {
				elem.returnValue = false;
			}
			return dojox.string.BidiComplex._processCopy(elem, null, false);
		};
		dojox.string.BidiComplex._ceCutText = function (elem) {
			var ret = dojox.string.BidiComplex._processCopy(elem, null, false);
			if (!ret) {
				return false;
			}
			if (dojo.isIE) {
				document.selection.clear();
			} else {
				var curPos = elem.selectionStart;
				elem.value = elem.value.substring(0, curPos) + elem.value.substring(elem.selectionEnd);
				elem.setSelectionRange(curPos, curPos);
			}
			return true;
		};
		dojox.string.BidiComplex._getCaretPos = function (event, elem) {
			if (dojo.isIE) {
				var position = 0, range = document.selection.createRange().duplicate(), range2 = range.duplicate(), rangeLength = range.text.length;
				if (elem.type == "textarea") {
					range2.moveToElementText(elem);
				} else {
					range2.expand("textedit");
				}
				while (range.compareEndPoints("StartToStart", range2) > 0) {
					range.moveStart("character", -1);
					++position;
				}
				return [position, position + rangeLength];
			}
			return [event.target.selectionStart, event.target.selectionEnd];
		};
		dojox.string.BidiComplex._setSelectedRange = function (elem, selectionStart, selectionEnd) {
			if (dojo.isIE) {
				var range = elem.createTextRange();
				if (range) {
					if (elem.type == "textarea") {
						range.moveToElementText(elem);
					} else {
						range.expand("textedit");
					}
					range.collapse();
					range.moveEnd("character", selectionEnd);
					range.moveStart("character", selectionStart);
					range.select();
				}
			} else {
				elem.selectionStart = selectionStart;
				elem.selectionEnd = selectionEnd;
			}
		};
		var _isBidiChar = function (c) {
			return (c >= "0" && c <= "9") || (c > "\xff");
		};
		var _isLatinChar = function (c) {
			return (c >= "A" && c <= "Z") || (c >= "a" && c <= "z");
		};
		var _isCharBeforeBiDiChar = function (buffer, i, previous) {
			while (i > 0) {
				if (i == previous) {
					return false;
				}
				i--;
				if (_isBidiChar(buffer.charAt(i))) {
					return true;
				}
				if (_isLatinChar(buffer.charAt(i))) {
					return false;
				}
			}
			return false;
		};
		dojox.string.BidiComplex._parse = function (str, pattern) {
			var previous = -1, segmentsPointers = [];
			var delimiters = {FILE_PATH:"/\\:.", URL:"/:.?=&#", XPATH:"/\\:.<>=[]", EMAIL:"<>@.,;"}[pattern];
			switch (pattern) {
			  case "FILE_PATH":
			  case "URL":
			  case "XPATH":
				dojo.forEach(str, function (ch, i) {
					if (delimiters.indexOf(ch) >= 0 && _isCharBeforeBiDiChar(str, i, previous)) {
						previous = i;
						segmentsPointers.push(i);
					}
				});
				break;
			  case "EMAIL":
				var inQuotes = false;
				dojo.forEach(str, function (ch, i) {
					if (ch == "\"") {
						if (_isCharBeforeBiDiChar(str, i, previous)) {
							previous = i;
							segmentsPointers.push(i);
						}
						i++;
						var i1 = str.indexOf("\"", i);
						if (i1 >= i) {
							i = i1;
						}
						if (_isCharBeforeBiDiChar(str, i, previous)) {
							previous = i;
							segmentsPointers.push(i);
						}
					}
					if (delimiters.indexOf(ch) >= 0 && _isCharBeforeBiDiChar(str, i, previous)) {
						previous = i;
						segmentsPointers.push(i);
					}
				});
			}
			return segmentsPointers;
		};
	})();
}
