/**
 * Created by Michal Vranec on 29.09.2016.
 */

Meteor.startup(function () {
    sAlert.config({
        effect: 'stackslide',
        position: 'top',
        timeout: 5000,
        html: true
    });

});
