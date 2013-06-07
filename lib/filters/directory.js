var _ = require('../../utils')._,
    fs = require('fs');

// This only supports getting files one level deep inside a directory
module.exports = function(directory, selector){

  fs.readdir(directory, function(error, files){

    // We are not handling errors here. We handle empty files
    // or directory not found later. They are effectively the same
    // from a filter's perspective
    if (error || !files.length) return [];

    var regex = new RegExp(selector, i);

    var fileList = _.map(files, function(filename){

      if ( selector && !regex.test(filename) ) return;

      return filename;

    });

    return fileList;
  });

};