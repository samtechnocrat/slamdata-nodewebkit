var qs = require('querystring')
  , config =
    { serverLocation: 'http://localhost'
    , serverPort: 20223
    , javaLocation: 'java'
    , sePort: 20223
    , seMountPath: '/'
    , seMongoURI: 'mongodb://localhost:27017'
    , seDatabase: 'test'
    }
  , search = qs.stringify(config)
  , index = './index.html'
  , defaultURL = index + '?' + search
  , screenshotDir = 'test/screenshots'
  , actions = require('../actions')
  ;

casper.test.setUp(function(done) {
    casper.start(defaultURL, function() {
        casper.viewport(1280, 720);
        casper.evaluate(function() {
            localStorage.clear();
        });
    }).run(done);
});

casper.test.begin('SQL block labels are unique', 16, function(test) {
    casper.start(defaultURL, function() {
        actions.addNotebook(test);
    }).then(function() {
        actions.addBlock('SQL', test);
        casper.sendKeys( '#notebook .tabs-content .content .actual-content .block textarea'
                       , 'select * from foo limit 10' // we have to force a new collection until SE does it by default.
                       );
        casper.sendKeys( '#notebook .tabs-content .content .actual-content .block textarea'
                       , casper.page.event.key.Enter
                       , {modifiers: 'ctrl'}
                       );
    }).then(function() {
        casper.waitForResource('/data/fs/Untitled.nb/out0', function() {
            actions.addBlock('SQL', test);
            casper.sendKeys( '#notebook .tabs-content .content .actual-content .block textarea'
                           , 'select * from foo limit 10' // we have to force a new collection until SE does it by default.
                           );
            casper.sendKeys( '#notebook .tabs-content .content .actual-content .block textarea'
                           , casper.page.event.key.Enter
                           , {modifiers: 'ctrl'}
                           );
        });
    }).then(function() {
        casper.waitForResource('/data/fs/Untitled.nb/out1', function() {
            actions.addBlock('SQL', test);
            casper.sendKeys( '#notebook .tabs-content .content .actual-content .block textarea'
                           , 'select * from foo limit 10' // we have to force a new collection until SE does it by default.
                           );
            casper.sendKeys( '#notebook .tabs-content .content .actual-content .block textarea'
                           , casper.page.event.key.Enter
                           , {modifiers: 'ctrl'}
                           );
        });
    }).then(function() {
        casper.waitForResource('/data/fs/Untitled.nb/out2', function() {
            casper.capture(screenshotDir + '/sql_block_labels_unique_first.png');
            var labels = casper.getElementsInfo('#notebook .content.active .block-SQL .block-label');
            var labelsText = labels.map(function(label) {return label.text});
            var uniqueLabels = {};
            for (var i = 0; i < labelsText.length; i++) {
                var label = labelsText[i];
                test.assertNot(uniqueLabels[label]);
                uniqueLabels[label] = true;
            };
        });
    }).then(function() {
        casper.sendKeys( '#notebook .tabs-content .content .actual-content .block textarea'
                       , casper.page.event.key.Enter
                       , {modifiers: 'ctrl'}
                       );
        casper.waitForResource('/data/fs/Untitled.nb/out2', function() {
            casper.capture(screenshotDir + '/sql_block_labels_unique_second.png');
            var labels = casper.getElementsInfo('#notebook .content.active .block-SQL .block-label');
            var labelsText = labels.map(function(label) {return label.text});
            var uniqueLabels = {};
            for (var i = 0; i < labelsText.length; i++) {
                var label = labelsText[i];
                test.assertNot(uniqueLabels[label]);
                uniqueLabels[label] = true;
            };
        });
    }).run(function() {
        test.done();
    })
});
