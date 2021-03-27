const sass = require('node-sass'),
      autoprefixer = require('autoprefixer'),
      postcss = require('postcss'),
      fs = require('fs-extra'),
      path = require('path'),
      mkdirp =  require('mkdirp'),
      glob = require('glob')

module.exports = {

    /**
     * options:
     * {object} globOptions 
     * {string} scssPath
     * {string} cssOutFolder
     */
    async renderAll (options) {
        return new Promise((resolve, reject)=>{
            try {
                
                options.globOptions = options.globOptions || {}

                if (!options.scssPath)
                    return console.error(' could not find expected value "scssPath".')
    
                if (!options.cssOutFolder)
                    return console.error(' could not find expected value for "cssOutFolder".')
    
                if (!fs.existsSync(options.cssOutFolder))
                    mkdirp.sync(options.cssOutFolder)
    
                glob(options.scssPath, options.globOptions,  (err, files) => {
                    if (!files.length)
                        console.log(`${options.scssPath} did not find any sass files.`)
    
                    if (err)
                        return reject(err)
    
                    let processedCount = 0
    
                    files.forEach(async file =>{
                        try {
                            let outfile = path.join(
                                options.cssOutFolder,
                                path.dirname(file),
                                `${path.basename(file).substr(0, path.basename(file).length - 5)}.css`) // remove .scss extension
        
                            // ignore partials
                            if (path.basename(file).substr(0, 1) === '_')
                                return
                            
                            fs.ensureDirSync(path.dirname(outfile))
                            await this.renderSingle(file, outfile)
                        }
                        finally{
                            processedCount ++
                            if (processedCount >= files.length)
                                resolve()
                        }
                    })
                })
            } catch(ex){
                reject(ex)
            }
        })
    },

    /**
     * Converts a sass file to css. Css is auto-prefixed for cross-browser support
     */
    async renderSingle(sassPath, cssPath){
        return new Promise((resolve, reject)=>{
            try {
                sass.render({
                    file: sassPath,
                    sourceComments: true
                }, async (err, result)=>{
                    if (err)
                        return reject(`error compiling sass file ${sassPath}`, err)
    
                    postcss([ autoprefixer ]).process(result.css).then(async result => {
    
                        result.warnings().forEach(warn => {
                            console.warn(warn.toString())
                        })
                       
                        await fs.writeFile(cssPath, result.css)
                        console.log(`compiled ${cssPath}`)
                        resolve()
                    })
                })
            } catch(ex){
                reject(ex)                
            }
        })
    }
}
