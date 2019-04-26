module.exports = function(options, callback) {

    var sass = require('node-sass'),
        fs = require('fs'),
        path = require('path'),
        mkdirp =  require('mkdirp'),
        glob = require('glob');
    
    options.globOptions = options.globOptions || {};

    
    if (!options.scssPath)
        return console.error(' could not find expected value "scssPath".');

    if (!options.cssOutFolder)
        return console.error(' could not find expected value for "cssOutFolder".');

    if (!fs.existsSync(options.cssOutFolder))
        mkdirp.sync(options.cssOutFolder);

    glob(options.scssPath, options.globOptions, function (er, files) {
        if (!files.length)
            console.log(options.scssPath + ' dit not find any sass files.');

        if (er)
            return callback(er);

        var processedCount = 0;
        function checkIfDone(){
            processedCount ++;

            if (processedCount === files.length){
                callback();
            }
        }

        files.forEach(function(file, i ){
            
            var outfile = path.join(
                options.cssOutFolder,
                path.basename(file).substr(0, path.basename(file).length - 5) + '.css'); // remove .scss extension

            // ignore partials
            if (path.basename(file).substr(0, 1) === '_'){
                checkIfDone();
                return callback();
            }

            var result = sass.render({
                file: file,
                sourceComments: true
            }, function(err, result){

                if (err){
                    console.error('error compiling : ' + file + ' : ' + err);
                } else {
                    fs.writeFileSync(outfile, result.css);
                    console.log(' compiled ' + outfile);
                }

                checkIfDone();

            });

        });

    });
};
