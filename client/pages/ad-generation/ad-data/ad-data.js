require('bootstrap-fileinput-npm');
import {columns} from '../../../../both/columns.js';
import {validateSpreadsheet} from '../../../../both/validations.js';
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

        const reader = new FileReader();
        reader.onload = (e) => {
            const res = validateSpreadsheet(e.target.result);
            if (res.name === 'excel-data') {
                Modal.show('Error_spreadsheet_modal', {
                    error: error,
                    definedCols: columns,
                    fileName: this.beforeUpload.name
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
        reader.readAsBinaryString(this.beforeUpload);
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

Template.AdData.onRendered(function () {
    //add your statement here
});

Template.AdData.onDestroyed(function () {
    //add your statement here
});

