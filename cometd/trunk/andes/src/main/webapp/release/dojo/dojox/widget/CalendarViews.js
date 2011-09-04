/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.widget.CalendarViews"]) {
	dojo._hasResource["dojox.widget.CalendarViews"] = true;
	dojo.provide("dojox.widget.CalendarViews");
	dojo.experimental("dojox.widget.CalendarViews");
	dojo.require("dojox.widget.Calendar");
	dojo.declare("dojox.widget._CalendarMonth", null, {constructor:function () {
		this._addView(dojox.widget._CalendarMonthView);
	}});
	dojo.declare("dojox.widget._CalendarMonthView", [dojox.widget._CalendarView, dijit._Templated], {templateString:dojo.cache("dojox.widget", "Calendar/CalendarMonth.html", "<div class=\"dojoxCalendarMonthLabels\" style=\"left: 0px;\"  \n\tdojoAttachPoint=\"monthContainer\" dojoAttachEvent=\"onclick: onClick\">\n	<table cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"margin: auto;\">\n		<tbody>\n			<tr class=\"dojoxCalendarMonthGroupTemplate\">\n				<td class=\"dojoxCalendarMonthTemplate\">\n					<div class=\"dojoxCalendarMonthLabel\"></div>\n				</td>\n			 </tr>\n		</tbody>\n	</table>\n</div>\n"), datePart:"year", headerClass:"dojoxCalendarMonthHeader", postCreate:function () {
		this.cloneClass(".dojoxCalendarMonthTemplate", 3);
		this.cloneClass(".dojoxCalendarMonthGroupTemplate", 2);
		this._populateMonths();
		this.addFx(".dojoxCalendarMonthLabel", this.domNode);
	}, _setValueAttr:function (value) {
		this.header.innerHTML = value.getFullYear();
	}, _getMonthNames:dojox.widget._CalendarMonthYearView.prototype._getMonthNames, _populateMonths:dojox.widget._CalendarMonthYearView.prototype._populateMonths, onClick:function (evt) {
		if (!dojo.hasClass(evt.target, "dojoxCalendarMonthLabel")) {
			dojo.stopEvent(evt);
			return;
		}
		var parentNode = evt.target.parentNode;
		var month = parentNode.cellIndex + (parentNode.parentNode.rowIndex * 4);
		var date = this.get("value");
		date.setMonth(month);
		date.setMonth(month);
		this.onValueSelected(date, month);
	}});
	dojo.declare("dojox.widget._CalendarYear", null, {parent:null, constructor:function () {
		this._addView(dojox.widget._CalendarYearView);
	}});
	dojo.declare("dojox.widget._CalendarYearView", [dojox.widget._CalendarView, dijit._Templated], {templateString:dojo.cache("dojox.widget", "Calendar/CalendarYear.html", "<div class=\"dojoxCalendarYearLabels\" style=\"left: 0px;\" dojoAttachPoint=\"yearContainer\">\n	<table cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"margin: auto;\" dojoAttachEvent=\"onclick: onClick\">\n		<tbody>\n			<tr class=\"dojoxCalendarYearGroupTemplate\">\n				<td class=\"dojoxCalendarNextMonth dojoxCalendarYearTemplate\">\n					<div class=\"dojoxCalendarYearLabel\">\n					</div>\n				</td>\n			</tr>\n		</tbody>\n	</table>\n</div>\n"), displayedYears:6, postCreate:function () {
		this.cloneClass(".dojoxCalendarYearTemplate", 3);
		this.cloneClass(".dojoxCalendarYearGroupTemplate", 2);
		this._populateYears();
		this.addFx(".dojoxCalendarYearLabel", this.domNode);
	}, _setValueAttr:function (value) {
		this._populateYears(value.getFullYear());
	}, _populateYears:dojox.widget._CalendarMonthYearView.prototype._populateYears, adjustDate:function (date, amount) {
		return dojo.date.add(date, "year", amount * 12);
	}, onClick:function (evt) {
		if (!dojo.hasClass(evt.target, "dojoxCalendarYearLabel")) {
			dojo.stopEvent(evt);
			return;
		}
		var year = Number(evt.target.innerHTML);
		var date = this.get("value");
		date.setYear(year);
		this.onValueSelected(date, year);
	}});
	dojo.declare("dojox.widget.Calendar3Pane", [dojox.widget._CalendarBase, dojox.widget._CalendarDay, dojox.widget._CalendarMonth, dojox.widget._CalendarYear], {});
	dojo.declare("dojox.widget.MonthlyCalendar", [dojox.widget._CalendarBase, dojox.widget._CalendarMonth], {_makeDate:function (value) {
		var now = new Date();
		now.setMonth(value);
		return now;
	}});
	dojo.declare("dojox.widget.YearlyCalendar", [dojox.widget._CalendarBase, dojox.widget._CalendarYear], {_makeDate:function (value) {
		var now = new Date();
		now.setFullYear(value);
		return now;
	}});
}

