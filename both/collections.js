import moment from 'moment';

if (Meteor.isServer) {
import
    Future
    from
    'fibers/future';
import
    {
        columns
    }
    from
    './columns.js';
}

GeneratedAds = new Meteor.Files({
    debug: false,
    collectionName: 'GeneratedAds',
    allowClientCode: true
});

AdTemplates = new Meteor.Files({
    debug: false,
    collectionName: 'AdTemplates',
    storagePath: function () {
        return Meteor.isServer && Meteor.settings.private.adTemplatesPath;
    },
    allowClientCode: true,
    namingFunction: function (file) {
        //only file name without .html extension
        return file.name.substring(0, file.name.length - 5);
    },
    onBeforeUpload: function (file) {
        if (file.size > 1024 * 1024 * 10 || !/html/i.test(file.extension)) {
            return 'Please upload html, with size equal or less than 10MB';
        }
        const regex = /(\d+)(\x|\X)(\d+)/g;
        const matches = file.name.match(regex);
        if (matches.length === 0) {
            return 'no-size-available'
        }
        if (matches.length > 1) {
            return 'no-unique-size'
        }
        file.resolution = matches[0];
        return true;

    },
    onAfterUpload: function (fileRef) {
        //check if the file name already exist
        const foundedTpl = AdTemplates.find({name: fileRef.name});
        if (foundedTpl.count() > 1) {
            AdTemplates.remove({_id: fileRef._id});
            fileRef.error = {
                name: 'duplicate-file-name',
            };
            return fileRef;
        }

        //validate template against placeholders
        const fs = Npm.require('fs');
        const tplFile = fs.readFileSync(fileRef.path, 'utf8');
        let errorCols = [];
        columns.forEach(col => {
            let regex;
            if (col.global) {
                regex = new RegExp('{' + col.name + '}', 'g');
            } else {
                regex = new RegExp('{' + col.name + '\\d}', 'g');
            }
            const matches = tplFile.match(regex);
            if (matches == null) {
                errorCols.push(col);
            }
        });
        if (errorCols.length !== 0) {
            AdTemplates.remove({_id: fileRef._id});
            fileRef.error = {
                name: 'placeholders-validation',
                type: 'missing-placeholders',
                placeholders: errorCols
            };
        }
        return fileRef;
    }
});


Data = new Meteor.Files({
    debug: false,
    collectionName: 'Data',
    storagePath: function () {
        return Meteor.isServer && Meteor.settings.private.dataPath
    },
    allowClientCode: true,
    namingFunction: function (file) {
        return file.name;
    },
    onBeforeUpload: function (file) {
        if (file.size > 1024 * 1024 * 10 || !(/xlsx|xls|xlsm/i.test(file.extension))) {
            return 'Please upload xls,xlsx,xlsm,  with size equal or less than 10MB';
        }
        return true;
    }
});


SelectedData = new Mongo.Collection(null);
SelectedAdTemplate = new Mongo.Collection(null);

TabularTables = {};

TabularTables.Data = new Tabular.Table({
    name: 'Data',
    collection: Data.collection,
    columns: [
        {data: 'name', title: 'Name'},
        {
            tmpl: Meteor.isClient && Template.action
        }
    ]
});

TabularTables.AdTemplates = new Tabular.Table({
    name: 'AdTemplates',
    collection: AdTemplates.collection,
    columns: [
        {data: 'name', title: 'Name'},
        {
            tmpl: Meteor.isClient && Template.AdGeneration_table_adTemplates_action
        }
    ]
});


TabularTables.GeneratedAds = new Tabular.Table({
    name: 'GeneratedAds',
    collection: GeneratedAds.collection,
    columns: [
        {data: 'name', title: 'Name'},
        {
            data: 'meta.created', title: 'Generated At', render: function (val, type, doc) {
            if (val instanceof Date) {
                return moment(val).format('L')
            }
        }
        },
        {
            tmpl: Meteor.isClient && Template.Adgenration_table_generatedAds_action
        }
    ]
});
