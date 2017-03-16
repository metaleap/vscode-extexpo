'use strict'

import * as vs from 'vscode'
import vscmd = vs.commands
import vslang = vs.languages
import vswin = vs.window

const _md               = 'markdown'
const codeAction_Replace = { arguments: [], command: 'expo.replaceExpo',
                            title: "Replace with 'EXPO' (invokes `expo.replaceExpo` command, which invokes `onCodeAction_Replace()`)" }


export function onActivate (vsctx :vs.ExtensionContext, d :vs.Disposable[]) {
    d.push( vscmd.registerTextEditorCommand('expo.replaceExpo', onCodeAction_Replace) )
    d.push( vslang.registerHoverProvider(_md, { provideHover: onHover }) )
    d.push( vslang.registerCodeActionsProvider(_md, { provideCodeActions: onCodeActions }) )
    d.push( vslang.registerCodeLensProvider(_md, { provideCodeLenses: onCodeLenses }) )
    d.push( vslang.registerCompletionItemProvider(_md, { provideCompletionItems: onCompletion }, "e", "E", "x", "X") )
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

function onCodeAction_Replace (ed :vs.TextEditor, op :vs.TextEditorEdit, ...args :any[]) {
    for (const sel of ed.selections)
        op.replace(sel, "EXPO")
}
