module SlamData.App.Panel.Tab
  ( makeTabName
  , makeCont
  , tabize
  , Tab(..)
  , TabSpec()
  , Action()
  ) where

  import Control.Monad.Eff

  import Data.String
  import Data.Tuple
  import Data.UUID

  import React

  import qualified React.DOM as D

  type Action = UI
  data Tab = Tab { name :: UI
                 , toolbar :: { external :: [Action]
                              , internal :: [Action]
                              }
                 , content :: UI
                 , active :: Boolean
                 }
  type TabSpec =
    { name :: String
    , external :: [Action]
    , internal :: [Action]
    , content :: [UI]
    , ident :: UUID
    }

  makeTabName :: forall p eff state result.
    { name :: String
    , active :: Boolean
    , ident :: UUID
    , activate :: EventHandlerContext eff {} state result
    | p
    }
              -> UI
  makeTabName props =
    D.dd [D.className $ activate "tab" props.active]
         [D.a [ D.href $ "#" ++ (tabize props.ident)
              , D.onClick \_ -> props.activate
              ]
              [D.text props.name]
         ]
  makeCont :: forall eff p. { name :: String
                            , content :: [UI]
                            , external :: [Action]
                            , internal :: [Action]
                            , ident :: UUID
                            | p
                            }
           -> UI
  makeCont props =
    D.div
      [ D.className $ "content active"
      , D.idProp $ tabize props.ident
      ]
      [ D.div [D.className "toolbar button-bar"]
              [ D.ul [D.className "button-group"] props.external
              , D.ul [D.className "button-group"] props.internal
              ]
      , D.hr' []
      , D.div [D.className "actual-content"] props.content
      ]

  activate :: String -> Boolean -> String
  activate s true  = s ++ " active"
  activate s false = s

  tabize :: UUID -> String
  tabize = show >>> removeDashes >>> ((++) "tab-")

  removeDashes :: String -> String
  removeDashes = split "-" >>> joinWith ""