/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["andes.messages"]) {
	dojo._hasResource["andes.messages"] = true;
	dojo.provide("andes.messages");
	andes.messages = {server:function () {
		return {title:"Server Error", message:"The server reported an error:", action:"You will need to click the browser refresh button and try again."};
	}, general:function () {
		return {title:"General Error", message:"The server reported an error:", action:"You will need to click the browser refresh button and try again."};
	}, connection:function (amt) {
		return {title:"Connection Error", message:"The connection to the server failed and couldn't be re-established after retrying " + amt + " times; giving up.", action:"Check your internet connection and try again. There also may be server problems that will be corrected in a few minutes."};
	}};
}

