import {Template} from 'meteor/templating';

Template.form.events({
    'click .js-generate': function (e, template) {

        const tplCount = SelectedAdTemplate.find().count();
        const dataCount = SelectedAdData.find().count();
        let msg = 'No selected ';
        let selected = true;
        if (tplCount == 0 && dataCount == 0) {
            msg += 'Template and Data';
            selected = false;
        } else if (tplCount == 0 && dataCount != 0) {
            msg += 'Template';
            selected = false;
        } else if (tplCount != 0 && dataCount == 0) {
            msg += 'Data';
            selected = false;
        }
        if (!selected) {
            sAlert.warning(msg)
            return;
        }


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