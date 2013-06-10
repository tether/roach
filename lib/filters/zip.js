var _ = require('../../utils')._,
    path = require('path'),
    fs = require('fs'),
    AdmZip = require('adm-zip');

// This only handles one entry selector at a time
module.exports = function(document, entry){
  var zip = new AdmZip(document);
  var zipEntries = zip.getEntries(); // an array of ZipEntry record

  var entries = _.map(zipEntries, function(zipEntry) {

    if (zipEntry.entryName === entry) {

      // Need to write to file because we are expected to return
      // a list of URLS or files from a proxy filter.

      // FIXME (EK): Fix this shit by having proper chainable filters,
      // and then this doesn't need to be a proxy job.
      var filePath = path.resolve(process.cwd(), zipEntry.name);
      fs.writeFileSync( filePath, zip.readAsText(zipEntry) );

      return filePath;
    }
  });

  return entries;

};