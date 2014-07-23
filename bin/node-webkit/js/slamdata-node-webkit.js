var PS = PS || {};
PS.Prelude = (function () {
    "use strict";
    var $greater$greater$eq = function (dict) {
        return dict[">>="];
    };
    var $less$bar$greater = function (dict) {
        return dict["<|>"];
    };
    var $less$greater = function (dict) {
        return dict["<>"];
    };
    var $less$less$less = function (dict) {
        return dict["<<<"];
    };
    var $less$dollar$greater = function (dict) {
        return dict["<$>"];
    };
    return {
        "$": $dollar, 
        "#": $hash, 
        "<<<": $less$less$less, 
        "<$>": $less$dollar$greater, 
        "<|>": $less$bar$greater, 
        ">>=": $greater$greater$eq, 
        "<>": $less$greater
    };
})();
var PS = PS || {};
PS.Data_Maybe = (function () {
    "use strict";
    var Nothing = {
        ctor: "Data.Maybe.Nothing", 
        values: [  ]
    };
    var Just = function (value0) {
        return {
            ctor: "Data.Maybe.Just", 
            values: [ value0 ]
        };
    };
    return {
        Nothing: Nothing, 
        Just: Just
    };
})();
var PS = PS || {};
PS.SlamData_NodeWebkit = (function () {
    "use strict";
    var Prelude = PS.Prelude;
    var Data_Function = PS.Data_Function;
    var Data_Maybe = PS.Data_Maybe;
    var Data_Maybe_Unsafe = PS.Data_Maybe_Unsafe;
    var Control_Monad_Eff = PS.Control_Monad_Eff;
    var Debug_Trace = PS.Debug_Trace;
    var Control_Apply = PS.Control_Apply;
    var SlamData = PS.SlamData;
    var child_process = require('child_process');;
    var gui = require('nw.gui');;
    var path = require('path');;
    var platform = process.platform;;
    function replaceState(state) {  return function(title) {    return function(url) {      return function() {        window.history.replaceState(state, title, url);      }    }  }};
    function unsafeEnv(nothing) {  return function(just) {    return function(key) {      var val = process.env[key];      return val === null || val === undefined ? nothing : just(val);    }  }};
    function spawn(proc) {  return function(args) {    return function() {      return child_process.spawn(proc, args);    }  }};
    function joinPath(paths) {  return path.join.apply(null, paths);};
    function guiShell(gui) {  return function() {    return gui.Shell;  }};
    function guiWindow(gui) {  return function() {    return gui.Window.get();  }};
    function openExternal(url) {  return function(shell) {    return function() {      return shell.openExternal(url);    }  }};
    function showDevTools(win) {  return function() {    return win.showDevTools();  }};
    function closeWindow(win) {  return function() {    return win.close(true);  }};
    function kill(child) {  return function() {    return child.kill();  }};
    function stdout(child) {  return child.stdout;};
    function stderr(child) {  return child.stderr;};
    function windowPolicy(method) {  return function(policy) {    return function() {      return policy[method]();    }  }};
    function onEvent(__emitter) {  return function(__variadic) {    return function(event) {      return function(cb) {        return function(child) {          return function() {            return child.on(event, function () {              return cb.apply(this, arguments)();            }.bind(this));          }        }      }    }  }};
    function requireConfig(location) {  return require(location);};
    var $less$div$greater = function (fp) {
        return function (fp$prime) {
            return joinPath([ fp, fp$prime ]);
        };
    };
    var windowHistory = window.history;
    var variadicFn3 = function (_) {
        return {};
    };
    var variadicFn2 = function (_) {
        return {};
    };
    var variadicFn1 = function (_) {
        return {};
    };
    var variadicFn0 = function (_) {
        return {};
    };
    var seJar = $less$div$greater("jar")("slamengine_2.10-0.1-SNAPSHOT-one-jar.jar");
    var onData = function (__dict_EventEmitter_0) {
        return Prelude["<<<"](Prelude.semigroupoidArr({}))(onEvent(__dict_EventEmitter_0)(variadicFn1({}))("data"))(Data_Function.mkFn1);
    };
    var ignore = windowPolicy("ignore");
    var forceNewWindow = windowPolicy("forceNewWindow");
    var forceNewPopup = windowPolicy("forceNewPopup");
    var forceDownload = windowPolicy("forceDownload");
    var forceCurrent = windowPolicy("forceCurrent");
    var eventEmitterStreamStdout = function (_) {
        return {};
    };
    var eventEmitterStreamStderr = function (_) {
        return {};
    };
    var eventEmitterNWWindow = function (_) {
        return {};
    };
    var onCloseNWWindow = Prelude["<<<"](Prelude.semigroupoidArr({}))(onEvent(eventEmitterNWWindow({}))(variadicFn0({}))("close"))(Data_Function.mkFn0);
    var onNewWinPolicy = Prelude["<<<"](Prelude.semigroupoidArr({}))(onEvent(eventEmitterNWWindow({}))(variadicFn3({}))("new-win-policy"))(Data_Function.mkFn3);
    var eventEmitterChildProcess = function (_) {
        return {};
    };
    var env = unsafeEnv(Data_Maybe.Nothing)(Data_Maybe.Just);
    var linuxConfigHome = Prelude["<|>"](Data_Maybe.alternativeMaybe({}))(env("XDG_CONFIG_HOME"))(Prelude["<$>"](Data_Maybe.functorMaybe({}))(function (home) {
        return $less$div$greater(home)(".config");
    })(env("HOME")));
    var resolveConfigDir = (function (_2) {
        if (_2 === "darwin") {
            return $less$div$greater($less$div$greater($less$div$greater(Data_Maybe_Unsafe.fromJust(env("HOME")))("Library"))("Application Support"))("slamdata");
        };
        if (_2 === "linux") {
            return $less$div$greater(Data_Maybe_Unsafe.fromJust(linuxConfigHome))("slamdata");
        };
        if (_2 === "win32") {
            return $less$div$greater(Data_Maybe_Unsafe.fromJust(env("LOCALAPPDATA")))("slamdata");
        };
        throw "Failed pattern match";
    })(platform);
    var sdConfigFile = $less$div$greater(resolveConfigDir)("slamdata-config.json");
    var seConfigFile = $less$div$greater(resolveConfigDir)("slamengine-config.json");
    var main = (function () {
        var sdConfig = requireConfig(sdConfigFile);
        return function __do() {
            var _1 = spawn((sdConfig["node-webkit"]).java)([ "-jar", seJar, seConfigFile ])();
            onData(eventEmitterStreamStdout({}))(Prelude["<<<"](Prelude.semigroupoidArr({}))(Debug_Trace.trace)(Prelude["<>"](Prelude.semigroupString({}))("stdout: ")))(stdout(_1))();
            onData(eventEmitterStreamStderr({}))(Prelude["<<<"](Prelude.semigroupoidArr({}))(Debug_Trace.trace)(Prelude["<>"](Prelude.semigroupString({}))("stderr: ")))(stderr(_1))();
            var _0 = guiWindow(gui)();
            onNewWinPolicy(function (_) {
                return function (url) {
                    return function (policy) {
                        return Control_Apply["*>"](Control_Monad_Eff.applyEff({}))(Prelude[">>="](Control_Monad_Eff.bindEff({}))(guiShell(gui))(openExternal(url)))(ignore(policy));
                    };
                };
            })(_0)();
            onCloseNWWindow(function (_) {
                return Control_Apply["*>"](Control_Monad_Eff.applyEff({}))(Control_Apply["*>"](Control_Monad_Eff.applyEff({}))(kill(_1))(closeWindow(_0)))(Debug_Trace.trace("gone"));
            })(_0)();
            return SlamData.slamData({
                server: {
                    location: sdConfig.server.location, 
                    port: sdConfig.server.port
                }, 
                nodeWebkit: Data_Maybe.Just({
                    java: (sdConfig["node-webkit"]).java
                })
            })();
        };
    })();
    return {
        main: main, 
        seJar: seJar, 
        seConfigFile: seConfigFile, 
        sdConfigFile: sdConfigFile, 
        resolveConfigDir: resolveConfigDir, 
        linuxConfigHome: linuxConfigHome, 
        requireConfig: requireConfig, 
        onNewWinPolicy: onNewWinPolicy, 
        onCloseNWWindow: onCloseNWWindow, 
        onData: onData, 
        onEvent: onEvent, 
        forceNewPopup: forceNewPopup, 
        forceNewWindow: forceNewWindow, 
        forceDownload: forceDownload, 
        forceCurrent: forceCurrent, 
        ignore: ignore, 
        windowPolicy: windowPolicy, 
        stderr: stderr, 
        stdout: stdout, 
        kill: kill, 
        closeWindow: closeWindow, 
        showDevTools: showDevTools, 
        openExternal: openExternal, 
        guiWindow: guiWindow, 
        guiShell: guiShell, 
        "</>": $less$div$greater, 
        joinPath: joinPath, 
        spawn: spawn, 
        env: env, 
        unsafeEnv: unsafeEnv, 
        replaceState: replaceState, 
        windowHistory: windowHistory, 
        window: window, 
        process: process, 
        platform: platform, 
        path: path, 
        gui: gui, 
        "child_process": child_process, 
        eventEmitterChildProcess: eventEmitterChildProcess, 
        eventEmitterNWWindow: eventEmitterNWWindow, 
        eventEmitterStreamStdout: eventEmitterStreamStdout, 
        eventEmitterStreamStderr: eventEmitterStreamStderr, 
        variadicFn0: variadicFn0, 
        variadicFn1: variadicFn1, 
        variadicFn2: variadicFn2, 
        variadicFn3: variadicFn3
    };
})();
PS.SlamData_NodeWebkit.main();
