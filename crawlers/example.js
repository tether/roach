var Crawler = require('./base');

// TODO (EK): Abstract into utils
var _ = require('lodash');

var ExampleCrawler = Crawler.extend({

    nextFrame: function(i){
      this.convertFrame(i, _.bind(function(err){
        if (err) return this.done(err);

        // report progress, i/frames complete
        this.job.progress(i, this.frames);
        
        if (i >= this.frames) return this.done();
        
        this.nextFrame(i + Math.random() * 10);
      }, this));
    },

    convertFrame: function(i, fn){
      setTimeout(fn, Math.random() * 1000);
    },

    run: function() {
      console.log('Processing Video Job');
        
      this.frames = this.job.data.frames;

      this.nextFrame(0);
    }

});

var example = ExampleCrawler.create('video');