var Queue = require('kue');
var redis = require('redis');
var Proto = require('uberproto');
var _ = require('lodash');

var BaseCrawler = Proto.extend({
    init : function(type, options) {
      options = options || {};
      this.type = type;
      this.concurrency = options.concurrency || 1;

      if (process.env.REDISTOGO_URL) {
        this.initRedis();
      }

      this.queue = Queue.createQueue();

      this.queue.process(this.type, this.concurrency, _.bind(function(job, done){
        this.done = done;
        this.job = job;
        this.run();
      }, this));

      console.log('Crawler [' + this.type + '] ready and waiting');
    },

    initRedis: function(){
      if (process.env.REDISTOGO_URL) {
        var rtg = require('url').parse(process.env.REDISTOGO_URL);
          
        Queue.redis.createClient = function() {
          var client = redis.createClient(rtg.port, rtg.hostname);
          client.auth(rtg.auth.split(":")[1]);
          return client;
        };
      }
    },

    run: function() {
      throw "Should be overridden";
    }

});

module.exports = BaseCrawler;