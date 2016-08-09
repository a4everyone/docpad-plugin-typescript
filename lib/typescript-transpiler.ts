import * as fs from "fs"
import * as ts from "typescript"

export { CompilerOptions, OutputFile } from "typescript"

/**
 * Interface to pass to transpiler root files to be compiled/transpiled
 */
export interface RootFile4Transpile {
    name: string
    content: string
    mtime: number // when last the file was modified
}

/**
 * Wrapper for the write
 */
export function writeFile(file: ts.OutputFile) {
    fs.writeFile(file.name, file.text, "utf8")
}

/**
 * Transpiles Typescript to JavaScript
 * Uses Typescript's native support of NodeJS
 */
export class TypescriptTranspiler
{
    private servicesHost: ts.LanguageServiceHost
    private service: ts.LanguageService
    private rootFiles: RootFile4Transpile[] = []

    private matchJsEndOfFile = /\.js$/
    private matchBackSlashEnd = /\/$/

    constructor(
        private curWorkDir: string,
        private compilerOptions: ts.CompilerOptions
    ) {
        // Create the language service host to allow the LS to communicate with the host
        this.servicesHost = {
            getScriptFileNames: () => this.rootFiles.map( file => file.name ),
            getScriptVersion: (fileName) => {
                let file = this.getRootFile( fileName )
                if( file ) {
                    return '' + file.mtime  
                }
                
                return '' + fs.statSync( fileName ).mtime.getTime()
            },
            getScriptSnapshot: (fileName) => {
                let content = this.getContentIfRootFile(fileName)

                if( content === null ) {
                    if (!fs.existsSync(fileName)) 
                        return undefined

                    content = fs.readFileSync(fileName).toString()
                }

                return ts.ScriptSnapshot.fromString(content)
            },
            getCurrentDirectory: () => this.curWorkDir,
            getCompilationSettings: () => this.compilerOptions,
            getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
        }

        // Create the language service files
        this.service = ts.createLanguageService(this.servicesHost, ts.createDocumentRegistry())
    }

    transpile(rootFile: RootFile4Transpile[]): ts.OutputFile[]
    {
        // set correct file names to be processed
        this.rootFiles = rootFile

        let resultFiles: ts.OutputFile[] = []

        // Now let's watch the files
        rootFile.forEach(file => {
            // First time around, emit all files
            let outFiles = this.emitFile(file.name)
            
            resultFiles = resultFiles.concat(outFiles)
        })

        return resultFiles
    }

    private getRootFile(fileName: string): RootFile4Transpile {
        for(let file of this.rootFiles) {
            if( file.name === fileName )
                return file
        }

        return null
    }

    private getContentIfRootFile(fileName: string): string
    {
        let file = this.getRootFile( fileName )

        return file && file.content
    }

    private emitFile(fileName: string) {
        let output = this.service.getEmitOutput(fileName)

        if (output.emitSkipped)
            this.logErrors(fileName)

        this.fixSourceMapUrl(output.outputFiles)

        // output.outputFiles.forEach(o => {
        //     writeFile(o.name, o.text)
        // })

        return output.outputFiles
    }

    /**
     * By any unknown reason (may be a bug) in that configuration Typescript original compiler/transpiler
     * puts wrong URL to the map file into the JS file. Instead to put file name with .js.map at end it puts
     * mapRoot path with the map file name at end.
     * That method fixes that.
     */
    private fixSourceMapUrl (outFiles: ts.OutputFile[]): void {
        // normalise ther comment for source map in the JS file 
        let pathToRemove = this.compilerOptions.mapRoot
        if( pathToRemove.length>0 && ! this.matchBackSlashEnd.test(pathToRemove) ) {
            pathToRemove += '/'
        }

        let regExpStr = this.escapeRegExp(pathToRemove) 
        regExpStr = '([\n\r]\/\/# sourceMappingURL=)' + regExpStr + '(.*[\n\r]{0,2})$'
        let replaceSrcMapLine = new RegExp(regExpStr, 'g')

        for(let file of outFiles) {
            if( this.matchJsEndOfFile.test(file.name) ) {
                 // removes only path to root dir but leavs correclty the other parts of source map comment
                file.text = file.text.replace(replaceSrcMapLine, '$1$2')
            }
        }
    }

    private escapeRegExp(str) {
        return str.replace(/[.^$*+?()[{\\|\]-]/g, '\\$&');
    }

    private logErrors(fileName: string) {
        let allDiagnostics = this.service.getCompilerOptionsDiagnostics()
            .concat(this.service.getSyntacticDiagnostics(fileName))
            .concat(this.service.getSemanticDiagnostics(fileName))

        allDiagnostics.forEach(diagnostic => {
            let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
            if (diagnostic.file) {
                let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start)
                throw (`Typescript Error ${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`)
            }
            else {
                throw (`Typescript Error: ${message}`)
            }
        })
    }
}
