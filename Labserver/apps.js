// Setup basic express server
var panel = require('./build/Release/panel.node');
var express = require('express');
var app = express();

var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = 80;


server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

var configured = false, authenticated = false;

io.on('connection', function (socket) {
    var password = "";

    socket.on('new connection', function (data) {
        // fazer acesso ao rlms para autenticar
        //password = data.pass;
        authenticated = true;
        configured = panel.setup();
        if (configured) {

        } else {
            panel.exit();
            panel.setup();
        }

    });

    socket.on('new message', function (data) {
        console.log('new message' + data);
        if (authenticated) {
            console.log(data);
            var sum = 0;
            for (var x = 0; x < 1; x++) {
                sum = sum + (data.sw[x] << x);
            }
            panel.update(sum);
        }

    });

    socket.on('disconnect', function () {
        console.log('disconnected');

        if (configured) {
            panel.update("0");
            configured = authenticated = false;
            panel.exit();

        } else {
            panel.setup();
            panel.update("0");
            panel.exit();
        }
    });

});
