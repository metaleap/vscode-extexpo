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
    d.push( vslang.registerCodeActionsProvider(_md, { provideCodeActions: onActions }) )
}


function onHover (doc :vs.TextDocument, pos :vs.Position, cancel :vs.CancellationToken) {
    const txt = doc.getText(doc.getWordRangeAtPosition(pos))
    return new vs.Hover({ language: _md , value: "**Marty**.. a `" + txt + "` isn't a hoverboard!" })
}

function onActions (doc :vs.TextDocument, range :vs.Range, ctx :vs.CodeActionContext, cancel :vs.CancellationToken) {
    const actions :vs.Command[] = [ codeAction_Replace ]
    // const doctxt = doc.getText(range) // this is either selection-text OR current-word-under-caret
    return actions
}

function onCodeAction_Replace (ed :vs.TextEditor, op :vs.TextEditorEdit, ...args :any[]) {
    for (const sel of ed.selections) {
        op.replace(sel, "EXPO")
    }
}
