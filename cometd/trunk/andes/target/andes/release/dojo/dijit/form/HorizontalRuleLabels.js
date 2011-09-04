/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.HorizontalRuleLabels"]) {
	dojo._hasResource["dijit.form.HorizontalRuleLabels"] = true;
	dojo.provide("dijit.form.HorizontalRuleLabels");
	dojo.require("dijit.form.HorizontalRule");
	dojo.declare("dijit.form.HorizontalRuleLabels", dijit.form.HorizontalRule, {templateString:"<div class=\"dijitRuleContainer dijitRuleContainerH dijitRuleLabelsContainer dijitRuleLabelsContainerH\"></div>", labelStyle:"", labels:[], numericMargin:0, minimum:0, maximum:1, constraints:{pattern:"#%"}, _positionPrefix:"<div class=\"dijitRuleLabelContainer dijitRuleLabelContainerH\" style=\"left:", _labelPrefix:"\"><div class=\"dijitRuleLabel dijitRuleLabelH\">", _suffix:"</div></div>", _calcPosition:function (pos) {
		return pos;
	}, _genHTML:function (pos, ndx) {
		return this._positionPrefix + this._calcPosition(pos) + this._positionSuffix + this.labelStyle + this._labelPrefix + this.labels[ndx] + this._suffix;
	}, getLabels:function () {
		var labels = this.labels;
		if (!labels.length) {
			labels = dojo.query("> li", this.srcNodeRef).map(function (node) {
				return String(node.innerHTML);
			});
		}
		this.srcNodeRef.innerHTML = "";
		if (!labels.length && this.count > 1) {
			var start = this.minimum;
			var inc = (this.maximum - start) / (this.count - 1);
			for (var i = 0; i < this.count; i++) {
				labels.push((i < this.numericMargin || i >= (this.count - this.numericMargin)) ? "" : dojo.number.format(start, this.constraints));
				start += inc;
			}
		}
		return labels;
	}, postMixInProperties:function () {
		this.inherited(arguments);
		this.labels = this.getLabels();
		this.count = this.labels.length;
	}});
}

