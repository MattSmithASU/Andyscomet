/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.widget.Calendar"]) {
	dojo._hasResource["dojox.widget.Calendar"] = true;
	dojo.provide("dojox.widget.Calendar");
	dojo.experimental("dojox.widget.Calendar");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.require("dijit._Container");
	dojo.declare("dojox.widget._CalendarBase", [dijit._Widget, dijit._Templated, dijit._Container], {templateString:dojo.cache("dojox.widget", "Calendar/Calendar.html", "<div class=\"dojoxCalendar\">\n	<div tabindex=\"0\" class=\"dojoxCalendarContainer\" style=\"visibility: visible;\" dojoAttachPoint=\"container\">\n\t\t<div style=\"display:none\">\n\t\t\t<div dojoAttachPoint=\"previousYearLabelNode\"></div>\n\t\t\t<div dojoAttachPoint=\"nextYearLabelNode\"></div>\n\t\t\t<div dojoAttachPoint=\"monthLabelSpacer\"></div>\n\t\t</div>\n		<div class=\"dojoxCalendarHeader\">\n			<div>\n				<div class=\"dojoxCalendarDecrease\" dojoAttachPoint=\"decrementMonth\"></div>\n			</div>\n			<div class=\"\">\n				<div class=\"dojoxCalendarIncrease\" dojoAttachPoint=\"incrementMonth\"></div>\n			</div>\n			<div class=\"dojoxCalendarTitle\" dojoAttachPoint=\"header\" dojoAttachEvent=\"onclick: onHeaderClick\">\n			</div>\n		</div>\n		<div class=\"dojoxCalendarBody\" dojoAttachPoint=\"containerNode\"></div>\n		<div class=\"\">\n			<div class=\"dojoxCalendarFooter\" dojoAttachPoint=\"footer\">						\n			</div>\n		</div>\n	</div>\n</div>\n"), _views:null, useFx:true, widgetsInTemplate:true, value:new Date(), constraints:null, footerFormat:"medium", constructor:function () {
		this._views = [];
		this.value = new Date();
	}, postMixInProperties:function () {
		var c = this.constraints;
		if (c) {
			var fromISO = dojo.date.stamp.fromISOString;
			if (typeof c.min == "string") {
				c.min = fromISO(c.min);
			}
			if (typeof c.max == "string") {
				c.max = fromISO(c.max);
			}
		}
		this.value = this.parseInitialValue(this.value);
	}, parseInitialValue:function (value) {
		if (!value || value === -1) {
			return new Date();
		} else {
			if (value.getFullYear) {
				return value;
			} else {
				if (!isNaN(value)) {
					if (typeof this.value == "string") {
						value = parseInt(value);
					}
					value = this._makeDate(value);
				}
			}
		}
		return value;
	}, _makeDate:function (value) {
		return value;
	}, postCreate:function () {
		this.displayMonth = new Date(this.get("value"));
		if (this._isInvalidDate(this.displayMonth)) {
			this.displayMonth = new Date();
		}
		var mixin = {parent:this, _getValueAttr:dojo.hitch(this, function () {
			return new Date(this._internalValue || this.value);
		}), _getDisplayMonthAttr:dojo.hitch(this, function () {
			return new Date(this.displayMonth);
		}), _getConstraintsAttr:dojo.hitch(this, function () {
			return this.constraints;
		}), getLang:dojo.hitch(this, function () {
			return this.lang;
		}), isDisabledDate:dojo.hitch(this, this.isDisabledDate), getClassForDate:dojo.hitch(this, this.getClassForDate), addFx:this.useFx ? dojo.hitch(this, this.addFx) : function () {
		}};
		dojo.forEach(this._views, function (widgetType) {
			var widget = new widgetType(mixin, dojo.create("div"));
			this.addChild(widget);
			var header = widget.getHeader();
			if (header) {
				this.header.appendChild(header);
				dojo.style(header, "display", "none");
			}
			dojo.style(widget.domNode, "visibility", "hidden");
			dojo.connect(widget, "onValueSelected", this, "_onDateSelected");
			widget.set("value", this.get("value"));
		}, this);
		if (this._views.length < 2) {
			dojo.style(this.header, "cursor", "auto");
		}
		this.inherited(arguments);
		this._children = this.getChildren();
		this._currentChild = 0;
		var today = new Date();
		this.footer.innerHTML = "Today: " + dojo.date.locale.format(today, {formatLength:this.footerFormat, selector:"date", locale:this.lang});
		dojo.connect(this.footer, "onclick", this, "goToToday");
		var first = this._children[0];
		dojo.style(first.domNode, "top", "0px");
		dojo.style(first.domNode, "visibility", "visible");
		var header = first.getHeader();
		if (header) {
			dojo.style(first.getHeader(), "display", "");
		}
		dojo[first.useHeader ? "removeClass" : "addClass"](this.container, "no-header");
		first.onDisplay();
		var _this = this;
		var typematic = function (nodeProp, dateProp, adj) {
			dijit.typematic.addMouseListener(_this[nodeProp], _this, function (count) {
				if (count >= 0) {
					_this._adjustDisplay(dateProp, adj);
				}
			}, 0.8, 500);
		};
		typematic("incrementMonth", "month", 1);
		typematic("decrementMonth", "month", -1);
		this._updateTitleStyle();
	}, addFx:function (query, fromNode) {
	}, _isInvalidDate:function (value) {
		return !value || isNaN(value) || typeof value != "object" || value.toString() == this._invalidDate;
	}, _setValueAttr:function (value) {
		if (!value) {
			value = new Date();
		}
		if (!value["getFullYear"]) {
			value = dojo.date.stamp.fromISOString(value + "");
		}
		if (this._isInvalidDate(value)) {
			return false;
		}
		if (!this.value || dojo.date.compare(value, this.value)) {
			value = new Date(value);
			this.displayMonth = new Date(value);
			this._internalValue = value;
			if (!this.isDisabledDate(value, this.lang) && this._currentChild == 0) {
				this.value = value;
				this.onChange(value);
			}
			if (this._children && this._children.length > 0) {
				this._children[this._currentChild].set("value", this.value);
			}
			return true;
		}
		return false;
	}, isDisabledDate:function (date, locale) {
		var c = this.constraints;
		var compare = dojo.date.compare;
		return c && (c.min && (compare(c.min, date, "date") > 0) || (c.max && compare(c.max, date, "date") < 0));
	}, onValueSelected:function (date) {
	}, _onDateSelected:function (date, formattedValue, force) {
		this.displayMonth = date;
		this.set("value", date);
		if (!this._transitionVert(-1)) {
			if (!formattedValue && formattedValue !== 0) {
				formattedValue = this.get("value");
			}
			this.onValueSelected(formattedValue);
		}
	}, onChange:function (date) {
	}, onHeaderClick:function (e) {
		this._transitionVert(1);
	}, goToToday:function () {
		this.set("value", new Date());
		this.onValueSelected(this.get("value"));
	}, _transitionVert:function (direction) {
		var curWidget = this._children[this._currentChild];
		var nextWidget = this._children[this._currentChild + direction];
		if (!nextWidget) {
			return false;
		}
		dojo.style(nextWidget.domNode, "visibility", "visible");
		var height = dojo.style(this.containerNode, "height");
		nextWidget.set("value", this.displayMonth);
		if (curWidget.header) {
			dojo.style(curWidget.header, "display", "none");
		}
		if (nextWidget.header) {
			dojo.style(nextWidget.header, "display", "");
		}
		dojo.style(nextWidget.domNode, "top", (height * -1) + "px");
		dojo.style(nextWidget.domNode, "visibility", "visible");
		this._currentChild += direction;
		var height1 = height * direction;
		var height2 = 0;
		dojo.style(nextWidget.domNode, "top", (height1 * -1) + "px");
		var anim1 = dojo.animateProperty({node:curWidget.domNode, properties:{top:height1}, onEnd:function () {
			dojo.style(curWidget.domNode, "visibility", "hidden");
		}});
		var anim2 = dojo.animateProperty({node:nextWidget.domNode, properties:{top:height2}, onEnd:function () {
			nextWidget.onDisplay();
		}});
		dojo[nextWidget.useHeader ? "removeClass" : "addClass"](this.container, "no-header");
		anim1.play();
		anim2.play();
		curWidget.onBeforeUnDisplay();
		nextWidget.onBeforeDisplay();
		this._updateTitleStyle();
		return true;
	}, _updateTitleStyle:function () {
		dojo[this._currentChild < this._children.length - 1 ? "addClass" : "removeClass"](this.header, "navToPanel");
	}, _slideTable:function (widget, direction, callback) {
		var table = widget.domNode;
		var newTable = table.cloneNode(true);
		var left = dojo.style(table, "width");
		table.parentNode.appendChild(newTable);
		dojo.style(table, "left", (left * direction) + "px");
		callback();
		var anim1 = dojo.animateProperty({node:newTable, properties:{left:left * direction * -1}, duration:500, onEnd:function () {
			newTable.parentNode.removeChild(newTable);
		}});
		var anim2 = dojo.animateProperty({node:table, properties:{left:0}, duration:500});
		anim1.play();
		anim2.play();
	}, _addView:function (view) {
		this._views.push(view);
	}, getClassForDate:function (dateObject, locale) {
	}, _adjustDisplay:function (part, amount, noSlide) {
		var child = this._children[this._currentChild];
		var month = this.displayMonth = child.adjustDate(this.displayMonth, amount);
		this._slideTable(child, amount, function () {
			child.set("value", month);
		});
	}});
	dojo.declare("dojox.widget._CalendarView", dijit._Widget, {headerClass:"", useHeader:true, cloneClass:function (clazz, n, before) {
		var template = dojo.query(clazz, this.domNode)[0];
		var i;
		if (!before) {
			for (i = 0; i < n; i++) {
				template.parentNode.appendChild(template.cloneNode(true));
			}
		} else {
			var bNode = dojo.query(clazz, this.domNode)[0];
			for (i = 0; i < n; i++) {
				template.parentNode.insertBefore(template.cloneNode(true), bNode);
			}
		}
	}, _setText:function (node, text) {
		if (node.innerHTML != text) {
			dojo.empty(node);
			node.appendChild(dojo.doc.createTextNode(text));
		}
	}, getHeader:function () {
		return this.header || (this.header = this.header = dojo.create("span", {"class":this.headerClass}));
	}, onValueSelected:function (date) {
	}, adjustDate:function (date, amount) {
		return dojo.date.add(date, this.datePart, amount);
	}, onDisplay:function () {
	}, onBeforeDisplay:function () {
	}, onBeforeUnDisplay:function () {
	}});
	dojo.declare("dojox.widget._CalendarDay", null, {parent:null, constructor:function () {
		this._addView(dojox.widget._CalendarDayView);
	}});
	dojo.declare("dojox.widget._CalendarDayView", [dojox.widget._CalendarView, dijit._Templated], {templateString:dojo.cache("dojox.widget", "Calendar/CalendarDay.html", "<div class=\"dijitCalendarDayLabels\" style=\"left: 0px;\" dojoAttachPoint=\"dayContainer\">\n\t<div dojoAttachPoint=\"header\">\n\t\t<div dojoAttachPoint=\"monthAndYearHeader\">\n\t\t\t<span dojoAttachPoint=\"monthLabelNode\" class=\"dojoxCalendarMonthLabelNode\"></span>\n\t\t\t<span dojoAttachPoint=\"headerComma\" class=\"dojoxCalendarComma\">,</span>\n\t\t\t<span dojoAttachPoint=\"yearLabelNode\" class=\"dojoxCalendarDayYearLabel\"></span>\n\t\t</div>\n\t</div>\n\t<table cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"margin: auto;\">\n\t\t<thead>\n\t\t\t<tr>\n\t\t\t\t<td class=\"dijitCalendarDayLabelTemplate\"><div class=\"dijitCalendarDayLabel\"></div></td>\n\t\t\t</tr>\n\t\t</thead>\n\t\t<tbody dojoAttachEvent=\"onclick: _onDayClick\">\n\t\t\t<tr class=\"dijitCalendarWeekTemplate\">\n\t\t\t\t<td class=\"dojoxCalendarNextMonth dijitCalendarDateTemplate\">\n\t\t\t\t\t<div class=\"dijitCalendarDateLabel\"></div>\n\t\t\t\t</td>\n\t\t\t</tr>\n\t\t</tbody>\n\t</table>\n</div>\n"), datePart:"month", dayWidth:"narrow", postCreate:function () {
		this.cloneClass(".dijitCalendarDayLabelTemplate", 6);
		this.cloneClass(".dijitCalendarDateTemplate", 6);
		this.cloneClass(".dijitCalendarWeekTemplate", 5);
		var dayNames = dojo.date.locale.getNames("days", this.dayWidth, "standAlone", this.getLang());
		var dayOffset = dojo.cldr.supplemental.getFirstDayOfWeek(this.getLang());
		dojo.query(".dijitCalendarDayLabel", this.domNode).forEach(function (label, i) {
			this._setText(label, dayNames[(i + dayOffset) % 7]);
		}, this);
	}, onDisplay:function () {
		if (!this._addedFx) {
			this._addedFx = true;
			this.addFx(".dijitCalendarDateTemplate div", this.domNode);
		}
	}, _onDayClick:function (e) {
		if (typeof (e.target._date) == "undefined") {
			return;
		}
		var date = new Date(this.get("displayMonth"));
		var p = e.target.parentNode;
		var c = "dijitCalendar";
		var d = dojo.hasClass(p, c + "PreviousMonth") ? -1 : (dojo.hasClass(p, c + "NextMonth") ? 1 : 0);
		if (d) {
			date = dojo.date.add(date, "month", d);
		}
		date.setDate(e.target._date);
		if (this.isDisabledDate(date)) {
			dojo.stopEvent(e);
			return;
		}
		this.parent._onDateSelected(date);
	}, _setValueAttr:function (value) {
		this._populateDays();
	}, _populateDays:function () {
		var currentDate = new Date(this.get("displayMonth"));
		currentDate.setDate(1);
		var firstDay = currentDate.getDay();
		var daysInMonth = dojo.date.getDaysInMonth(currentDate);
		var daysInPreviousMonth = dojo.date.getDaysInMonth(dojo.date.add(currentDate, "month", -1));
		var today = new Date();
		var selected = this.get("value");
		var dayOffset = dojo.cldr.supplemental.getFirstDayOfWeek(this.getLang());
		if (dayOffset > firstDay) {
			dayOffset -= 7;
		}
		var compareDate = dojo.date.compare;
		var templateCls = ".dijitCalendarDateTemplate";
		var selectedCls = "dijitCalendarSelectedDate";
		var oldDate = this._lastDate;
		var redrawRequired = oldDate == null || oldDate.getMonth() != currentDate.getMonth() || oldDate.getFullYear() != currentDate.getFullYear();
		this._lastDate = currentDate;
		if (!redrawRequired) {
			dojo.query(templateCls, this.domNode).removeClass(selectedCls).filter(function (node) {
				return node.className.indexOf("dijitCalendarCurrent") > -1 && node._date == selected.getDate();
			}).addClass(selectedCls);
			return;
		}
		dojo.query(templateCls, this.domNode).forEach(function (template, i) {
			i += dayOffset;
			var date = new Date(currentDate);
			var number, clazz = "dijitCalendar", adj = 0;
			if (i < firstDay) {
				number = daysInPreviousMonth - firstDay + i + 1;
				adj = -1;
				clazz += "Previous";
			} else {
				if (i >= (firstDay + daysInMonth)) {
					number = i - firstDay - daysInMonth + 1;
					adj = 1;
					clazz += "Next";
				} else {
					number = i - firstDay + 1;
					clazz += "Current";
				}
			}
			if (adj) {
				date = dojo.date.add(date, "month", adj);
			}
			date.setDate(number);
			if (!compareDate(date, today, "date")) {
				clazz = "dijitCalendarCurrentDate " + clazz;
			}
			if (!compareDate(date, selected, "date") && !compareDate(date, selected, "month") && !compareDate(date, selected, "year")) {
				clazz = selectedCls + " " + clazz;
			}
			if (this.isDisabledDate(date, this.getLang())) {
				clazz = " dijitCalendarDisabledDate " + clazz;
			}
			var clazz2 = this.getClassForDate(date, this.getLang());
			if (clazz2) {
				clazz = clazz2 + " " + clazz;
			}
			template.className = clazz + "Month dijitCalendarDateTemplate";
			template.dijitDateValue = date.valueOf();
			var label = dojo.query(".dijitCalendarDateLabel", template)[0];
			this._setText(label, date.getDate());
			label._date = label.parentNode._date = date.getDate();
		}, this);
		var monthNames = dojo.date.locale.getNames("months", "wide", "standAlone", this.getLang());
		this._setText(this.monthLabelNode, monthNames[currentDate.getMonth()]);
		this._setText(this.yearLabelNode, currentDate.getFullYear());
	}});
	dojo.declare("dojox.widget._CalendarMonthYear", null, {constructor:function () {
		this._addView(dojox.widget._CalendarMonthYearView);
	}});
	dojo.declare("dojox.widget._CalendarMonthYearView", [dojox.widget._CalendarView, dijit._Templated], {templateString:dojo.cache("dojox.widget", "Calendar/CalendarMonthYear.html", "<div class=\"dojoxCal-MY-labels\" style=\"left: 0px;\"\t\n\tdojoAttachPoint=\"myContainer\" dojoAttachEvent=\"onclick: onClick\">\n\t\t<table cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"margin: auto;\">\n\t\t\t\t<tbody>\n\t\t\t\t\t\t<tr class=\"dojoxCal-MY-G-Template\">\n\t\t\t\t\t\t\t\t<td class=\"dojoxCal-MY-M-Template\">\n\t\t\t\t\t\t\t\t\t\t<div class=\"dojoxCalendarMonthLabel\"></div>\n\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t\t<td class=\"dojoxCal-MY-M-Template\">\n\t\t\t\t\t\t\t\t\t\t<div class=\"dojoxCalendarMonthLabel\"></div>\n\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t\t<td class=\"dojoxCal-MY-Y-Template\">\n\t\t\t\t\t\t\t\t\t\t<div class=\"dojoxCalendarYearLabel\"></div>\n\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t\t<td class=\"dojoxCal-MY-Y-Template\">\n\t\t\t\t\t\t\t\t\t\t<div class=\"dojoxCalendarYearLabel\"></div>\n\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t </tr>\n\t\t\t\t\t\t <tr class=\"dojoxCal-MY-btns\">\n\t\t\t\t\t\t \t <td class=\"dojoxCal-MY-btns\" colspan=\"4\">\n\t\t\t\t\t\t \t\t <span class=\"dijitReset dijitInline dijitButtonNode ok-btn\" dojoAttachEvent=\"onclick: onOk\" dojoAttachPoint=\"okBtn\">\n\t\t\t\t\t\t \t \t \t <button\tclass=\"dijitReset dijitStretch dijitButtonContents\">OK</button>\n\t\t\t\t\t\t\t\t </span>\n\t\t\t\t\t\t\t\t <span class=\"dijitReset dijitInline dijitButtonNode cancel-btn\" dojoAttachEvent=\"onclick: onCancel\" dojoAttachPoint=\"cancelBtn\">\n\t\t\t\t\t\t \t \t\t <button\tclass=\"dijitReset dijitStretch dijitButtonContents\">Cancel</button>\n\t\t\t\t\t\t\t\t </span>\n\t\t\t\t\t\t \t </td>\n\t\t\t\t\t\t </tr>\n\t\t\t\t</tbody>\n\t\t</table>\n</div>\n"), datePart:"year", displayedYears:10, useHeader:false, postCreate:function () {
		this.cloneClass(".dojoxCal-MY-G-Template", 5, ".dojoxCal-MY-btns");
		this.monthContainer = this.yearContainer = this.myContainer;
		var yClass = "dojoxCalendarYearLabel";
		var dClass = "dojoxCalendarDecrease";
		var iClass = "dojoxCalendarIncrease";
		dojo.query("." + yClass, this.myContainer).forEach(function (node, idx) {
			var clazz = iClass;
			switch (idx) {
			  case 0:
				clazz = dClass;
			  case 1:
				dojo.removeClass(node, yClass);
				dojo.addClass(node, clazz);
				break;
			}
		});
		this._decBtn = dojo.query("." + dClass, this.myContainer)[0];
		this._incBtn = dojo.query("." + iClass, this.myContainer)[0];
		dojo.query(".dojoxCal-MY-M-Template", this.domNode).filter(function (item) {
			return item.cellIndex == 1;
		}).addClass("dojoxCal-MY-M-last");
		dojo.connect(this, "onBeforeDisplay", dojo.hitch(this, function () {
			this._cachedDate = new Date(this.get("value").getTime());
			this._populateYears(this._cachedDate.getFullYear());
			this._populateMonths();
			this._updateSelectedMonth();
			this._updateSelectedYear();
		}));
		dojo.connect(this, "_populateYears", dojo.hitch(this, function () {
			this._updateSelectedYear();
		}));
		dojo.connect(this, "_populateMonths", dojo.hitch(this, function () {
			this._updateSelectedMonth();
		}));
		this._cachedDate = this.get("value");
		this._populateYears();
		this._populateMonths();
		this.addFx(".dojoxCalendarMonthLabel,.dojoxCalendarYearLabel ", this.myContainer);
	}, _setValueAttr:function (value) {
		if (value && value.getFullYear()) {
			this._populateYears(value.getFullYear());
		}
	}, getHeader:function () {
		return null;
	}, _getMonthNames:function (format) {
		this._monthNames = this._monthNames || dojo.date.locale.getNames("months", format, "standAlone", this.getLang());
		return this._monthNames;
	}, _populateMonths:function () {
		var monthNames = this._getMonthNames("abbr");
		dojo.query(".dojoxCalendarMonthLabel", this.monthContainer).forEach(dojo.hitch(this, function (node, cnt) {
			this._setText(node, monthNames[cnt]);
		}));
		var constraints = this.get("constraints");
		if (constraints) {
			var date = new Date();
			date.setFullYear(this._year);
			var min = -1, max = 12;
			if (constraints.min) {
				var minY = constraints.min.getFullYear();
				if (minY > this._year) {
					min = 12;
				} else {
					if (minY == this._year) {
						min = constraints.min.getMonth();
					}
				}
			}
			if (constraints.max) {
				var maxY = constraints.max.getFullYear();
				if (maxY < this._year) {
					max = -1;
				} else {
					if (maxY == this._year) {
						max = constraints.max.getMonth();
					}
				}
			}
			dojo.query(".dojoxCalendarMonthLabel", this.monthContainer).forEach(dojo.hitch(this, function (node, cnt) {
				dojo[(cnt < min || cnt > max) ? "addClass" : "removeClass"](node, "dijitCalendarDisabledDate");
			}));
		}
		var h = this.getHeader();
		if (h) {
			this._setText(this.getHeader(), this.get("value").getFullYear());
		}
	}, _populateYears:function (year) {
		var constraints = this.get("constraints");
		var dispYear = year || this.get("value").getFullYear();
		var firstYear = dispYear - Math.floor(this.displayedYears / 2);
		var min = constraints && constraints.min ? constraints.min.getFullYear() : firstYear - 10000;
		firstYear = Math.max(min, firstYear);
		this._displayedYear = dispYear;
		var yearLabels = dojo.query(".dojoxCalendarYearLabel", this.yearContainer);
		var max = constraints && constraints.max ? constraints.max.getFullYear() - firstYear : yearLabels.length;
		var disabledClass = "dijitCalendarDisabledDate";
		yearLabels.forEach(dojo.hitch(this, function (node, cnt) {
			if (cnt <= max) {
				this._setText(node, firstYear + cnt);
				dojo.removeClass(node, disabledClass);
			} else {
				dojo.addClass(node, disabledClass);
			}
		}));
		if (this._incBtn) {
			dojo[max < yearLabels.length ? "addClass" : "removeClass"](this._incBtn, disabledClass);
		}
		if (this._decBtn) {
			dojo[min >= firstYear ? "addClass" : "removeClass"](this._decBtn, disabledClass);
		}
		var h = this.getHeader();
		if (h) {
			this._setText(this.getHeader(), firstYear + " - " + (firstYear + 11));
		}
	}, _updateSelectedYear:function () {
		this._year = String((this._cachedDate || this.get("value")).getFullYear());
		this._updateSelectedNode(".dojoxCalendarYearLabel", dojo.hitch(this, function (node, idx) {
			return this._year !== null && node.innerHTML == this._year;
		}));
	}, _updateSelectedMonth:function () {
		var month = (this._cachedDate || this.get("value")).getMonth();
		this._month = month;
		this._updateSelectedNode(".dojoxCalendarMonthLabel", function (node, idx) {
			return idx == month;
		});
	}, _updateSelectedNode:function (query, filter) {
		var sel = "dijitCalendarSelectedDate";
		dojo.query(query, this.domNode).forEach(function (node, idx, array) {
			dojo[filter(node, idx, array) ? "addClass" : "removeClass"](node.parentNode, sel);
		});
		var selMonth = dojo.query(".dojoxCal-MY-M-Template div", this.myContainer).filter(function (node) {
			return dojo.hasClass(node.parentNode, sel);
		})[0];
		if (!selMonth) {
			return;
		}
		var disabled = dojo.hasClass(selMonth, "dijitCalendarDisabledDate");
		dojo[disabled ? "addClass" : "removeClass"](this.okBtn, "dijitDisabled");
	}, onClick:function (evt) {
		var clazz;
		var _this = this;
		var sel = "dijitCalendarSelectedDate";
		function hc(c) {
			return dojo.hasClass(evt.target, c);
		}
		if (hc("dijitCalendarDisabledDate")) {
			dojo.stopEvent(evt);
			return false;
		}
		if (hc("dojoxCalendarMonthLabel")) {
			clazz = "dojoxCal-MY-M-Template";
			this._month = evt.target.parentNode.cellIndex + (evt.target.parentNode.parentNode.rowIndex * 2);
			this._cachedDate.setMonth(this._month);
			this._updateSelectedMonth();
		} else {
			if (hc("dojoxCalendarYearLabel")) {
				clazz = "dojoxCal-MY-Y-Template";
				this._year = Number(evt.target.innerHTML);
				this._cachedDate.setYear(this._year);
				this._populateMonths();
				this._updateSelectedYear();
			} else {
				if (hc("dojoxCalendarDecrease")) {
					this._populateYears(this._displayedYear - 10);
					return true;
				} else {
					if (hc("dojoxCalendarIncrease")) {
						this._populateYears(this._displayedYear + 10);
						return true;
					} else {
						return true;
					}
				}
			}
		}
		dojo.stopEvent(evt);
		return false;
	}, onOk:function (evt) {
		dojo.stopEvent(evt);
		if (dojo.hasClass(this.okBtn, "dijitDisabled")) {
			return false;
		}
		this.onValueSelected(this._cachedDate);
		return false;
	}, onCancel:function (evt) {
		dojo.stopEvent(evt);
		this.onValueSelected(this.get("value"));
		return false;
	}});
	dojo.declare("dojox.widget.Calendar2Pane", [dojox.widget._CalendarBase, dojox.widget._CalendarDay, dojox.widget._CalendarMonthYear], {});
	dojo.declare("dojox.widget.Calendar", [dojox.widget._CalendarBase, dojox.widget._CalendarDay, dojox.widget._CalendarMonthYear], {});
	dojo.declare("dojox.widget.DailyCalendar", [dojox.widget._CalendarBase, dojox.widget._CalendarDay], {_makeDate:function (value) {
		var now = new Date();
		now.setDate(value);
		return now;
	}});
	dojo.declare("dojox.widget.MonthAndYearlyCalendar", [dojox.widget._CalendarBase, dojox.widget._CalendarMonthYear], {});
}

