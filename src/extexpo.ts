'use strict'

import * as vscode from 'vscode'
import vscmd = vscode.commands
import vswin = vscode.window
import vsprj = vscode.workspace


let vsOut   :vscode.OutputChannel
let nterms  :number                 = 0
const lot   :vscode.Disposable[]    = []



export function deactivate() {
    console.log("EXPO: cleanup")
    for (const disp of lot) disp.dispose()
    vsOut.dispose()
}

export function activate (context :vscode.ExtensionContext) {
    vsOut = vswin.createOutputChannel('EXPO')
    console.log("EXPO: activated")

    const democommands =    {   'expo.demoMsgInfo': demoMsgInfo
                            ,   'expo.demoMsgErr': demoMsgErr
                            ,   'expo.demoMsgWarn': demoMsgWarn
                            ,   'expo.demoTerm': demoTerm
                            ,   'expo.printAllCmds': printAllCmds
                            ,   'expo.printAllExts': printAllExts
                            ,   'expo.printAllLangs': printAllLangs
                            }
    for (const cmdname in democommands)
        context.subscriptions.push (
            vscmd.registerCommand(cmdname, democommands[cmdname]) )

    vsprj.onDidChangeConfiguration(onCfgChanged)
    vsprj.onDidChangeTextDocument(onDocChanged)
    vsprj.onDidCloseTextDocument( (doc) => onDocEvent(doc, "closed") )
    vsprj.onDidOpenTextDocument( (doc) => onDocEvent(doc, "opened from") )
    vsprj.onDidSaveTextDocument( (doc) => onDocEvent(doc, "saved to") )
    vswin.onDidChangeActiveTextEditor((_) => putStrLn("window.onDidChangeActiveTextEditor"))
    vswin.onDidChangeTextEditorOptions((_) => putStrLn("window.onDidChangeTextEditorOptions"))
    vswin.onDidChangeTextEditorSelection((sel) => { if (sel && sel.kind) putStrLn("window.onDidChangeTextEditorSelection") })
    vswin.onDidChangeTextEditorViewColumn((_) => putStrLn("window.onDidChangeTextEditorViewColumn"))
    vswin.onDidChangeVisibleTextEditors((_) => putStrLn("window.onDidChangeVisibleTextEditors"))
    vswin.onDidCloseTerminal((_) => putStrLn("window.onDidCloseTerminal"))

    const txtgen = { provideTextDocumentContent : demoTextGen }
    addDisp(vsprj.registerTextDocumentContentProvider('expo', txtgen))
}



function handleError (err :any) {
    vswin.showErrorMessage("Error/cancellation/issue: "+err)
}

function demoMsgInfo () {
    vswin.showInformationMessage("demoMsgInfo ➜ this is `vscode.window.showInformationMessage` in action")
        .then((_) => vswin.showInputBox().then(putStrLn))
}

function demoMsgErr () {
    vswin.showErrorMessage("demoMsgErr ➜ this is `vscode.window.showErrorMessage` in action", "QuickPick palette..")
        .then( (pal) => { if (pal) vswin.showQuickPick(["A choice here..","another there..","pick your choice son!"]).then((pick) => putStrLn(pick)) } , handleError )
}

function demoMsgWarn () {
    vswin.showWarningMessage("demoMsgWarn ➜ this is `vscode.window.showWarningMessage` in action", "Do dis", "Do dat")
        .then((choice) => putStrLn(choice ? choice : "(dismissed by user)"), handleError)
}

function demoTerm () {
    nterms++
    const term = vswin.createTerminal("EXPO Term " + nterms)
    addDisp(term)
    term.show(false)
    term.sendText("echo \"You called EXPO on line " + nterms + "?\"")
}

function demoTextGen (uri :vscode.Uri, token :vscode.CancellationToken) {
    return vscode.extensions.all.map( (ext) => ext.id ).join('\n')
}

function printAllCmds () {
    vscmd.getCommands(true).then(putStrLns , handleError)
}

function printAllExts () {
    const   path = vscode.Uri.parse('expo://printAllExts'),
            show = (doc) =>
                vswin.showTextDocument(doc).then(null, handleError)
    vsprj.openTextDocument(path).then(show , handleError)
}

function printAllLangs () {
    vscode.languages.getLanguages().then(putStrLns , handleError)
}

function putStrLn (ln) {
    vsOut.appendLine(ln)
}

function putStrLns (lines :string[]) {
    vsOut.clear() ; vsOut.show(false)
    lines.map(putStrLn)
}

function addDisp (disp :vscode.Disposable) {
    lot.push(disp)
    return disp
}

function isDocWorthy (doc :vscode.TextDocument) {
    return doc.uri.scheme!=="git" && doc.uri.scheme!=="output"
}

function onDocEvent (doc :vscode.TextDocument, eventdesc :string) {
    if (isDocWorthy(doc))
        addDisp(vswin.setStatusBarMessage("EXPO: " + doc.languageId + " file (" + doc.lineCount + " lines) " + eventdesc + ": " + doc.uri))
}

function onDocChanged (evt :vscode.TextDocumentChangeEvent) {
    const   doc = evt.document,
            msg = () => "EXPO: " + doc.languageId + " file (" + doc.lineCount + " lines) " + doc.uri + ": " + evt.contentChanges.length + " change(s)"
    if (isDocWorthy(doc))
        addDisp(vswin.setStatusBarMessage(msg()))
}

function onCfgChanged () {
    addDisp(vswin.setStatusBarMessage("EXPO: configuration changed"))
}
