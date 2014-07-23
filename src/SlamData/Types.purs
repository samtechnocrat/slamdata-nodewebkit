module SlamData.Types where

  import Data.Maybe

  type SlamDataConfig =
    { server :: {location :: String, port :: String}
    , nodeWebkit :: Maybe {java :: String}
    }
