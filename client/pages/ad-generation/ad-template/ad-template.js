import {Template} from 'meteor/templating';
require('bootstrap-fileinput-npm');
import {columns} from '../../../../both/columns.js';

Template.AdTemplate.events({
    'click .ad-template-input .fileinput-upload-button': function () {
        const uploadInstance = AdTemplates.insert({
            file: this.beforeUpload,
            streams: 'dynamic',
            chunkSize: 'dynamic'
        }, false);
        uploadInstance.on('start', function () {
            // template.currentUpload.set(this);
        });
        uploadInstance.on('uploaded', (err, fileObj)=> {
            if (err) {
                console.log('uploaded', err);
            } else {
                if (fileObj.error) {
                    if (fileObj.error.name === 'placeholders-validation') {
                        Modal.show('Error_template', {
                            error: fileObj.error,
                            definedCols: columns,
                            fileName: fileObj.name
                        });
                    } else if (fileObj.error.name === 'duplicate-file-name') {
                        sAlert.warning('Template file name <strong>' + fileObj.name + '</strong> already exists');
                    }
                } else {

                }
            }
            return false;
        });
        uploadInstance.on('end', function (error, fileObj) {
            if (error) {
                alert('Error during upload: ' + error.reason);
            } else if (!fileObj.error) {
                sAlert.success('Template <strong>' + fileObj.name + '</strong> has been uploaded');
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
                this.beforeUpload = file;
            }
        }
    }
});

Template.AdTemplate.onCreated(function () {
    this.beforeUpload = null;
    this.autorun(()=> {
        this.subscribe('adTemplates.all');
    })
});

Template.AdTemplate.onRendered(function () {
    //add your statement here
});

Template.AdTemplate.onDestroyed(function () {
    //add your statement here
});

