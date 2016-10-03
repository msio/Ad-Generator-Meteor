import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import {BrowserPolicy} from 'meteor/browser-policy-common';
require('bootstrap-fileinput-npm');
import {columns} from '../../both/columns.js';
import {validateSpreadsheet} from '../../both/validations.js';

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
                sAlert.success('Template <strong>fileObj.name</strong> has been uploaded');
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
        const uploadInstance = Data.insert({
            file: this.dataBeforeUpload,
            streams: 'dynamic',
            chunkSize: 'dynamic'
        }, false);

        const reader = new FileReader();
        reader.onload = (e) => {
            const res = validateSpreadsheet(e.target.result);
            if (res.name === 'excel-data') {
                Modal.show('Error_spreadsheet_modal', {
                    error: error,
                    definedCols: columns,
                    fileName: this.dataBeforeUpload.name
                });
            } else {
                uploadInstance.start();
            }
        };
        reader.error = (e)=> {
            //TODO alert
            console.log(e);
            // alert error
        };
        reader.readAsBinaryString(this.dataBeforeUpload);
        uploadInstance.on('end', (error, fileObj) => {
            if (error) {
                console.log(error);
                alert('error')
            } else {
                sAlert.success('Excel Spreadsheet <strong>' + fileObj.name + '</strong> has been uploaded');
                SelectedData.remove({});
                $('.js-data-input').fileinput('reset');
            }
        });
    },
    'change .js-data-input': function (e) {
        if (e.currentTarget.files && e.currentTarget.files[0]) {
            var file = e.currentTarget.files[0];
            if (file) {
                this.dataBeforeUpload = file;
            }
        }
    }
    ,

})
;