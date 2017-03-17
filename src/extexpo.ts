'use strict'

import * as vs from 'vscode'
import vscmd = vs.commands
import vswin = vs.window
import vsprj = vs.workspace

import * as mdown from './extmarkdown'


const disps :vs.Disposable[]    = []

let vsOut   :vs.OutputChannel           //  this global not `const` because: only want to create in `activate`, not here (but it's never mutated)
let nterms  :number             = 0     //  this global forever increments by 1, to give newly created terminals a number in the GUI



export function deactivate() {
    console.log("EXPO: cleanup")
    for (const disp of disps) disp.dispose()
    vsOut.dispose()
}


export function activate (vsctx :vs.ExtensionContext) {
    vsOut = vswin.createOutputChannel('EXPO')
    console.log("EXPO: activated")

    mdown.onActivate(vsctx, disps)
    const democommands =    {   'expo.demoMsgInfo': demoMsgInfo
                            ,   'expo.demoMsgErr': demoMsgErr
                            ,   'expo.demoMsgWarn': demoMsgWarn
                            ,   'expo.demoTerm': demoTerm
                            ,   'expo.printAllCmds': printAllCmds
                            ,   'expo.printAllExts': printAllExts
                            ,   'expo.printAllLangs': printAllLangs
                            }
    for (const cmdname in democommands)
        vsctx.subscriptions.push (
            vscmd.registerCommand(cmdname, democommands[cmdname]) )

    vsprj.onDidChangeConfiguration(onCfgChanged)
    vsprj.onDidChangeTextDocument(onDocChanged)
    vsprj.onDidCloseTextDocument( (doc)=> onDocEvent(doc, "closed") )
    vsprj.onDidOpenTextDocument( (doc)=> onDocEvent(doc, "opened from") )
    vsprj.onDidSaveTextDocument( (doc)=> onDocEvent(doc, "saved to") )
    vswin.onDidChangeActiveTextEditor( ()=> putStrLn("window.onDidChangeActiveTextEditor") )
    vswin.onDidChangeTextEditorOptions( ()=> putStrLn("window.onDidChangeTextEditorOptions") )
    vswin.onDidChangeTextEditorSelection( (sel)=> { if (sel && sel.kind) putStrLn("window.onDidChangeTextEditorSelection") } )
    vswin.onDidChangeTextEditorViewColumn( ()=> putStrLn("window.onDidChangeTextEditorViewColumn") )
    vswin.onDidChangeVisibleTextEditors( ()=> putStrLn("window.onDidChangeVisibleTextEditors") )
    vswin.onDidCloseTerminal( ()=> putStrLn("window.onDidCloseTerminal") )
    let vsl :vs.LanguageConfiguration

    const txtgen = { provideTextDocumentContent : demoTextGen }
    addDisp(vsprj.registerTextDocumentContentProvider('expo', txtgen))
}



function onReject (err :any) {
    // used for almost all promises in *this* script, *but* in practice IMHO needless clutter for
    // "robust/quasi-unbreakable"/`undefined`-returning-on-cancellation APIs like showErrorMessage etc
    vswin.showErrorMessage("Error/cancellation/issue: " + err)
}

function demoMsgInfo () {
    vswin.showInformationMessage("demoMsgInfo ➜ this is `vscode.window.showInformationMessage` in action")
        .then(vswin.showInputBox).then(putStrLn)
}

function demoMsgErr () {
    vswin.showErrorMessage("demoMsgErr ➜ this is `vscode.window.showErrorMessage` in action", "QuickPick palette..")
        .then( (palclicked)=> { if (palclicked) vswin.showQuickPick(["A choice here..","another there..","pick your choice son!"])
            .then(putStrLn , onReject) } , onReject )
}

function demoMsgWarn () {
    vswin.showWarningMessage("demoMsgWarn ➜ this is `vscode.window.showWarningMessage` in action", "Do dis", "Do dat")
        .then( (choice)=> putStrLn(choice ? choice : "(dismissed by user)"), onReject )
}

function demoTerm () {
    nterms++
    const term = vswin.createTerminal("EXPO Term #" + nterms)
    addDisp(term)
    term.show(false)
    term.sendText(`echo "You called EXPO term #${nterms}?"`)
}

function demoTextGen (uri :vs.Uri, token :vs.CancellationToken) {
    return vs.extensions.all.map( (ext)=> ext.id ).join('\n')
}

function printAllCmds () {
    vscmd.getCommands(true).then(putStrLns , onReject)
}

function printAllExts () {
    const   path = vs.Uri.parse('expo://printAllExts'),
            show = (doc)=>
                vswin.showTextDocument(doc).then(null, onReject)
    vsprj.openTextDocument(path).then(show , onReject)
}

function printAllLangs () {
    vs.languages.getLanguages().then(putStrLns , onReject)
}

function putStrLn (ln) {
    vsOut.appendLine(ln)
}

function putStrLns (lines :string[]) {
    vsOut.clear() ; vsOut.show(false)
    lines.map(putStrLn)
}

function addDisp (disp :vs.Disposable) {
    disps.push(disp)
    return disp
}

function isDocWorthy (doc :vs.TextDocument) {
    return doc.uri.scheme!=='git' && doc.uri.scheme!=='output'
}

function onDocEvent (doc :vs.TextDocument, eventdesc :string) {
    if (isDocWorthy(doc))
        addDisp(vswin.setStatusBarMessage(`EXPO: ${doc.languageId} file (${doc.lineCount} lines) ${eventdesc}: ${doc.uri}`))
}

function onDocChanged (evt :vs.TextDocumentChangeEvent) {
    const   doc = evt.document,
            msg = ()=> `EXPO: ${doc.languageId} file (${doc.lineCount} lines) ${doc.uri}: ${evt.contentChanges.length} change(s)`
    if (isDocWorthy(doc))
        addDisp(vswin.setStatusBarMessage(msg()))
}

function onCfgChanged () {
    addDisp(vswin.setStatusBarMessage("EXPO: configuration changed"))
}
