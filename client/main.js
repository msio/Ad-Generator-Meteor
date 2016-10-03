/**
 * Created by Michal Vranec on 29.09.2016.
 */

Meteor.startup(function () {
    sAlert.config({
        effect: 'stackslide',
        position: 'top-right',
        timeout: 3000,
        html: true
    });

});
