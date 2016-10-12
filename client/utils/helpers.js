/**
 * Created by Michal Vranec on 03.10.2016.
 */

Template.registerHelper('equals', (v1, v2)=> {
    return (v1 === v2);
});

Template.registerHelper('isNotEmpty', (array)=> {
    if (!Array.isArray(array)) {
        throw new Error('No Array');
    }
    return array.length != 0;
});
