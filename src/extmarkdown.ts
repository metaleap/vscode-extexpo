'use strict'

import * as vs from 'vscode'
import vscmd = vs.commands
import vslang = vs.languages
import vswin = vs.window

const _md                   = 'markdown'
const defLocation           = new vs.Location( vs.Uri.parse('expo://printAllExts'), new vs.Position (
                                vs.extensions.all.findIndex( (vsx)=> vsx.id=='metaleap.vscode-extexpo' ) + 1, 0) )
const codeAction_Replace    = { arguments: [], command: 'expo.replaceExpo',
                                title: "Replace selection with 'EXPO'" }


export function onActivate (vsctx :vs.ExtensionContext, disps :vs.Disposable[]) {
    disps.push( vscmd.registerTextEditorCommand('expo.replaceExpo', onCodeAction_Replace) )
    disps.push( vslang.registerHoverProvider(_md, { provideHover: onHover }) )
    disps.push( vslang.registerCodeActionsProvider(_md, { provideCodeActions: onCodeActions }) )
    disps.push( vslang.registerCodeLensProvider(_md, { provideCodeLenses: onCodeLenses }) )
    disps.push( vslang.registerCompletionItemProvider(_md, { provideCompletionItems: onCompletion }, "e", "E", "x", "X") )
    disps.push( vslang.registerDefinitionProvider(_md, { provideDefinition: onDefinition }) )
    // no need for this DocumentFormattingEdit as we already have DocumentRangeFormattingEdit further down
    //      disps.push( vslang.registerDocumentFormattingEditProvider(_md, { provideDocumentFormattingEdits: <like onRangeFormattingEdits without range> }) )
    disps.push( vslang.registerDocumentHighlightProvider(_md, { provideDocumentHighlights: onHighlights }) )
    disps.push( vslang.registerDocumentLinkProvider(_md, { provideDocumentLinks: onLinks }) )
    disps.push( vslang.registerDocumentRangeFormattingEditProvider(_md, { provideDocumentRangeFormattingEdits: onRangeFormattingEdits }) )
    disps.push( vslang.registerDocumentSymbolProvider(_md, { provideDocumentSymbols: onSymbols }) )
    disps.push( vslang.registerImplementationProvider(_md, { provideImplementation: onImplementation }) )
    disps.push( vslang.registerReferenceProvider(_md, { provideReferences: onReference }) )
    disps.push( vslang.registerRenameProvider(_md, { provideRenameEdits: onRename }) )
    disps.push( vslang.registerSignatureHelpProvider(_md, { provideSignatureHelp: onSignature }, " ", "\t") )
    disps.push( vslang.registerTypeDefinitionProvider(_md, { provideTypeDefinition: onTypeDef }) )
    disps.push( vslang.registerWorkspaceSymbolProvider({ provideWorkspaceSymbols: onProjSymbols }) )
}


function onHover (doc :vs.TextDocument, pos :vs.Position, cancel :vs.CancellationToken) {
    const txt = doc.getText(doc.getWordRangeAtPosition(pos))
    return new vs.Hover({ language: _md , value: "**Marty**.. a `" + txt + "` isn't a hoverboard!" })
}

function onCodeActions (doc :vs.TextDocument, range :vs.Range, ctx :vs.CodeActionContext, cancel :vs.CancellationToken) {
    const actions :vs.Command[] = [ codeAction_Replace ]
    // const doctxt = doc.getText(range) // this is either selection-text OR current-word-under-caret
    return actions
}

function onCodeAction_Replace (ed :vs.TextEditor, op :vs.TextEditorEdit, ...args :any[]) {
    for (const sel of ed.selections)
        op.replace(sel, "EXPO")
}

function onCodeLenses (doc :vs.TextDocument, cancel :vs.CancellationToken) {
    return [ new vs.CodeLens(new vs.Range(0, 0, 1, 0), codeAction_Replace) ]
}

