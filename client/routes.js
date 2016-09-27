import {FlowRouter} from 'meteor/kadira:flow-router';

FlowRouter.route('/', {
    name: 'form',
    action(){
        BlazeLayout.render('home', {main: 'form'});
    }
});