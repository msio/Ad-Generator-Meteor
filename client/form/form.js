import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import {BrowserPolicy} from 'meteor/browser-policy-common';


Template.form.helpers({
    uploadedTemplates: function () {
        return Templates.find();
    },
    uploadedData: function () {
        return Data.find();
    }
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
    'click .js-generate': function (e,template) {
        Meteor.call('replacePlaceholders', {
            template: template.tpl.get()._id,
            data: template.dat.get()._id
        }, function (err, res) {
            if (err) {
                alert(err)
            } else {
                console.log('result',res);
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
    'change .js-data-input': function (e, template) {
        if (e.currentTarget.files && e.currentTarget.files[0]) {
            // We upload only one file, in case
            // there was multiple files selected
            var file = e.currentTarget.files[0];
            if (file) {
                        console.log();
               /* excel2Json(data.path, function (err,output) {
                    if(err){
                        throw error;
                    }else{
                        console.log(output);
                    }
                });*/


                var uploadInstance = Data.insert({
                    file: file,
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
                    }
                    // template.currentUpload.set(false);
                });

                uploadInstance.start();
            }
        }
    },

});