import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import {BrowserPolicy} from 'meteor/browser-policy-common';
require('bootstrap-fileinput-npm');

Template.form.helpers({
    /*currentUpload: function () {
     return Template.instance().currentUpload.get();
     }*/
});

Template.form.onRendered(function () {
    /*$('.js-data-input').fileinput({
     showUploadedThumbs: false,
     showPreview: false
     });*/
});

Template.form.onCreated(function () {
    this.currentUpload = new ReactiveVar(false);
    this.dataBeforeUpload = null;
    this.adTemplateBeforeUpload = null;
    this.autorun(()=> {
        this.subscribe('adTemplates.all');
        this.subscribe('data.all');
    })
});

Template.form.events({
    'click .js-generate': function (e, template) {
        Meteor.call('replacePlaceholders', {
            //single selection mode therefore there is only one ad template id in the local collection
            adTemplateId: SelectedAdTemplate.find().fetch()[0].adTemplateId,
            spreadsheetId: SelectedData.find().fetch()[0].dataId
        }, function (err, res) {
            if (err) {
                console.log(err);
                alert(err)
            } else {
                console.log('result', res);
            }
        });
    },
    'click .ad-template-input .fileinput-upload-button': function () {
        var uploadInstance = AdTemplates.insert({
            file: this.adTemplateBeforeUpload,
            streams: 'dynamic',
            chunkSize: 'dynamic'
        }, false);

        uploadInstance.on('start', function () {
            // template.currentUpload.set(this);
        });

        uploadInstance.on('end', function (error, fileObj) {
            if (error) {
                alert('Error during upload: ' + error.reason);
            } else {
                alert('File "' + fileObj.name + '" successfully uploaded');
                $('.js-ad-template-input').fileinput('reset');
                SelectedAdTemplate.remove({});
            }
            // template.currentUpload.set(false);
        });

        uploadInstance.start();
    },
    'change .js-ad-template-input': function (e) {
        if (e.currentTarget.files && e.currentTarget.files[0]) {
            var file = e.currentTarget.files[0];
            if (file) {
                this.adTemplateBeforeUpload = file;
            }
        }
    },

    'click .data-input .fileinput-upload-button': function () {
        var uploadInstance = Data.insert({
            file: this.dataBeforeUpload,
            streams: 'dynamic',
            chunkSize: 'dynamic'
        }, false);

        uploadInstance.on('start', function (error, filesObj) {
            // template.currentUpload.set(this);
        });

        uploadInstance.on('end', function (error, fileObj) {
            if (error) {
                alert('Error during upload: ' + error.reason);
            } else {
                alert('File "' + fileObj.name + '" successfully uploaded');
                $('.js-data-input').fileinput('reset');
                SelectedData.remove({});
            }
            // template.currentUpload.set(false);
        });

        uploadInstance.start();
    },
    'change .js-data-input': function (e) {
        if (e.currentTarget.files && e.currentTarget.files[0]) {
            var file = e.currentTarget.files[0];
            if (file) {
                this.dataBeforeUpload = file;
            }
        }
    },

});