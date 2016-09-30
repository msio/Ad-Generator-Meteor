AdTemplates = new Meteor.Files({
    debug: false,
    collectionName: 'AdTemplates',
    storagePath: '/Users/Msio/adTemplating/templates',
    allowClientCode: true,
    onBeforeUpload: function (file) {
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
    allowClientCode: true,
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