function onCompletion (doc :vs.TextDocument, pos :vs.Position, cancel :vs.CancellationToken) {
    const   cmplexpo = new vs.CompletionItem("Auto-complete: expo", vs.CompletionItemKind.Reference),
            cmplEXPO = new vs.CompletionItem("Auto-complete: EXPO", vs.CompletionItemKind.Folder)
    cmplEXPO.insertText = "EXPO" ; cmplEXPO.detail = "onCompletion()"
    cmplexpo.insertText = "expo" ; cmplexpo.documentation = "Need expolanation? Look in `onCompletion()`.."
    return [cmplexpo, cmplEXPO]
}

function onDefinition (doc :vs.TextDocument, pos :vs.Position, cancel :vs.CancellationToken) {
    const txt = doc.getText(doc.getWordRangeAtPosition(pos))
    return ("expo" === txt.toLowerCase()) ? defLocation : null
}

function findRanges (doc :vs.TextDocument, needle :string, ignorecase :boolean) {
    const ranges :vs.Range[] = []
    let last = -1 , tmp , txt = ignorecase ? doc.getText().toLowerCase() : doc.getText()
    if (ignorecase)
        needle = needle.toLowerCase()
    for ( let i = txt.indexOf(needle)   ;   i>=0   ;   i = txt.indexOf(needle) ) {
        tmp = last + i + 1   ;   last = tmp   ;   txt = txt.substr(i + 1)
        ranges.push( doc.getWordRangeAtPosition(doc.positionAt(tmp)) )
    }
    return ranges
}

function onHighlights (doc :vs.TextDocument, pos :vs.Position, cancel :vs.CancellationToken) {
    return findRanges(doc, "expo", true).map( (r)=> new vs.DocumentHighlight(r) )
}

function onLinks (doc :vs.TextDocument, cancel :vs.CancellationToken) {
    return findRanges(doc, 'expo://', true).map( (r)=> new vs.DocumentLink(r, defLocation.uri) )
}

function onRangeFormattingEdits (doc :vs.TextDocument, range :vs.Range, opt :vs.FormattingOptions, cancel :vs.CancellationToken) {
    const   txtold = doc.getText(range),
            txtnew = txtold.split(' ').join('\n')
    return [ vs.TextEdit.replace(range, txtnew) ]
}

function onSymbols (doc :vs.TextDocument, cancel :vs.CancellationToken) {
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

function onImplementation (doc :vs.TextDocument, pos :vs.Position, cancel :vs.CancellationToken) {
    return ("expo"===doc.getText(doc.getWordRangeAtPosition(pos)).toLowerCase())
        ? [defLocation] : []
}

function onReference (doc :vs.TextDocument, pos :vs.Position, ctx :vs.ReferenceContext, cancel :vs.CancellationToken) {
    return [defLocation]
}

function onRename (doc :vs.TextDocument, pos :vs.Position, newname :string, cancel :vs.CancellationToken) {
    const wrap = new vs.WorkspaceEdit()
    const oldname = doc.getText(doc.getWordRangeAtPosition(pos))
    wrap.set( doc.uri , findRanges(doc, oldname, false).map(
        (r)=> vs.TextEdit.replace(r, newname) ) )
    return wrap
}

function onSignature (doc :vs.TextDocument, pos :vs.Position, cancel :vs.CancellationToken) {
    const sig = new vs.SignatureHelp()
    sig.activeParameter = 0 ; sig.activeSignature = 0
    sig.signatures = [ new vs.SignatureInformation("Sig label", "Sig help text") ]
    return sig
}

function onTypeDef (doc :vs.TextDocument, pos :vs.Position, cancel :vs.CancellationToken) {
    return defLocation
}

function onProjSymbols (query :string, cancel :vs.CancellationToken) {
    return [    new vs.SymbolInformation("expo", vs.SymbolKind.Package, "EXPO", defLocation),
                new vs.SymbolInformation("EXPO", vs.SymbolKind.Package, "expo", defLocation) ]
}
