module SlamData.App.Workspace (workspace) where

  import Data.Array

  import React

  import SlamData.App.FileSystem
  import SlamData.App.Notebook

  import SlamData.Helpers

  import qualified React.DOM as D

  workspace :: {} -> UI
  workspace = mkUI spec{ getInitialState = pure {files: []}
                       , componentWillMount = cwm
                       } do
    state <- readState
    pure $ D.div
      [D.idProp "workspace"]
      [D.div  [ D.className "row"
              , D.idProp "main-row"
              ]
              [ D.div
                  [ D.className $ "large-2 medium-3 small-5 columns"
                  , D.idProp "filesystem"
                  ]
                  [filesystem {files: state.files}]
              , D.div
                  [ D.className $ "large-10 medium-9 small-7 columns"
                  , D.idProp "notebook"
                  ]
                  [notebook {files: state.files}]
              ]
      ]
  -- ffi helpers
  serverURI_ = serverURI

  foreign import cwm
    "function cwm() {\
    \  var fetchFS = function() {\
    \    oboe(serverURI_ + '/metadata/fs/')\
    \    .done(function(json) {\
    \      if (this.isMounted()) {\
    \        this.setState({state: {files: json.children}})\
    \      }\
    \    }.bind(this));\
    \  };\
    \  fetchFS();\
    \  setInterval(fetchFS.bind(this), 5000);\
    \}" :: forall a. a