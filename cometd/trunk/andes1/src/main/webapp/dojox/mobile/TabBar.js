dojo.provide("dojox.mobile.TabBar");

dojo.require("dojox.mobile");

dojo.declare(
	"dojox.mobile.TabBar",
	[dijit._WidgetBase, dijit._Container, dijit._Contained],
{
	iconBase: "",
	iconPos: "",
	barType: "tabBar", // "tabBar"(default) or "segmentedControl"
	inHeading: false,
	tag: "UL",

	_fixedButtonWidth: 76,
	_fixedButtonMargin: 17,
	_largeScreenWidth: 500,

	buildRendering: function(){
		this._clsName = this.barType == "segmentedControl" ? "mblTabButton" : "mblTabBarButton";
		this.domNode = this.containerNode = this.srcNodeRef || dojo.create(this.tag);
		this.domNode.className = this.barType == "segmentedControl" ? "mblTabPanelHeader" : "mblTabBar";
	},

	startup: function(){
		if(this._started){ return; }
		var _this = this;
		setTimeout(function(){ // to get proper dimension
			var parent = _this.getParent && _this.getParent();
			if(!parent || !parent.resize){ // top level widget
				_this.resize();
			}
		}, 0);
		this.inherited(arguments);
	},

	resize: function(){
		var i;
		var w = dojo.contentBox(this.domNode).w;
		var bw = this._fixedButtonWidth;
		var bm = this._fixedButtonMargin;

		var children = this.containerNode.childNodes;
		var arr = [];
		for(i = 0; i < children.length; i++){
			var c = children[i];
			if(c.nodeType != 1){ continue; }
			if(dojo.hasClass(c, this._clsName)){
				arr.push(c);
			}
		}

		var margin;
		if(this.barType == "segmentedControl"){
			margin = w;
			var totalW = 0; // total width of all the buttons
			for(i = 0; i < arr.length; i++){
				margin -= dojo.marginBox(arr[i]).w;
				arr[i].style.marginTop = "3px";
				totalW += arr[i].offsetWidth;
			}
			margin = Math.floor(margin/2);
			var parent = this.getParent();
			var inHeading = this.inHeading || parent instanceof dojox.mobile.Heading;
			this.containerNode.style.padding = "3px 0px 0px " + (inHeading ? 0 : margin) + "px";
			if(inHeading){
				dojo.style(this.domNode, {
					background: "none",
					border: "none",
					width: totalW + 2 + "px"
				});
			}
		}else{
			margin = Math.floor((w - (bw + bm * 2) * arr.length) / 2);
			if(w < this._largeScreenWidth || margin < 0){
				// If # of buttons is 4, for example, assign "25%" to each button.
				// More precisely, 1%(left margin) + 98%(bar width) + 1%(right margin)
				for(i = 0; i < arr.length; i++){
					arr[i].style.width = Math.round(98/arr.length) + "%";
					arr[i].style.margin = "0px";
				}
				this.containerNode.style.padding = "0px 0px 0px 1%";
			}else{
				// Fixed width buttons. Mainly for larger screen such as iPad.
				for(i = 0; i < arr.length; i++){
					arr[i].style.width = bw + "px";
					arr[i].style.margin = "0 " + bm + "px";
				}
				this.containerNode.style.padding = "0px 0px 0px " + margin + "px";
			}
		}
	}
});

