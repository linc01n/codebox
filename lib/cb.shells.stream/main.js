// Requires
var Q = require('Q');
var _ = require('underscore');

var ss = require('socket.io-stream');
var es = require('event-stream');

var Shell = require('./shell').Shell;


function ShellSocketManager(manager) {
    this.manager = manager;

    _.bindAll(this);
}

ShellSocketManager.prototype.handleStream = function(stream, shellId, opts) {
    // Input data
    var manager = this.manager;

    // Build new shell
    var shell = new Shell(
        manager,
        shellId,
        stream,
        opts
    );

    // Initialize
    shell
    .init()
    .then(function(shell) {
        console.log('created shell =', shell);
    });

    /*
    stream.on('error', function(error) {
        console.error(error);
        console.error(error.stack);
    });
    */
    return stream;
};


function setup(options, imports, register) {
    // Import
    var shellManager = imports.shells.manager;
    var io = imports.socket_io.io;

    var socketManager = new ShellSocketManager(shellManager);

    // Construct
    io.of('/stream/shells').on('connection', function(socket) {
        ss(socket).on('shell.open', function(stream, data) {
            // Open up shell
            socketManager.handleStream(stream, data.shellId, data.opts);
        });
    });

    // Register
    register(null, {});
}

// Exports
module.exports = setup;