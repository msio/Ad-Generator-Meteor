import moment from 'moment';

if (Meteor.isServer) {
import
    {
        columns
    }
    from
    './columns.js';

import
    {
        validateSpreadsheet
    }
    from
    '../server/validations.js';
import
    {
        _
    }
    from
    'lodash';
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
        let missingPlaceholders = [];
        let notGlobalColumns = [];
        columns.forEach(col => {
            let regex;
            if (col.global) {
                regex = new RegExp('{' + col.name + '}', 'g');
            } else {
                notGlobalColumns.push(col);
                regex = new RegExp('{' + col.name + '\\d}', 'g');
            }
            const matches = tplFile.match(regex);
            if (matches == null) {
                missingPlaceholders.push(col);
            }
        });

        //TODO temp impl. it can be impl by one regex
        const validPlaceholders = tplFile.match(/{(publisher|campaign|keyword\d+|keyword_no_spaces\d+|domain\d+|ad_name|other_info|title)}/g);
        const allPlaceholders = tplFile.match(/(\{([^}\s]+)+\})+?/g);
        const invalidPlaceholders = _.uniq(_.difference(allPlaceholders, validPlaceholders));

        if (!_.isEmpty(missingPlaceholders) || !_.isEmpty(invalidPlaceholders)) {
            AdTemplates.remove({_id: fileRef._id});
            fileRef.error = {
                name: 'placeholders-validation',
                type: 'missing-invalid-placeholders',
                placeholders: {missing: missingPlaceholders, invalid: invalidPlaceholders}
            };
            return fileRef;
        }

       /* if (!_.isEmpty(missingPlaceholders)) {
            AdTemplates.remove({_id: fileRef._id});
            fileRef.error = {
                name: 'placeholders-validation',
                type: 'missing--invalid-placeholders',
                placeholders: {missing: missingPlaceholders, invalid: []}
            };
            return fileRef;
        }*/

        //validate template if not global placeholders have correct ordering
        let errorNotGlobalColumns = [];
        notGlobalColumns.forEach(col => {
            const matches = tplFile.match(new RegExp('{' + col.name + '\\d}', 'g'));
            matches.forEach((match, idx) => {
                const matchedPos = match.search(/(\d+)/i);
                const placeholderName = match.substring(1, matchedPos);
                const num = match.split('')[matchedPos];
                const intNum = parseInt(num);
                if (isNaN(intNum)) {
                    fileRef.error = {
                        name: 'placeholders-validation',
                        type: 'missing-notGlobalplaceholder',
                        placeholders: [{name: placeholderName, missingIndex: ''}]
                    };
                    return fileRef;
                }
                if (intNum !== idx + 1) {
                    errorNotGlobalColumns.push({name: placeholderName, missingIndex: idx + 1});
                }
            });
        });

        if (!_.isEmpty(errorNotGlobalColumns)) {
            AdTemplates.remove({_id: fileRef._id});
            fileRef.error = {
                name: 'placeholders-validation',
                type: 'missing-notGlobalplaceholder',
                placeholders: errorNotGlobalColumns
            };
            return fileRef;
        }

    }
});


AdData = new Meteor.Files({
    debug: false,
    collectionName: 'AdData',
    storagePath: function () {
        return Meteor.isServer && Meteor.settings.private.dataPath
    },
    allowClientCode: true,
    namingFunction: function (file) {
        switch (file.extension) {
            case 'xlsx':
            case 'xlsm':
                return file.name.substring(0, file.name.length - 5);
            case 'xls':
                return file.name.substring(0, file.name.length - 4);
        }
    },
    onBeforeUpload: function (file) {
        if (file.size > 1024 * 1024 * 10 || !(/xlsx|xls|xlsm/i.test(file.extension))) {
            return 'Please upload xls,xlsx,xlsm,  with size equal or less than 10MB';
        }
        return true;
    },
    onAfterUpload: function (fileRef) {
        //check if the file name already exist
        const foundedData = AdData.find({name: fileRef.name});
        if (foundedData.count() > 1) {
            AdData.remove({_id: fileRef._id});
            fileRef.error = {
                name: 'duplicate-file-name',
            };
            return fileRef;
        }
        const res = validateSpreadsheet(fileRef.path);
        if (res.name !== 'ok') {
            AdData.remove({_id: fileRef._id});
            fileRef.error = res;
        }
        return fileRef;
    }
});


SelectedAdData = new Mongo.Collection(null);
SelectedAdTemplate = new Mongo.Collection(null);

TabularTables = {};

TabularTables.AdData = new Tabular.Table({
    name: 'AdData',
    collection: AdData.collection,
    autoWidth: false,
    searching: false,
    stateSave: true,
    columns: [
        {data: 'name', title: 'Name'},
        {
            data: 'meta.uploaded', title: 'Uploaded At', render: function (val, type, doc) {
            if (val instanceof Date) {
                return moment(val).format()
            }
        }
        },
        {
            tmpl: Meteor.isClient && Template.action
        }
    ]
});

TabularTables.AdTemplates = new Tabular.Table({
    name: 'AdTemplates',
    collection: AdTemplates.collection,
    autoWidth: false,
    searching: false,
    columns: [
        {data: 'name', title: 'Name'},
        {
            data: 'meta.uploaded', title: 'Uploaded At', render: function (val, type, doc) {
            if (val instanceof Date) {
                return moment(val).format()
            }
        }, searchable: false
        },
        {
            tmpl: Meteor.isClient && Template.AdGeneration_table_adTemplates_action, searchable: false
        }
    ]
});


TabularTables.GeneratedAds = new Tabular.Table({
    name: 'GeneratedAds',
    collection: GeneratedAds.collection,
    autoWidth: false,
    searching: false,
    columns: [
        {data: 'name', title: 'Name'},
        {
            data: 'meta.created', title: 'Generated At', render: function (val, type, doc) {
            if (val instanceof Date) {
                return moment(val).format()
            }
        }
        },
        {
            tmpl: Meteor.isClient && Template.Adgenration_table_generatedAds_action
        }
    ]
});
