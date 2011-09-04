//dojo.require("dojox.cometd");

/*
dojo.ready(function(){
            alert("Dojo version " + dojo.version + " is loaded");
        });

        

dojo.addOnLoad(function()
{
	dojo.byId("andes").innerHTML="addOnLoad dojoById Jadiel";
});

dojo.addOnLoad(function()
{
    var _connected = false;

    function _connectionSucceeded()
    {
        dojo.byId('andes').innerHTML = 'CometD Connection Succeeded';
    }

    function _connectionBroken()
    {
        dojo.byId('andes').innerHTML = 'CometD Connection Broken';
    }

    function _metaConnect(message)
    {
        var wasConnected = _connected;
        _connected = message.successful === true;
        if (!wasConnected && _connected)
        {
            _connectionSucceeded();
        }
        else if (wasConnected && !_connected)
        {
            _connectionBroken();
        }
    }

    var cometd = dojox.cometd;

    // Disconnect when the page unloads
    dojo.addOnUnload(function()
    {
        cometd.disconnect();
    });

    var cometURL = location.protocol + "//" + location.host + config.contextPath + "/cometd";
    cometd.configure({
        url: cometURL,
        logLevel: 'debug'
    });

    cometd.addListener('/meta/connect', _metaConnect);

    cometd.handshake();
});


*/
