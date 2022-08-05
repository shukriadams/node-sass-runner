const sass = require('sass'),
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
     * {object} sassOptions (optional) 
     * {string} scss path to find scss files
     * {string} css path to write css files
     */
    async renderAll (options) {
        return new Promise((resolve, reject)=>{
            try {
                
                options.globOptions = options.globOptions || {}

                if (!options.scss)
                    return console.error(' could not find expected value "scss".')
    
                if (!options.css)
                    return console.error(' could not find expected value for "css".')
    
                if (!fs.existsSync(options.css))
                    mkdirp.sync(options.css)
    
                glob(options.scss, options.globOptions,  (err, files) => {
                    if (!files.length)
                        console.log(`${options.scss} did not find any sass files.`)
    
                    if (err)
                        return reject(err)
    
                    let processedCount = 0
    
                    files.forEach(async file =>{
                        try {
                            let outfile = path.join(
                                options.css,
                                path.dirname(file),
                                `${path.basename(file).substr(0, path.basename(file).length - 5)}.css`) // remove .scss extension
        
                            // ignore partials
                            if (path.basename(file).substr(0, 1) === '_')
                                return
                            
                            fs.ensureDirSync(path.dirname(outfile))
                            await this.renderSingle(file, outfile, options.sassOptions)
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
     * Converts a sass file to css. Css is auto-prefixed for cross-browser support.
     * scss : path of scss file
     * css : path to write css file
     */
    async renderSingle(scss, css, options = {}){
        options.file = scss

        if (options.sourceComments === undefined)
            options.sourceComments = true

        if (options.indentWidth === undefined)
            options.indentWidth = 4

        return new Promise((resolve, reject)=>{
            try {
                sass.render(options, async (err, result)=>{
                    if (err)
                        return reject(`error compiling sass file ${scss}`, err)
    
                    postcss([ autoprefixer ]).process(result.css).then(async result => {
    
                        result.warnings().forEach(warn => {
                            console.warn(warn.toString())
                        })
                       
                        await fs.writeFile(css, result.css)
                        console.log(`compiled ${css}`)
                        resolve()
                    })
                })
            } catch(ex){
                reject(ex)                
            }
        })
    }
}
