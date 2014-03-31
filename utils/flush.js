var client = require('redis').createClient();


client.lrange('roach:jobs', 0, -1, function(err, ids) {
  for(var l = ids.length; l--;) {
   client.lrem('roach:jobs', 0, ids[l], function() {
    //hkeys
    process.exit();
   });
  }
  client.set('roach:jobs:id', 0);
});

