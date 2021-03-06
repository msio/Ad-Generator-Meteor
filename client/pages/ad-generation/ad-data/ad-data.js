import {Template} from 'meteor/templating';

import 'bootstrap-fileinput-npm';
import {columns} from '../../../../both/columns.js';
import moment from 'moment';

Template.AdData.events({
    'click .data-input .fileinput-upload-button': function () {
        const uploadInstance = AdData.insert({
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
                    if (fileObj.error.name === 'excel-data') {
                        Modal.show('Error_spreadsheet_modal', {
                            error: fileObj.error,
                            definedCols: columns,
                            fileName: this.beforeUpload.name
                        });
                    } else if (fileObj.error.name === 'duplicate-file-name') {
                        sAlert.warning('Excel file name <strong>' + fileObj.name + '</strong> already exists');
                    }
                } else {
                    //upload successful
                }
            }
            UIBlock.unblock();
        });
        uploadInstance.on('end', (error, fileObj) => {
            if (error) {
                sAlert.error('Upload failed, try again please!');
            } else if (!fileObj.error) {
                sAlert.success('Excel Spreadsheet <strong>' + fileObj.name + '</strong> has been uploaded');
                $('.js-data-input').fileinput('reset');
                SelectedAdData.remove({});
            }
            UIBlock.unblock();
        });
        uploadInstance.start();
    },
    'change .js-data-input': function (e) {
        if (e.currentTarget.files && e.currentTarget.files[0]) {
            const file = e.currentTarget.files[0];
            if (file) {
                this.beforeUpload = file;
            }
        }
    }
});

Template.AdData.onCreated(function () {
    this.beforeUpload = null;
    this.autorun(()=> {
        this.subscribe('adData.all');
    })
});

