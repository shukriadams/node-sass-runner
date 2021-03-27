# Node-Sass-Runner

Convenient wrapper for Node-sass. Renders Sass to Css, 1-to-1 at file level. Does do autoprefixing for cross-browser support. Does not concatenate/minify/etc.

## Use

    {
        "dependencies": {
            node-sass-runner": "https://github.com/shukriadams/node-sass-runner.git#1.0.0"
        }
    }

Import

    const runner = require('node-sass-runner')

### Render multiple

Maintains relative directory nesting of scss files

    await runner.renderAll({
        scss : 'path/to/sassFiles',
        css : 'path/to/write/cssFiles'
    })

### Render single
    
    await runner.renderSingle({
        scss : 'path/to/sassFile',
        css : 'path/to/write/cssFile'
    })