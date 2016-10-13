import {Template} from 'meteor/templating';

import 'bootstrap-fileinput-npm';
import {columns} from '../../../../both/columns.js';
import moment from 'moment';

Template.AdTemplate.events({
    'click .ad-template-input .fileinput-upload-button': function () {
        const uploadInstance = AdTemplates.insert({
            file: this.beforeUpload,
            streams: 'dynamic',
            chunkSize: 'dynamic',
            meta: {
                uploaded: moment().toDate()
            }
        }, false);
        uploadInstance.on('start', function () {
            UIBlock.block('Uploading...');
        });
        uploadInstance.on('uploaded', (err, fileObj)=> {
            if (err) {
                sAlert.error('Upload failed, try again please!');
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
                    //upload successful
                }
            }
            UIBlock.unblock();
        });
        uploadInstance.on('end', (error, fileObj)=> {
            if (error) {
                sAlert.error('Upload failed, try again please!');
            } else if (!fileObj.error) {
                sAlert.success('Template <strong>' + fileObj.name + '</strong> has been uploaded');
                $('.js-ad-template-input').fileinput('reset');
                SelectedAdTemplate.remove({});
            }
            UIBlock.unblock();
        });
        uploadInstance.start();
    },
    'change .js-ad-template-input': function (e) {
        if (e.currentTarget.files && e.currentTarget.files[0]) {
            const file = e.currentTarget.files[0];
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

