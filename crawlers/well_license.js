var Crawler = require('./base');

// TODO (EK): Abstract into utils
var _ = require('lodash');

var WellLicenseCrawler = Crawler.extend({

    isMonday: function(){
      return false;
    },

    run: function() {
      console.log('Processing Well License Job');
        
      var config = this.job.data;

      this.visit(config.url)
          .filter('error')
          .filter('links')
          .each(function(url, index){
            this.visit(url)
                .filter('error')
                .filter('cancellation')
                .filter('amendment')
                .filter('license')
                .done();
          }, this);
    }

});

WellLicenseCrawler.mixin({
  visit: function(url) {
    // TODO (EK): Visit url


    return this;
  },

  each: function(fn) {

  },

  filter: function(name, document, data){
    var filter = this.filters[name];

    return this;
  }

});

var example = WellLicenseCrawler.create('video');