AdTemplates.denyClient();
Meteor.publish('adTemplates.all', function () {
    return AdTemplates.find().cursor;
});


AdData.denyClient();
Meteor.publish('adData.all', function () {
    return AdData.find().cursor;
});

GeneratedAds.denyClient();
Meteor.publish('generatedAds.all', function () {
    return GeneratedAds.find().cursor;
});

 
