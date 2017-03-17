'use strict'

import * as vs from 'vscode'
import vscmd = vs.commands
import vslang = vs.languages

const enum Case { Ignore , Respect }


const   lang_md                         = 'markdown'
    ,   cmpls :vs.CompletionItem[]      = []
    ,   symbols :vs.SymbolInformation[] = []
    ,   defLocation :vs.Location        = new vs.Location( vs.Uri.parse('expo://printAllExts'), new vs.Position (
                                            vs.extensions.all.findIndex( (vsx)=> vsx.id=='metaleap.vscode-extexpo' ) + 1, 0) )
    ,   codeAction_Replace :vs.Command  = { arguments: [], command: 'expo.replaceExpo',
                                            title: "Replace selection with 'EXPO'" }


function thenish<T> (result : ()=>T) {
    return new Promise<T>( (resolve)=> { resolve(result()) } )
}


export function hijackAllMarkdownEditors (disps :vs.Disposable[]) {
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
    const txt = doc.getText(doc.getWordRangeAtPosition(pos))
    return thenish( () => new vs.Hover({ language: lang_md , value: "**Marty**.. a `" + txt + "` isn't a hoverboard!" }) )
}

function onCodeActions (_doc :vs.TextDocument, _range :vs.Range, _ctx :vs.CodeActionContext, _cancel :vs.CancellationToken) {
    return [ codeAction_Replace ]
}

function onCodeAction_Replace (ed :vs.TextEditor, op :vs.TextEditorEdit, ..._args :any[]) {
    for (const sel of ed.selections)
        op.replace(sel, "EXPO")
}

function onCodeLenses (_doc :vs.TextDocument, _cancel :vs.CancellationToken) {
    return [ new vs.CodeLens(new vs.Range(0, 0, 1, 0), codeAction_Replace) ]
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
    return ("expo" === txt.toLowerCase()) ? defLocation : null
}

function onHighlights (doc :vs.TextDocument, _pos :vs.Position, _cancel :vs.CancellationToken) {
    return findRanges(doc, "expo", Case.Ignore).map( (r)=> new vs.DocumentHighlight(r) )
}

function onLinks (doc :vs.TextDocument, _cancel :vs.CancellationToken) {
    return findRanges(doc, 'expo://', Case.Ignore).map( (r)=> new vs.DocumentLink(r, defLocation.uri) )
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
    const edits = new vs.WorkspaceEdit()
    const oldname = doc.getText(doc.getWordRangeAtPosition(pos))
    edits.set( doc.uri , findRanges(doc, oldname, Case.Respect).map(
        (r)=> vs.TextEdit.replace(r, newname) ) )
    return edits
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
    const ranges :vs.Range[] = []
    let last = -1 , tmp :number, txt = (casing===Case.Ignore) ? doc.getText().toLowerCase() : doc.getText()
    if (casing===Case.Ignore)
        needle = needle.toLowerCase()
    for ( let i = txt.indexOf(needle)   ;   i>=0   ;   i = txt.indexOf(needle) ) {
        tmp = last + i + 1   ;   last = tmp   ;   txt = txt.substr(i + 1)
        ranges.push( doc.getWordRangeAtPosition(doc.positionAt(tmp)) as vs.Range )
    }
    return ranges
}
