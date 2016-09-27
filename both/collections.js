Templates = new Meteor.Files({
    debug: false,
    collectionName: 'Templates',
    storagePath: '/Users/Msio/adTemplating/templates',
    allowClientCode: false, // Disallow remove files from Client
    onBeforeUpload: function (file) {
        // Allow upload files under 10MB, and only in png/jpg/jpeg formats
        if (file.size <= 1024 * 1024 * 10 && /html/i.test(file.extension)) {
            return true;
        } else {
            return 'Please upload html, with size equal or less than 10MB';
        }
    }
});


Data = new Meteor.Files({
    debug: false,
    collectionName: 'Data',
    storagePath: '/Users/Msio/adTemplating/data',
    allowClientCode: false, // Disallow remove files from Client
    onBeforeUpload: function (file) {
        // Allow upload files under 10MB, and only in png/jpg/jpeg formats
        if (file.size <= 1024 * 1024 * 10 && /xlsx|xls|xlsm/i.test(file.extension)) {
            return true;
        } else {
            return 'Please upload xls,xlsx,xlsm,  with size equal or less than 10MB';
        }
    }
});

Resolutions = new Mongo.Collection('resolutions');