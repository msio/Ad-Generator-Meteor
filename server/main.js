import {BrowserPolicy} from 'meteor/browser-policy-common';

Meteor.startup(function () {
    BrowserPolicy.content.allowDataUrlForAll();
    BrowserPolicy.content.allowScriptDataUrl();
    BrowserPolicy.content.allowInlineStyles();
    BrowserPolicy.content.allowInlineScripts();
    BrowserPolicy.content.allowSameOriginForAll();
    BrowserPolicy.framing.allowAll();
    BrowserPolicy.content.allowEval();
    BrowserPolicy.content.allowOriginForAll('*');
    BrowserPolicy.content.allowFontDataUrl();
});

Templates.denyClient();
Meteor.publish('templates.all', function () {
    return Templates.find().cursor;
});


Data.denyClient();
Meteor.publish('data.all', function () {
    return Data.find().cursor;
});
