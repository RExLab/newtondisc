// Setup basic express server
var panel = require('./build/Release/panel.node');
var express = require('express');
var app = express();

var server = require('http').createServer(app);
var io = require('socket.io')(server);

var Auth = require('./auth.js');

// usar arquivo de configuracao
var secret = '';
var port = 80;
var ssi_address = 'relle.ufsc.br:8080';
var lab_id = 9;


server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

var configured = false;

io.on('connection', function (socket) {
    var password = "";

    var auth = new Auth(ssi_address, secret, lab_id)

    socket.on('new connection', function (data) {
        console.log('new connection ', data, new Date());

        if (typeof (data.pass) === 'undefined') {
            socket.emit('err', {code: 402, message: 'Missing authentication token.'});
            console.log('erro 402');
            return;
        }

        var ev = auth.Authorize(data.pass);

        ev.on("not authorized", function () {
            socket.emit('err', {code: 403, message: 'Permission denied. Note: Resource is using external scheduling system.'});
            console.log('not authorized');
            return;
        })

        ev.on("authorized", function () {

            configured = panel.setup();
            if (!configured) {
                panel.exit();
                panel.setup();
            }

        })

    });


    socket.on('new message', function (data) {

        if (!auth.isAuthorized()) {
            socket.emit('err', {code: 403, message: 'Permission denied. Note: Resource is using external scheduling system.'});
            console.log('erro 403');
            return;
        }

        console.log('new message' + data);

        console.log(data);
        var sum = 0;
        for (var x = 0; x < 1; x++) {
            sum = sum + (data.sw[x] << x);
        }
        panel.update(sum);


    });

    socket.on('disconnect', function () {
        if (!auth.isAuthorized()) {
            socket.emit('err', {code: 403, message: 'Permission denied. Note: Resource is using external scheduling system.'});
            console.log('erro 403');
            return;
        }

        console.log('disconnected', new Date());

        if (configured) {
            panel.update("0");
            configured = false;
            panel.exit();

        } else {
            panel.setup();
            panel.update("0");
            panel.exit();
        }
    });

});
