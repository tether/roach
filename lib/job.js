
module.exports = (function () {

    var _filters = {};

    function Job() {
        //constructor
    }


    Job.prototype.filter = function( name ) {

        var filterPath = './filters/' + name;

        if ( require.resolve(filterPath) ){

            _filters[name] = require(filterPath);
        }
        // TODO: Maybe return an error if transport doesn't exist

        return this;
    };

    return Job;

})();

