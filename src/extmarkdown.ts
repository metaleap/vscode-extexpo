'use strict'

import * as vs from 'vscode'
import vscmd = vs.commands
import vslang = vs.languages
import vswin = vs.window

const _md = 'markdown'
const codeAction_ToUpper = { arguments: [ true ], command: 'expo.mdUpOrLo', title: "toUpper: invokes `expo.mdUpOrLo` command to call `onActionToUpOrLo()`" }
const codeAction_ToLower = { arguments: [ false ], command: 'expo.mdUpOrLo', title: "toLower: invokes `expo.mdUpOrLo` command to call `onActionToUpOrLo()`" }


export function onActivate (vsctx :vs.ExtensionContext, d :vs.Disposable[]) {
    d.push(vscmd.registerTextEditorCommand('expo.mdUpOrLo', onActionToUpOrLo))
    d.push(vslang.registerHoverProvider(_md, { provideHover: onHover }))
    d.push(vslang.registerCodeActionsProvider(_md, { provideCodeActions: onActions }))
}


function onHover (doc :vs.TextDocument, pos :vs.Position, cancel :vs.CancellationToken) {
    const txt = doc.getText(doc.getWordRangeAtPosition(pos))
    return new vs.Hover({ language: _md , value: "**Marty**.. a `" + txt + "` isn't a hoverboard!" })
}

function onActions (doc :vs.TextDocument, range :vs.Range, ctx :vs.CodeActionContext, cancel :vs.CancellationToken) {
    const actions :vs.Command[] = []
    const ed = vswin.activeTextEditor
    // const doctxt = doc.getText(range) // either selection OR current word under text-cursor
    const edtxt = ed ? ed.document.getText(ed.selection) : null
    if (edtxt) {
        console.log("["+edtxt+"]")
        actions.push(codeAction_ToUpper)
        actions.push(codeAction_ToLower)
    }
    return actions
}

function onActionToUpOrLo (ed :vs.TextEditor, op :vs.TextEditorEdit, upper :boolean) {
    const txt = ed.document.getText(ed.selection)
    if (txt)
        for (const sel of ed.selections)
            op.replace(sel, upper ? txt.toUpperCase() : txt.toLowerCase())
}
