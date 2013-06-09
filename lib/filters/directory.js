var _ = require('../../utils')._,
    fs = require('fs');

// This only supports getting files one level deep inside a directory
module.exports = function(directory, selector){

  try {
    var files = fs.readdirSync(directory);

    var regex = new RegExp(selector, 'i');

    var fileList = _.reject(files, function(filename){

      return selector && !regex.test(filename);

    });

    return fileList;
  }
  catch(error){

    return [];
  }

};