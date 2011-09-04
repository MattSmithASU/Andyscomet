dojo.provide("andes.help");
dojo.require("andes.api");
dojo.require("dojo.io.script");
dojo.require("dojox.cometd");
dojo.require("dojox.cometd.timestamp");
dojo.require("dojox.cometd.ack");
dojo.require("dojox.cometd.callbackPollTransport");


(function(){
	
	function handleHelp(result){
		// summary:
		//	Handles text returned from server
		//
		if(!dijit.byId("helpPane")){
			setTimeout(function(){
				handleHelp(result);
			}, 500);
			return;
		}
		var hlp = dijit.byId("helpContentPane");
		dijit.byId("helpPane").open();
		dojo.forEach(result, function(r){
			var c = hlp.get("content");
			// note:
			//	setting to the node and not with attr
			// 	because ContentPane is throwing errors that way
			switch(r.action){
			    case "show-hint-link":
				var fn = r.href ? "link" : "explain",
				val = r.href || r.value;
				hlp.containerNode.innerHTML = c + "\n<p><a href=\"#\" onclick=\"andes.help." + fn + "('" + val + "'); return false\">" + r.text + "</a></p>";
				break;
			    case "show-hint":
				var style = r.style ? " class=\""+ r.style + "\"":"";
				// Student math symbols may be echoed in help statements.
				hlp.containerNode.innerHTML = c + "\n<p" + style +">" + dojox.drawing.util.typeset.convertLaTeX(r.text) + "</p>";
				break;
			    case "echo-get-help-text":
		  		// Escape any html codes on input text echo.
               		        // Should use future function dojo.string.escape
                                // See http://trac.dojotoolkit.org/ticket/8995
				andes.help.echo(r.text.replace(/\&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
				break;
			    case "focus-hint-text-box":
				dijit.focus(dojo.byId("helpInput"));
				break;
			    case "focus-major-principles":
                                dojo.byId("majorModalTreeText").innerHTML = r.text ? "<p class=\"tall\">" + r.text + "</p>\n": "";
			        dijit.byId("majorPrinciples").show();
				break;
			    case "focus-all-principles":
                		dojo.byId("allModalTreeText").innerHTML = "<p class=\"tall\">" + r.text + "</p>\n";
			        dijit.byId("allPrinciples").show();
				break;
			    case "log":
			    default:
				// no-op
			}
		});
		
		hlp.domNode.scrollTop =  hlp.domNode.scrollHeight;
	}

	
	dojo.addOnLoad(function(){
		dojox.cometd.websocketEnabled = true;
		dojox.cometd.init(location.protocol + "//" + location.host);
		var room = {
		    _username: getUrlVars()["u"],
		    receive: function(message){
		    	var from = message.data.user;
		    	var text = message.data.chat;
				var hlp = dijit.byId("helpContentPane");
		    	var c = hlp.get("content");
		    	console.log("received", message);
				hlp.containerNode.innerHTML = c + "\n<p><span class=\"comment\">" + from + ": " + text + "</span></p>";
		    }
		}
		dojox.cometd.subscribe("/" + getUrlVars()["p"] + getUrlVars()["s"], room.receive);
		
		dojox.cometd.publish("/" + getUrlVars()["p"] + getUrlVars()["s"], { user: room._username,
																			membership: 'join', 
																			chat : room._username + " has joined"});
		
		dojo.connect(dijit.byId("helpSubmit"), "onClick", function(){
			var q = dijit.byId("helpInput").get("value"),
			h = q ? {action:"get-help", text:q} : {action:"help-button"};
			
			// Escape any html codes on input text echo.
		        // Should use future function dojo.string.escape
                        // See http://trac.dojotoolkit.org/ticket/8995
			andes.help.echo(q.replace(/\&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"), room._username);
			dijit.byId("helpInput").set("value", "");
			andes.api.help(h).addCallback(handleHelp);
		});
	});

	
	andes.help.echo = function(value,user){
		// summary:
		//	Echo any input text in the Tutor pane.
		//
		if(value == '!'){
			value = "Ha! Doop!";
		}
		if(value.length>0){
		    var hlp = dijit.byId("helpContentPane");
			var c = hlp.get("content");
			// note:
	                //	setting to the node and not with attr
	                // 	because ContentPane is throwing errors that way
      		hlp.containerNode.innerHTML = c + "\n<p><span class=\"comment\">" + user + ": " + value + "</span></p>";
			dojox.cometd.publish("/" + getUrlVars()["p"] + getUrlVars()["s"], {
			    from: user,
		        chat: value
            });
			hlp.domNode.scrollTop = hlp.domNode.scrollHeight;
		}
	};
	
	andes.help.processStep = function(result){
		// summary:
		// look for any help coming back from the server (such as in
		// the results from andes.api.step()
		handleHelp(result);
	};
	
	andes.help.explain = function(s){
		andes.api.help({action:"get-help", value:s}).addCallback(handleHelp);
	};
	
   	andes.help.principles = function(s){
		andes.api.help({action:"principles-menu", value:s}).addCallback(handleHelp);
	};
	
	andes.help.link = function(href){
		// summary:
		//	Calls api after a link in Tutor pane has been clicked.
		dojo.xhrGet({
			url: href,
			handleAs: "text",
			load: function(result){
				// FIXME: This is untested. Should we stuff the content directly into the pane like this?
				dijit.byId("helpContentPane").attr("content", result);
			}
		});
	};
	
	andes.help.score = function(value){
		// summary:
		// updates score
		return dijit.byId("helpPane").score(value);
	};

	andes.help.link = function(name,value){
		var s={type: "tutor-link",name: name};
		if(value){
			s.value=value; // value is optional
		}
		andes.api.recordAction(s);
	};

	function getUrlVars() {
		var vars = {};
		var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) { vars[key] = value;});
		return vars;
	}
		
})();

