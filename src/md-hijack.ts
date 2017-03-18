'use strict'

import * as vs from 'vscode'
import vscmd = vs.commands
import vslang = vs.languages



const enum      Case                            { Insensitive , Sensitive }

export const    demoUri :vs.Uri                 = vs.Uri.parse('expo://printAllExts')

const           lang_md                         = 'markdown'
    ,           cmpls :vs.CompletionItem[]      = []
    ,           symbols :vs.SymbolInformation[] = []
    ,           defLocation :vs.Location        = new vs.Location(demoUri, new vs.Position (
                                                    vs.extensions.all.findIndex( (vsx)=>
                                                        vsx.id=='metaleap.vscode-extexpo' ) + 1, 0) )
    ,           codeAction_Replace :vs.Command  = { arguments: [], command: 'expo.replaceExpo',
                                                    title: "Replace selection with 'EXPO'" }

let             diag :vs.DiagnosticCollection



//  ALL functions in this module using `promise` could do *entirely without*, as they're simple
//  mocks not involving any longer-running Serious Work.. however a few are there to remind us that
//  realistically when talking to language servers, APIs etc, promises will ultimately be prudent.
function promise<T> (result : ()=>T) {
    return new Promise<T>( (resolve)=> { resolve(result()) } )
}


export function hijackAllMarkdownEditors (disps :vs.Disposable[]) {
    disps.push(diag = vslang.createDiagnosticCollection(lang_md))

    disps.push( vscmd.registerTextEditorCommand('expo.replaceExpo', onCodeAction_Replace) )
    disps.push( vslang.registerHoverProvider(lang_md, { provideHover: onHover }) )
    disps.push( vslang.registerCodeActionsProvider(lang_md, { provideCodeActions: onCodeActions }) )
    disps.push( vslang.registerCodeLensProvider(lang_md, { provideCodeLenses: onCodeLenses }) )
    disps.push( vslang.registerCompletionItemProvider(lang_md, { provideCompletionItems: onCompletion }, "e", "E", "x", "X") )
    disps.push( vslang.registerDefinitionProvider(lang_md, { provideDefinition: onGoToDefOrImplOrType }) )
    // no need for this DocumentFormattingEdit as we already have DocumentRangeFormattingEdit further down
    //      disps.push( vslang.registerDocumentFormattingEditProvider(_md, { provideDocumentFormattingEdits: <like onRangeFormattingEdits without range> }) )
    disps.push( vslang.registerDocumentHighlightProvider(lang_md, { provideDocumentHighlights: onHighlights }) )
    disps.push( vslang.registerDocumentLinkProvider(lang_md, { provideDocumentLinks: onLinks }) )
    disps.push( vslang.registerDocumentRangeFormattingEditProvider(lang_md, { provideDocumentRangeFormattingEdits: onRangeFormattingEdits }) )
    disps.push( vslang.registerDocumentSymbolProvider(lang_md, { provideDocumentSymbols: onSymbols }) )
    disps.push( vslang.registerImplementationProvider(lang_md, { provideImplementation: onGoToDefOrImplOrType }) )
    disps.push( vslang.registerReferenceProvider(lang_md, { provideReferences: onReference }) )
    disps.push( vslang.registerRenameProvider(lang_md, { provideRenameEdits: onRename }) )
    disps.push( vslang.registerSignatureHelpProvider(lang_md, { provideSignatureHelp: onSignature }, " ", "$") )
    disps.push( vslang.registerTypeDefinitionProvider(lang_md, { provideTypeDefinition: onGoToDefOrImplOrType }) )
    disps.push( vslang.registerWorkspaceSymbolProvider({ provideWorkspaceSymbols: onProjSymbols }) )
}

function onHover (doc :vs.TextDocument, pos :vs.Position, _cancel :vs.CancellationToken) {
    return promise( ()=> {  // could do just-the-inner-block *without* the promise wrapper, too
        const txt = doc.getText(doc.getWordRangeAtPosition(pos))
        return new vs.Hover({ language: lang_md , value: "*McFly!!* A `" + txt + "` isn't a hoverboard." })
    })
}

//  seems to be invoked on the same events as `onHighlights` below; plus on doc-tab-activate
function onCodeActions (_doc :vs.TextDocument, _range :vs.Range, _ctx :vs.CodeActionContext, _cancel :vs.CancellationToken) {
    return [ codeAction_Replace ]
}

function onCodeAction_Replace (ed :vs.TextEditor, op :vs.TextEditorEdit, ..._args :any[]) {
    for (const sel of ed.selections)
        op.replace(sel, "EXPO")
}

//  on doc-tab-activate and on edit --- not on save or cursor movements
function onCodeLenses (doc :vs.TextDocument, _cancel :vs.CancellationToken) {
    refreshDiag(doc)
    return [ new vs.CodeLens(new vs.Range(0,0 , 1,0), codeAction_Replace) ]
}

