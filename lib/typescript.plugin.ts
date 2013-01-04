var exportPlugin = require('docpad-tsplugin');
var compiler = require('lax-typescript');

class TypescriptPlugin { 
    render(opts, next) : any {
        var config, inExtension, outExtension;
        config = this.config;
        
        inExtension = opts.inExtension, outExtension = opts.outExtension;
        if ((inExtension === 'ts' ) && (outExtension === null || outExtension === 'js')) {
            opts.content = compiler.compileToES3( opts.content, opts.file.attributes.fullPath );
            return next();
        } else {
            return next();
        }
    }
    
    constructor() {
        return TypescriptPlugin.__super__.constructor.apply(this, arguments);
    }
}

arguments[2].exports = exportPlugin("typescript", TypescriptPlugin );