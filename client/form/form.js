import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import {BrowserPolicy} from 'meteor/browser-policy-common';
require('bootstrap-fileinput-npm');

Template.form.helpers({
    uploadedAdTemplates: function () {
        return AdTemplates.find();
    },
    data: function () {
        Data.collection.find().fetch();
    }
});

Template.form.onRendered(function () {
    /*$('.js-data-input').fileinput({
     showUploadedThumbs: false,
     showPreview: false
     });*/
});

Template.form.onCreated(function () {
    this.currentUpload = new ReactiveVar(false);
    this.selectedTemplate = new ReactiveVar(null);
    this.tpl = new ReactiveVar(null);
    this.dataBeforeUpload = null;
    this.autorun(()=> {
        this.subscribe('adTemplates.all');
        this.subscribe('data.all');
    })
});

Template.form.helpers({
    currentUpload: function () {
        return Template.instance().currentUpload.get();
    },
    selectedTpl: function (file) {
        if (Template.instance().selectedTemplate.get() === file._id) {
            Template.instance().tpl.set(file);
            return true;
        }
        return false
    },
    tpl: function () {
        return Template.instance().tpl.get();
    },
});

Template.form.events({
    'click .js-generate': function (e, template) {
        Meteor.call('replacePlaceholders', {
            templateId: template.tpl.get()._id,
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
    'click .js-pick-template': function (e, template) {
        template.selectedTemplate.set($(e.target).attr('id'));
    },
    'change .js-template-input': function (e, template) {
        if (e.currentTarget.files && e.currentTarget.files[0]) {
            // We upload only one file, in case
            // there was multiple files selected
            var file = e.currentTarget.files[0];
            if (file) {
                var uploadInstance = AdTemplates.insert({
                    file: file,
                    streams: 'dynamic',
                    chunkSize: 'dynamic'
                }, false);

                uploadInstance.on('start', function () {
                    template.currentUpload.set(this);
                });

                uploadInstance.on('end', function (error, fileObj) {
                    if (error) {
                        alert('Error during upload: ' + error.reason);
                    } else {
                        alert('File "' + fileObj.name + '" successfully uploaded');
                    }
                    template.currentUpload.set(false);
                });

                uploadInstance.start();
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