Template.Generated_ads.helpers({
    //add you helpers here
});

Template.Generated_ads.events({
    //add your events here
});

Template.Generated_ads.onCreated(function () {
    this.autorun(()=> {
        this.subscribe('generatedAds.all');
    })
});

Template.Generated_ads.onRendered(function () {
    //add your statement here
});

Template.Generated_ads.onDestroyed(function () {
    //add your statement here
});

