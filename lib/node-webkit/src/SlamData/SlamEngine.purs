module SlamData.SlamEngine where

  import Control.Apply ((*>))
  import Control.Monad.Eff (Eff(..))

  import Data.Function (mkFn0, mkFn1, mkFn2, mkFn3, Fn0(), Fn1(), Fn2(), Fn3())
  import Data.Maybe (Maybe(..))
  import Data.Maybe.Unsafe (fromJust)

  import Debug.Trace (trace)

  type FilePath = String

  -- TODO: The majority of this needs to be moved to separate modules.
  -- There's about 200 lines of ffi boilerplate here.

  class EventEmitter e

  instance eventEmitterChildProcess :: EventEmitter ChildProcess
  instance eventEmitterNWWindow :: EventEmitter NWWindow
  instance eventEmitterStreamStdout :: EventEmitter (Stream Stdout)
  instance eventEmitterStreamStderr :: EventEmitter (Stream Stderr)

  class Variadic func ret

  instance variadicFn0 :: Variadic (Fn0 a) a
  instance variadicFn1 :: Variadic (Fn1 a b) b
  instance variadicFn2 :: Variadic (Fn2 a b c) c
  instance variadicFn3 :: Variadic (Fn3 a b c d) d

  foreign import data ChildProcess :: *
  foreign import data IFrame :: *
  foreign import data NWGUI :: *
  foreign import data NWShell :: *
  foreign import data NWWindow :: *
  foreign import data NW :: !
  foreign import data Path :: *
  foreign import data Process :: *
  foreign import data Spawn :: !
  foreign import data Signal :: !
  foreign import data Stream :: ! -> *
  foreign import data Stdout :: !
  foreign import data Stderr :: !
  foreign import data Window :: # *
  foreign import data WindowHistory :: *
  foreign import data WindowPolicy :: *
  foreign import data WindowHistoryEff :: !
  foreign import data WindowPolicyEff :: !

  foreign import child_process
    "var child_process = require('child_process');" :: ChildProcess
  foreign import gui "var gui = require('nw.gui');" :: NWGUI
  foreign import path "var path = require('path');" :: Path
  foreign import platform "var platform = process.platform;" :: String
  foreign import process :: Process
  foreign import window :: {history :: WindowHistory}

  windowHistory :: WindowHistory
  windowHistory = window.history

  foreign import replaceState
    "function replaceState(state) {\
    \  return function(title) {\
    \    return function(url) {\
    \      return function() {\
    \        window.history.replaceState(state, title, url);\
    \      }\
    \    }\
    \  }\
    \}" :: forall eff r
        .  { | r}
        -> String
        -> String
        -> Eff (windowHistory :: WindowHistoryEff | eff) Unit

  foreign import unsafeEnv
    "function unsafeEnv(nothing) {\
    \  return function(just) {\
    \    return function(key) {\
    \      var val = process.env[key];\
    \      return val === null || val === undefined ? nothing : just(val);\
    \    }\
    \  }\
    \}" :: Maybe String -> (String -> Maybe String) -> String -> Maybe String

  env :: String -> Maybe String
  env = unsafeEnv Nothing Just

  foreign import spawn
    "function spawn(proc) {\
    \  return function(args) {\
    \    return function() {\
    \      return child_process.spawn(proc, args);\
    \    }\
    \  }\
    \}" :: forall eff
        .  String
        -> [String]
        -> Eff (spawn :: Spawn | eff) ChildProcess

  foreign import joinPath
    "function joinPath(paths) {\
    \  return path.join.apply(null, paths);\
    \}" :: [String] -> String

  (</>) :: FilePath -> FilePath -> FilePath
  (</>) fp fp' = joinPath [fp, fp']

  foreign import guiShell
    "function guiShell(gui) {\
    \  return function() {\
    \    return gui.Shell;\
    \  }\
    \}" :: forall eff. NWGUI -> Eff (nw :: NW | eff) NWShell

  foreign import guiWindow
    "function guiWindow(gui) {\
    \  return function() {\
    \    return gui.Window.get();\
    \  }\
    \}" :: forall eff. NWGUI -> Eff (nw :: NW | eff) NWWindow

  foreign import openExternal
    "function openExternal(url) {\
    \  return function(shell) {\
    \    return function() {\
    \      return shell.openExternal(url);\
    \    }\
    \  }\
    \}" :: forall eff. String -> NWShell -> Eff (nw :: NW | eff) NWShell

  foreign import showDevTools
    "function showDevTools(win) {\
    \  return function() {\
    \    return win.showDevTools();\
    \  }\
    \}" :: forall eff. NWWindow -> Eff (nw :: NW | eff) NWWindow

  foreign import closeWindow
    "function closeWindow(win) {\
    \  return function() {\
    \    return win.close(true);\
    \  }\
    \}" :: forall eff. NWWindow -> Eff (nw :: NW | eff) NWWindow

  foreign import kill
    "function kill(child) {\
    \  return function() {\
    \    return child.kill();\
    \  }\
    \}" :: forall eff. ChildProcess -> Eff (signal :: Signal | eff) Unit

  foreign import stdout
    "function stdout(child) {\
    \  return child.stdout;\
    \}" :: ChildProcess -> Stream Stdout

  foreign import stderr
    "function stderr(child) {\
    \  return child.stderr;\
    \}" :: ChildProcess -> Stream Stderr

  foreign import windowPolicy
    "function windowPolicy(method) {\
    \  return function(policy) {\
    \    return function() {\
    \      return policy[method]();\
    \    }\
    \  }\
    \}" :: forall eff
        .  String
        -> WindowPolicy
        -> Eff (policy :: WindowPolicyEff | eff) Unit

  ignore         :: forall e. WindowPolicy -> Eff (policy :: WindowPolicyEff | e) Unit
  ignore         = windowPolicy "ignore"
  forceCurrent   :: forall e. WindowPolicy -> Eff (policy :: WindowPolicyEff | e) Unit
  forceCurrent   = windowPolicy "forceCurrent"
  forceDownload  :: forall e. WindowPolicy -> Eff (policy :: WindowPolicyEff | e) Unit
  forceDownload  = windowPolicy "forceDownload"
  forceNewWindow :: forall e. WindowPolicy -> Eff (policy :: WindowPolicyEff | e) Unit
  forceNewWindow = windowPolicy "forceNewWindow"
  forceNewPopup  :: forall e. WindowPolicy -> Eff (policy :: WindowPolicyEff | e) Unit
  forceNewPopup  = windowPolicy "forceNewPopup"

  foreign import onEvent
    "function onEvent(__emitter) {\
    \  return function(__variadic) {\
    \    return function(event) {\
    \      return function(cb) {\
    \        return function(child) {\
    \          return function() {\
    \            return child.on(event, function () {\
    \              return cb.apply(this, arguments)();\
    \            }.bind(this));\
    \          }\
    \        }\
    \      }\
    \    }\
    \  }\
    \}" :: forall eff emitter fn
        .  (EventEmitter emitter, Variadic fn (Eff eff Unit))
        => String
        -> fn
        -> emitter
        -> Eff eff emitter

  onData :: forall eff ioStream
         .  (EventEmitter (Stream ioStream))
         => (String -> Eff eff Unit)
         -> Stream ioStream
         -> Eff eff (Stream ioStream)
  onData = onEvent "data" <<< mkFn1

  onCloseNWWindow :: forall eff
          .  (Unit -> Eff eff Unit)
          -> NWWindow
          -> Eff eff NWWindow
  onCloseNWWindow = onEvent "close" <<< mkFn0

  onNewWinPolicy :: forall eff
          .  (Maybe IFrame -> String -> WindowPolicy -> Eff eff Unit)
          -> NWWindow
          -> Eff eff NWWindow
  onNewWinPolicy = onEvent "new-win-policy" <<< mkFn3

  -- Finally, our actual logic!

  foreign import requireConfig
    "function requireConfig(location) {\
    \  return require(location);\
    \}" :: forall r. FilePath -> { | r}

  linuxConfigHome :: Maybe FilePath
  linuxConfigHome = env "XDG_CONFIG_HOME"
                <|> (\home -> home </> ".config") <$> env "HOME"

  resolveConfigDir :: FilePath
  resolveConfigDir = case platform of
    "darwin" -> fromJust $
      env "HOME" </> "Library" </> "Application Support" </> "slamdata"
    "linux"  -> fromJust linuxConfigHome </> "slamdata"
    "win32"  -> fromJust $ env "LOCALAPPDATA" </> "slamdata"

  sdConfigFile :: FilePath
  sdConfigFile = resolveConfigDir </> "slamdata-config.json"
  seConfigFile :: FilePath
  seConfigFile = resolveConfigDir </> "slamengine-config.json"
  seJar :: FilePath
  seJar = "jar" </> "slamengine_2.10-0.1-SNAPSHOT-one-jar.jar"

  main = do
    let sdConfig = requireConfig sdConfigFile
    let sdServer = sdConfig.server
    -- Pass down the config  to the web page.
    replaceState {} "" $
      "?serverLocation=" ++ sdServer.location ++ "&serverPort=" ++ sdServer.port
    -- Start up SlamEngine.
    se <- spawn sdConfig."node-webkit".java ["-jar", seJar, seConfigFile]
    -- Log out things.
    stdout se # onData (trace <<< (++) "stdout: ")
    stderr se # onData (trace <<< (++) "stderr: ")

    win <- guiWindow gui
    -- Open links in the user's default method, e.g. in the browser.
    onNewWinPolicy (\_ url policy ->
      (guiShell gui >>= openExternal url) *>
      ignore policy) win
    -- Cleanup after ourselves.
    onCloseNWWindow (\_ -> kill se *> closeWindow win *> pure unit) win