function onCompletion (_doc :vs.TextDocument, _pos :vs.Position, _cancel :vs.CancellationToken) {
    if (!cmpls.length) {
        const cmplkinds = {
            'vs.CompletionItemKind.Class': vs.CompletionItemKind.Class,
            'vs.CompletionItemKind.Color': vs.CompletionItemKind.Color,
            'vs.CompletionItemKind.Constructor': vs.CompletionItemKind.Constructor,
            'vs.CompletionItemKind.Enum': vs.CompletionItemKind.Enum,
            'vs.CompletionItemKind.Field': vs.CompletionItemKind.Field,
            'vs.CompletionItemKind.File': vs.CompletionItemKind.File,
            'vs.CompletionItemKind.Folder': vs.CompletionItemKind.Folder,
            'vs.CompletionItemKind.Function': vs.CompletionItemKind.Function,
            'vs.CompletionItemKind.Interface': vs.CompletionItemKind.Interface,
            'vs.CompletionItemKind.Keyword': vs.CompletionItemKind.Keyword,
            'vs.CompletionItemKind.Method': vs.CompletionItemKind.Method,
            'vs.CompletionItemKind.Module': vs.CompletionItemKind.Module,
            'vs.CompletionItemKind.Property': vs.CompletionItemKind.Property,
            'vs.CompletionItemKind.Reference': vs.CompletionItemKind.Reference,
            'vs.CompletionItemKind.Snippet': vs.CompletionItemKind.Snippet,
            'vs.CompletionItemKind.Text': vs.CompletionItemKind.Text,
            'vs.CompletionItemKind.Unit': vs.CompletionItemKind.Unit,
            'vs.CompletionItemKind.Value': vs.CompletionItemKind.Value,
            'vs.CompletionItemKind.Variable': vs.CompletionItemKind.Variable
        }
        for (const cmplkindname in cmplkinds) {
            const cmpl = new vs.CompletionItem(cmplkindname, cmplkinds[cmplkindname])
            cmpl.detail = "EXPO"  ;  cmpl.documentation = "No expolanation needed"
            cmpls.push(cmpl)
        }
    }
    return cmpls
}

function onGoToDefOrImplOrType (doc :vs.TextDocument, pos :vs.Position, _cancel :vs.CancellationToken) {
    const txt = doc.getText(doc.getWordRangeAtPosition(pos))
    return (txt.toLowerCase().includes("expo")) ? defLocation : null
}

//  seems to fire whenever the cursor *enters* a word: not when moving from whitespace to white-space, not
//  when moving from word to white-space, not from moving inside the same word (except after doc-tab-activation)
function onHighlights (doc :vs.TextDocument, _pos :vs.Position, _cancel :vs.CancellationToken) {
    return findRanges(doc, "expo", Case.Insensitive).then ( (matches)=>
        matches.map( (r)=> new vs.DocumentHighlight(r) ) )
}

//  on edit and on activate
function onLinks (doc :vs.TextDocument, _cancel :vs.CancellationToken) {
    refreshDiag(doc)
    return findRanges(doc, 'expo://', Case.Insensitive).then ( (matches)=>
        matches.map( (r)=> new vs.DocumentLink(r, defLocation.uri) ) )
}

function onRangeFormattingEdits (doc :vs.TextDocument, range :vs.Range, _opt :vs.FormattingOptions, _cancel :vs.CancellationToken) {
    const   txtold = doc.getText(range),
            txtnew = txtold.split(' ').join('\n')
    return [ vs.TextEdit.replace(range, txtnew) ]
}

function onSymbols (doc :vs.TextDocument, _cancel :vs.CancellationToken) {
    const   symbols = [],
            words = doc.getText().split(' ')
    let wordpos = {}, curpos = 0, curword :string
    for ( let i = 0  ;  i<words.length  ;  i++ ) {
        curword = words[i]
        wordpos[curword] = curpos
        curpos = curpos + 1 + curword.length
    }
    for ( let word in wordpos )
        symbols.push( new vs.SymbolInformation(word, vs.SymbolKind.String, "EXPO `onSymbols()`", new vs.Location(doc.uri, doc.positionAt(wordpos[word]))) )
    return symbols
}

function onReference (_doc :vs.TextDocument, _pos :vs.Position, _ctx :vs.ReferenceContext, _cancel :vs.CancellationToken) {
    return [defLocation]
}

function onRename (doc :vs.TextDocument, pos :vs.Position, newname :string, _cancel :vs.CancellationToken) {
    const oldname = doc.getText(doc.getWordRangeAtPosition(pos))
    return findRanges(doc, oldname, Case.Sensitive).then((matches)=> {
        const edits = new vs.WorkspaceEdit()
        edits.set(doc.uri, matches.map( (range)=> vs.TextEdit.replace(range, newname) ))
        return edits
    })
}

