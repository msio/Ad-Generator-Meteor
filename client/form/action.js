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
        if (row.attr('chosen') === 'true') {
            row.attr('chosen', false);
            tpl.selectState.set('Select');
            SelectedData.remove({dataId: this._id});
        } else {
            row.attr('chosen', true);
            tpl.selectState.set('Unselect');
            SelectedData.insert({dataId: this._id});
        }
    },
    'click .js-remove': function () {
        Data.remove({_id: this._id}, (err)=> {
            if (err) {
                console.log(err);
            } else {
                console.log('removed');
            }
        });
    }
});

Template.action.onCreated(function () {
    this.file = new ReactiveVar(Data.findOne({_id: this.data._id}));
    this.selectState = new ReactiveVar('Select');
});

Template.action.onRendered(function () {
    //add your statement here
});

Template.action.onDestroyed(function () {
    //add your statement here
});

