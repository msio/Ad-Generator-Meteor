import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { BrowserPolicy } from 'meteor/browser-policy-common';

import './main.html';


Template.uploadedFiles.helpers({
  uploadedFiles: function () {
    console.log(Images.collection.find());
    return Images.find();
  },
  set: function () {
    console.log('this',this);
  }
});

Template.uploadedFiles.events({
  'click .convert': function (e,template) {
    console.log();
    Meteor.call('replacePlaceholders',{
      id:$(e.target).attr('data')
    }, function (err,res) {
       if(err){
         alert(err)
       }else{
         console.log(res);
       }
    });
  }
});


Template.uploadForm.onCreated(function () {
  this.currentUpload = new ReactiveVar(false);
});

Template.uploadForm.helpers({
  currentUpload: function () {
    return Template.instance().currentUpload.get();
  }
});

Template.uploadForm.events({
  'click .convert': function (e,template) {
      console.log('here',this,e, template);
  },
  'change #fileInput': function (e, template) {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      // We upload only one file, in case 
      // there was multiple files selected
      var file = e.currentTarget.files[0];
      if (file) {
        var uploadInstance = Images.insert({
          file: file,
          streams: 'dynamic',
          chunkSize: 'dynamic'
        }, false);

        uploadInstance.on('start', function() {
          template.currentUpload.set(this);
        });

        uploadInstance.on('end', function(error, fileObj) {
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
  }
});