function onSignature (_doc :vs.TextDocument, _pos :vs.Position, _cancel :vs.CancellationToken) {
    const sighelp = new vs.SignatureHelp()
    sighelp.activeParameter = 0 ; sighelp.activeSignature = 0
    sighelp.signatures = [ new vs.SignatureInformation("signature :: foo -> baz -> expo", "Function summary here..") ]
    sighelp.signatures[0].parameters.push(new vs.ParameterInformation("foo","(Parameter info here..)"))
    return sighelp
}

function onProjSymbols (_query :string, _cancel :vs.CancellationToken) {
    if (!symbols.length) {
        const symkinds = {
            'vs.SymbolKind.Array': vs.SymbolKind.Array,
            'vs.SymbolKind.Boolean': vs.SymbolKind.Boolean,
            'vs.SymbolKind.Class': vs.SymbolKind.Class,
            'vs.SymbolKind.Constant': vs.SymbolKind.Constant,
            'vs.SymbolKind.Constructor': vs.SymbolKind.Constructor,
            'vs.SymbolKind.Enum': vs.SymbolKind.Enum,
            'vs.SymbolKind.Field': vs.SymbolKind.Field,
            'vs.SymbolKind.File': vs.SymbolKind.File,
            'vs.SymbolKind.Function': vs.SymbolKind.Function,
            'vs.SymbolKind.Interface': vs.SymbolKind.Interface,
            'vs.SymbolKind.Key': vs.SymbolKind.Key,
            'vs.SymbolKind.Method': vs.SymbolKind.Method,
            'vs.SymbolKind.Module': vs.SymbolKind.Module,
            'vs.SymbolKind.Namespace': vs.SymbolKind.Namespace,
            'vs.SymbolKind.Null': vs.SymbolKind.Null,
            'vs.SymbolKind.Number': vs.SymbolKind.Number,
            'vs.SymbolKind.Object': vs.SymbolKind.Object,
            'vs.SymbolKind.Package': vs.SymbolKind.Package,
            'vs.SymbolKind.Property': vs.SymbolKind.Property,
            'vs.SymbolKind.String': vs.SymbolKind.String,
            'vs.SymbolKind.Variable': vs.SymbolKind.Variable
        }
        for (const symkind in symkinds)
            symbols.push( new vs.SymbolInformation(symkind, symkinds[symkind], "EXPO", defLocation) )
    }
    return symbols
}


function findRanges (doc :vs.TextDocument, needle :string, casing :Case) {
    return promise (() => {
        const ranges :vs.Range[] = []
        let last = -1 , tmp :number, txt = (casing===Case.Sensitive) ? doc.getText() : doc.getText().toLowerCase()
        if (casing===Case.Insensitive)
            needle = needle.toLowerCase()
        for ( let i = txt.indexOf(needle)   ;   i>=0   ;   i = txt.indexOf(needle) ) {
            tmp = last + i + 1   ;   last = tmp   ;   txt = txt.substr(i + 1)
            ranges.push( doc.getWordRangeAtPosition(doc.positionAt(tmp)) as vs.Range )
        }
        return ranges
    })
}


function refreshDiag (doc :vs.TextDocument) {
    diag.clear()
    const nonissues :vs.Diagnostic[] = []
    const txt = doc.getText().toLowerCase()
    const ihint = txt.indexOf("hint"), iwarn = txt.indexOf("warn"), ierr = txt.indexOf("error")
    const nonissue = (pos :number, msg :string, sev :vs.DiagnosticSeverity) =>
        nonissues.push ( new vs.Diagnostic(doc.getWordRangeAtPosition(doc.positionAt(pos)) as vs.Range, msg, sev) )

    nonissues.push( new vs.Diagnostic(new vs.Range(0,0 , 1,0), "IntelliGible: this is the 1st line. For more \"diagnostics\", type 'hint' or 'warning' or 'error' anywhere.", vs.DiagnosticSeverity.Information) )
    if (ihint>=0) nonissue(ihint, "IntelliGible: a hint-sight", vs.DiagnosticSeverity.Hint)
    if (iwarn>=0) nonissue(iwarn, "IntelliGible: forearm is fore-warned", vs.DiagnosticSeverity.Warning)
    if (ierr>=0) nonissue(ierr, "IntelliGible: time flies like an error. OK here's a fake error:\n\n    • Found hole: _ :: Bool\n    • In the expression: _\n      In a stmt of a pattern guard for\n                     an equation for ‘substitute’:\n        _\n      In an equation for ‘substitute’:\n          substitute old new\n            | old == new = id\n            | _ = fmap $ \ item -> if item == old then new else item\n    • Relevant bindings include\n        new :: a (bound at src/Util.hs:178:17)\n        old :: a (bound at src/Util.hs:178:13)\n        substitute :: a -> a -> [a] -> [a] (bound at src/Util.hs:178:1)\n", vs.DiagnosticSeverity.Error)
    diag.set(doc.uri, nonissues)
}
