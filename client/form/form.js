import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import {BrowserPolicy} from 'meteor/browser-policy-common';
require('bootstrap-fileinput-npm');

Template.form.helpers({
    uploadedTemplates: function () {
        return Templates.find();
    },
    uploadedData: function () {
        return Data.collection.find();
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
    this.selectedData = new ReactiveVar(null);
    this.tpl = new ReactiveVar(null);
    this.dat = new ReactiveVar(null);
    this.autorun(()=> {
        this.subscribe('templates.all');
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
    selectedDat: function (file) {
        if (Template.instance().selectedData.get() === file._id) {
            Template.instance().dat.set(file);
            return file;
        }
        return null;
    },
    tpl: function () {
        return Template.instance().tpl.get();
    },
    dat: function () {
        return Template.instance().dat.get();
    }
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
                var uploadInstance = Templates.insert({
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

    'click .js-pick-data': function (e, template) {
        template.selectedData.set($(e.target).attr('id'));
    },
    'click .data-input .fileinput-upload-button': function () {
      console.log('upload');
    },
    'change .js-data-input': function (e, template) {
        if (e.currentTarget.files && e.currentTarget.files[0]) {
            var file = e.currentTarget.files[0];

            if (file) {
                var uploadInstance = Data.insert({
                    file: file,
                    streams: 'dynamic',
                    chunkSize: 'dynamic'
                }, false);

                uploadInstance.on('start', function (error, filesObj) {
                    // template.currentUpload.set(this);
                    console.log(error);
                });

                uploadInstance.on('end', function (error, fileObj) {
                    if (error) {
                        alert('Error during upload: ' + error.reason);
                    } else {
                        alert('File "' + fileObj.name + '" successfully uploaded');
                    }
                    // template.currentUpload.set(false);
                });

                uploadInstance.start();
            }
        }
    },

});