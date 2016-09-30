Template.action.helpers({
    file: function () {
        return Template.instance().file.get();
    },
    selectState: function () {
        return Template.instance().selectState.get();
    },
    tableType: function (tableType) {
        let table = Template.instance().table.get();
        console.log(table && table.collectionName === tableType);
        return table && table.collectionName === tableType;
    }
});

Template.action.events({
    'click .js-select': function (e, tpl) {
        const row = $(e.target).closest('tr');
        const dataTable = $(e.target).closest('table').DataTable();
        if (tpl.table.get().collectionName === 'Data') {
            //multiple selection
            if (row.hasClass('selected')) {
                row.removeClass('selected');
                tpl.selectState.set('Select');
                SelectedData.remove({dataId: this._id});
            } else {
                row.addClass('selected');
                tpl.selectState.set('Unselect');
                SelectedData.insert({dataId: this._id});
            }
        } else if (tpl.table.get().collectionName === 'AdTemplates') {
            //single selection
            if (row.hasClass('selected')) {
                row.removeClass('selected');
                SelectedAdTemplate.remove({adTemplateId: this._id});
            } else {
                dataTable.$('tr.selected').removeClass('selected');
                row.addClass('selected');
                SelectedAdTemplate.insert({adTemplateId: this._id});
            }
        }
    },
    'click .js-remove': function (e, tpl) {
        tpl.table.get().remove({_id: this._id}, (err)=> {
            if (err) {
                console.log(err);
            } else {
                console.log('removed');
            }
        });
    }
});

Template.action.onCreated(function () {
    this.file = new ReactiveVar(null);
    this.table = new ReactiveVar(null);
    this.selectState = new ReactiveVar('Select');
});
Template.action.onRendered(function () {
    const table = $('.action').closest('table');
    if (table.hasClass('data-table')) {
        this.table.set(Data);
    } else if (table.hasClass('ad-templates-table')) {
        this.table.set(AdTemplates);
    }
    this.file.set(this.table.get().findOne({_id: this.data._id}));
});


Template.action.onDestroyed(function () {
    //add your statement here
});

