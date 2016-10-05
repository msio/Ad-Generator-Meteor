Template.Adgenration_table_generatedAds_action.helpers({
    file: function () {
        return Template.instance().file.get();
    }
});

Template.Adgenration_table_generatedAds_action.events({
    'click .js-remove': function (e, tpl) {
    GeneratedAds.remove({_id: this._id}, (err)=> {
        if (err) {
            console.log(err);
        } else {
            console.log('removed');
        }
    });
}
});

Template.Adgenration_table_generatedAds_action.onCreated(function () {
    this.file = new ReactiveVar(GeneratedAds.findOne({_id: this.data._id}));
});

Template.Adgenration_table_generatedAds_action.onRendered(function () {
    //add your statement here
});

Template.Adgenration_table_generatedAds_action.onDestroyed(function () {
    //add your statement here
});

