'use strict'

import * as vs from 'vscode'
import vscmd = vs.commands
import vslang = vs.languages
import vswin = vs.window

const _md                   = 'markdown'
const defLocation           = new vs.Location( vs.Uri.parse('expo://printAllExts'), new vs.Position (
                                vs.extensions.all.findIndex( (vsx)=> vsx.id=="metaleap.vscode-extexpo" ) + 1, 0) )
const codeAction_Replace    = { arguments: [], command: 'expo.replaceExpo',
                                title: "Replace with 'EXPO' (invokes `expo.replaceExpo` command, which invokes `onCodeAction_Replace()`)" }


export function onActivate (vsctx :vs.ExtensionContext, disps :vs.Disposable[]) {
    disps.push( vscmd.registerTextEditorCommand('expo.replaceExpo', onCodeAction_Replace) )
    disps.push( vslang.registerHoverProvider(_md, { provideHover: onHover }) )
    disps.push( vslang.registerCodeActionsProvider(_md, { provideCodeActions: onCodeActions }) )
    disps.push( vslang.registerCodeLensProvider(_md, { provideCodeLenses: onCodeLenses }) )
    disps.push( vslang.registerCompletionItemProvider(_md, { provideCompletionItems: onCompletion }, "e", "E", "x", "X") )
    disps.push( vslang.registerDefinitionProvider(_md, { provideDefinition: onDefinition }) )
    disps.push( vslang.registerDocumentFormattingEditProvider(_md, { provideDocumentFormattingEdits: onFormatting }) )
    disps.push( vslang.registerDocumentHighlightProvider(_md, { provideDocumentHighlights: onHighlights }) )
    disps.push( vslang.registerDocumentLinkProvider(_md, { provideDocumentLinks: onLinks }) )
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

function onFormatting (doc :vs.TextDocument, opt :vs.FormattingOptions, cancel :vs.CancellationToken) {
    const   txtold = doc.getText(),
            txtnew = txtold.split(" ").join("\n")
    return [ vs.TextEdit.replace(new vs.Range(doc.positionAt(0), doc.positionAt(txtold.length)), txtnew) ]
}

function findRanges (doc :vs.TextDocument, needle :string) {
    const ranges = []
    let last = -1 , tmp , txt = doc.getText().toLowerCase()
    for ( let i = txt.indexOf(needle)   ;   i>=0   ;   i = txt.indexOf(needle) ) {
        tmp = last + i + 1   ;   last = tmp   ;   txt = txt.substr(i + 1)
        ranges.push( doc.getWordRangeAtPosition(doc.positionAt(tmp)) )
    }
    return ranges
}

function onHighlights (doc :vs.TextDocument, pos :vs.Position, cancel :vs.CancellationToken) {
    return findRanges(doc, "expo").map( (r)=> new vs.DocumentHighlight(r) )
}

function onLinks (doc :vs.TextDocument, cancel :vs.CancellationToken) {
    return findRanges(doc, "expo://").map( (r)=> new vs.DocumentLink(r, defLocation.uri) )
}