dojo.declare(
	"dojox.mobile.TabBarButton",
	dojox.mobile.AbstractItem,
{
	icon1: "", // unselected (dark) icon
	icon2: "", // selected (highlight) icon
	iconPos1: "", // unselected (dark) icon position
	iconPos2: "", // selected (highlight) icon position
	selected: false,
	transition: "none",
	tag: "LI",
	selectOne: true,

	inheritParams: function(){
		var parent = this.getParent();
		this.parent = parent;
		if(parent){
			if(!this.transition){ this.transition = parent.transition; }
			if(!this.icon1){ this.icon1 = parent.iconBase; }
			if(!this.iconPos1){ this.iconPos1 = parent.iconPos; }
			if(!this.icon2){ this.icon2 = parent.iconBase || this.icon1; }
			if(!this.iconPos2){ this.iconPos2 = parent.iconPos || this.iconPos1; }
		}
	},

	buildRendering: function(){
		this.inheritParams();

		this.anchorNode = dojo.create("A", {className:"mblTabBarButtonAnchor"});
		var a = this.anchorNode;
		this.connect(a, "onclick", "onClick");

		var div = dojo.create("DIV", {className:"mblTabBarButtonDiv"}, a);
		var divInner = dojo.create("DIV", {className:"mblTabBarButtonDiv mblTabBarButtonDivInner"}, div);

		this.img1 = dojo.create("IMG", {className:"mblTabBarButtonIcon", src:this.icon1}, divInner);
		this.img1.style.visibility = this.selected ? "hidden" : "";
		dojox.mobile.setupIcon(this.img1, this.iconPos1);
		this.img1.onload = function(){
			// iPhone and Windows Safari sometimes fail to draw icon images.
			// For some reason, this code solves the problem.
			// Other browsers, including Chrome, do not have this problem.
			this.style.width = this.width + "px";
			this.style.height = this.height + "px";
		};

		this.img2 = dojo.create("IMG", {className:"mblTabBarButtonIcon", src:this.icon2}, divInner);
		this.img2.style.visibility = this.selected ? "" : "hidden";
		dojox.mobile.setupIcon(this.img2, this.iconPos2);
		this.img2.onload = function(){
			this.style.width = this.width + "px";
			this.style.height = this.height + "px";
		};

		this.box = dojo.create("DIV", {className:"mblTabBarButtonTextBox"}, a);
		var box = this.box;
		var r = this.srcNodeRef;
		if(r){
			for(var i = 0, len = r.childNodes.length; i < len; i++){
				var n = r.firstChild;
				if(n.nodeType === 3){
					n.nodeValue = this._cv(n.nodeValue);
				}
				box.appendChild(n);
			}
		}
		if(this.label){
			box.appendChild(dojo.doc.createTextNode(this._cv(this.label)));
		}

		this.domNode = this.srcNodeRef || dojo.create(this.tag);
		this.containerNode = this.domNode;
		var _clsName = this.parent ? this.parent._clsName : "mblTabBarButton";
		dojo.addClass(this.domNode, _clsName + (this.selected ? " mblTabButtonSelected" : ""));
		this.domNode.appendChild(a);
		if(this.domNode.className.indexOf("mblDomButton") != -1){
			var domBtn = dojo.create("DIV", null, a);
			dojox.mobile.createDomButton(this.domNode, null, domBtn);
			dojo.addClass(this.domNode, "mblTabButtonDomButton");
		}
	},

	startup: function(){
		if(this._started){ return; }
		var parent = this.getParent();
		this.parent = parent;
		if(parent && parent.barType == "segmentedControl"){
			// proper className may not be set when created dynamically
			dojo.removeClass(this.domNode, "mblTabBarButton");
			dojo.addClass(this.domNode, parent._clsName);
			this.box.className = "";
		}
		this.inherited(arguments);
	},

	select: function(deselect){
		if(deselect){
			this.selected = false;
			dojo.removeClass(this.domNode, "mblTabButtonSelected");
		}else{
			this.selected = true;
			dojo.addClass(this.domNode, "mblTabButtonSelected");
			for(var i = 0, c = this.domNode.parentNode.childNodes; i < c.length; i++){
				if(c[i].nodeType != 1){ continue; }
				var w = dijit.byNode(c[i]); // sibling widget
				if(w && w != this){
					w.select(true);
				}
			}
		}
		this.img1.style.visibility = this.selected ? "hidden" : "";
		this.img2.style.visibility = this.selected ? "" : "hidden";
	},

	onClick: function(e){
		this.defaultClickAction();
	}
});