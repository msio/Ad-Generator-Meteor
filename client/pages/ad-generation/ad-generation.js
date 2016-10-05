import {Template} from 'meteor/templating';

Template.form.events({
    'click .js-generate': function (e, template) {
        Meteor.call('replacePlaceholders', {
            //single selection mode therefore there is only one ad template id in the local collection
            adTemplateId: SelectedAdTemplate.find().fetch()[0].adTemplateId,
            spreadsheetId: SelectedAdData.find().fetch()[0].dataId
        }, function (err, res) {
            if (err) {
                console.log(err);
            } else {
                console.log('result', res);
            }
        });
    }
})
;