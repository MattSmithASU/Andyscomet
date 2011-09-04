/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["andes.rpc"]) {
	dojo._hasResource["andes.rpc"] = true;
	dojo.provide("andes.rpc");
	dojo.require("dojox.rpc.Service");
	dojo.require("dojox.rpc.JsonRPC");
	dojo.require("dojox.json.schema");
	andes.rpc = new dojox.rpc.Service(dojo.moduleUrl("andes", "andes3.smd"));
}

