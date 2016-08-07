import * as fs from "fs"
import * as ts from "typescript"

export { CompilerOptions, OutputFile } from "typescript"

/**
 * Interface to pass to transpiler root files to be compiled/transpiled
 */
export interface RootFile4Transpile {
    name: string
    content: string
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

    constructor(
        private curWorkDir: string,
        private compilerOptions: ts.CompilerOptions
    ) {
        // Create the language service host to allow the LS to communicate with the host
        this.servicesHost = {
            getScriptFileNames: () => this.rootFiles.map( file => file.name ),
            getScriptVersion: (fileName) => '0',
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

    private getContentIfRootFile(fileName: string): string
    {
        for(let file of this.rootFiles) {
            if( file.name === fileName )
                return file.content
        }

        return null
    }

    private emitFile(fileName: string) {
        let output = this.service.getEmitOutput(fileName)

        if (output.emitSkipped)
            this.logErrors(fileName)
        
        // output.outputFiles.forEach(o => {
        //     writeFile(o.name, o.text)
        // })

        return output.outputFiles
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
