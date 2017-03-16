'use strict'

import * as vscode from 'vscode'
import vscmd = vscode.commands
import vswin = vscode.window
import vsprj = vscode.workspace


const vsOut :vscode.OutputChannel = vswin.createOutputChannel("EXPO")
const disps :vscode.Disposable[]  = []

const handleError = (err :any) =>
    vswin.showErrorMessage("Epic fail: "+err)

const demoMsgInfo = () =>
    vswin.showInformationMessage("demoMsgInfo ➜ this is `vscode.window.showInformationMessage` in action")

const demoMsgErr = () =>
    vswin.showErrorMessage("demoMsgErr ➜ this is `vscode.window.showErrorMessage` in action")

const demoMsgWarn = () =>
    vswin.showWarningMessage("demoMsgWarn ➜ this is `vscode.window.showWarningMessage` in action", "Do dis", "Do dat")
            .then((choice) => vsOut.appendLine(choice ? choice : "(dismissed by user)"), handleError)

const demoTextGen = (uri :vscode.Uri, token :vscode.CancellationToken) =>
    vscode.extensions.all.map( (ext) => ext.id ).join('\n')

const printAllCmds = () =>
    vscmd.getCommands(true).then(printLines , handleError)

function printAllExts () {
    const   path = vscode.Uri.parse("expo://printAllExts"),
            show = (doc) =>
                vswin.showTextDocument(doc).then(null, handleError)
    vsprj.openTextDocument(path).then(show , handleError)
}

const printAllLangs = () =>
    vscode.languages.getLanguages().then(printLines , handleError)

function printLines (lines :string[]) {
    vsOut.clear() ; vsOut.show(false)
    lines.map( (line) => vsOut.appendLine(line) )
}

function addDisp (disp :vscode.Disposable) {
    disps.push(disp)
    return disp
}

function onDocEvent (doc :vscode.TextDocument, eventdesc :string) {
    if (doc.uri.scheme!=="git")
        addDisp(vswin.setStatusBarMessage("EXPO: " + doc.languageId + " file (" + doc.lineCount + " lines) " + eventdesc + ": " + doc.uri))
}

function onDocOpened (doc :vscode.TextDocument) {
    onDocEvent(doc, "opened from")
}

function onDocSaved (doc :vscode.TextDocument) {
    onDocEvent(doc, "saved to")
}

function onDocClosed (doc :vscode.TextDocument) {
    onDocEvent(doc, "closed")
}

function onDocChanged (evt :vscode.TextDocumentChangeEvent) {
    const   doc = evt.document,
            msg = "EXPO: " + doc.languageId + " file (" + doc.lineCount + " lines) " + doc.uri + ": " + evt.contentChanges.length + " change(s)"
    addDisp(vswin.setStatusBarMessage(msg))
}

function onCfgChanged () {
    addDisp(vswin.setStatusBarMessage("EXPO: configuration changed"))
}


export function activate (context :vscode.ExtensionContext) {
    console.log("EXPO: activated")

    const democommands =    {   'expo.demoMsgInfo': demoMsgInfo
                            ,   'expo.demoMsgErr': demoMsgErr
                            ,   'expo.demoMsgWarn': demoMsgWarn
                            ,   'expo.printAllCmds': printAllCmds
                            ,   'expo.printAllExts': printAllExts
                            ,   'expo.printAllLangs': printAllLangs
                            }
    for (const cmdname in democommands)
        context.subscriptions.push (
            vscmd.registerCommand(cmdname, democommands[cmdname]) )

    vsprj.onDidChangeConfiguration(onCfgChanged)
    vsprj.onDidChangeTextDocument(onDocChanged)
    vsprj.onDidCloseTextDocument(onDocClosed)
    vsprj.onDidOpenTextDocument(onDocOpened)
    vsprj.onDidSaveTextDocument(onDocSaved)

    const txtgen = { provideTextDocumentContent : demoTextGen }
    addDisp(vsprj.registerTextDocumentContentProvider("expo", txtgen))
}

export function deactivate() {
    console.log("EXPO: cleanup")
    for (const disp of disps) disp.dispose()
    vsOut.dispose()
}
