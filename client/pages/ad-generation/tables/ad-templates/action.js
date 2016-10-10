import {Template} from 'meteor/templating';

Template.AdGeneration_table_adTemplates_action.helpers({
    file: function () {
        return Template.instance().file.get();
    },
    selectState: function () {
        return Template.instance().selectState.get();
    }
});

Template.AdGeneration_table_adTemplates_action.events({
    'click .js-select': function (e, tpl) {
        const row = $(e.target).closest('tr');
        const dataTable = $(e.target).closest('table').DataTable();
        //single selection
        if (row.hasClass('selected')) {
            row.removeClass('selected');
            SelectedAdTemplate.remove({adTemplateId: this._id});
        } else {
            dataTable.$('tr.selected').removeClass('selected');
            row.addClass('selected');
            SelectedAdTemplate.insert({adTemplateId: this._id});
        }
    },
    'click .js-remove': function (e, tpl) {
        UIBlock.block('Removing...');
        AdTemplates.remove({_id: this._id}, (err)=> {
            if (err) {
                sAlert.error('Template has not been removed');
            } else {
                sAlert.success('Template has been removed');
            }
            UIBlock.unblock();
        });
    }
});

Template.AdGeneration_table_adTemplates_action.onCreated(function () {
    this.file = new ReactiveVar(AdTemplates.findOne({_id: this.data._id}));
    this.selectState = new ReactiveVar('Select');
});

Template.AdGeneration_table_adTemplates_action.onRendered(function () {});


Template.AdGeneration_table_adTemplates_action.onDestroyed(function () {});

