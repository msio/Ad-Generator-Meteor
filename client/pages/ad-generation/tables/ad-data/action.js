Template.action.helpers({
    file: function () {
        return Template.instance().file.get();
    },
    selectState: function () {
        return Template.instance().selectState.get();
    }
});

Template.action.events({
    'click .js-select': function (e, tpl) {
        const row = $(e.target).closest('tr');
        //multiple selection
        if (row.hasClass('selected')) {
            row.removeClass('selected');
            tpl.selectState.set('Select');
            SelectedAdData.remove({dataId: this._id});
        } else {
            row.addClass('selected');
            tpl.selectState.set('Unselect');
            SelectedAdData.insert({dataId: this._id});
        }
    },
    'click .js-remove': function (e, tpl) {
        AdData.remove({_id: this._id}, (err)=> {
            if (err) {
                console.log(err);
            } else {
                console.log('removed');
            }
        });
    }
});

Template.action.onCreated(function () {
    this.file = new ReactiveVar(AdData.findOne({_id: this.data._id}));
    this.selectState = new ReactiveVar('Select');
});
Template.action.onRendered(function () {
});


Template.action.onDestroyed(function () {
});
