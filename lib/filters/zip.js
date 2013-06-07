var _ = require('../../utils')._,
    AdmZip = require('adm-zip');



// This only handles one entry selector at a time
module.exports = function(zipBuffer, selector){

  var zip = new AdmZip(zipBuffer);
  var zipEntries = zip.getEntries(); // an array of ZipEntry records

  var entries = _.map(zipEntries, function(zipEntry) {

    // console.log(zipEntry.toString()); // outputs zip entries information

    if (zipEntry.entryName === selector) {
      return zip.readAsText(zipEntry);
    }
  });

  return entries;

};