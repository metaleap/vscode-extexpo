'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
var vscmd = vscode.commands;
var vswin = vscode.window;
var vsprj = vscode.workspace;
let vsOut;
let nterms = 0;
const lot = [];
function deactivate() {
    console.log("EXPO: cleanup");
    for (const disp of lot)
        disp.dispose();
    vsOut.dispose();
}
exports.deactivate = deactivate;
function activate(context) {
    vsOut = vswin.createOutputChannel('EXPO');
    console.log("EXPO: activated");
    const democommands = { 'expo.demoMsgInfo': demoMsgInfo,
        'expo.demoMsgErr': demoMsgErr,
        'expo.demoMsgWarn': demoMsgWarn,
        'expo.demoTerm': demoTerm,
        'expo.printAllCmds': printAllCmds,
        'expo.printAllExts': printAllExts,
        'expo.printAllLangs': printAllLangs
    };
    for (const cmdname in democommands)
        context.subscriptions.push(vscmd.registerCommand(cmdname, democommands[cmdname]));
    vsprj.onDidChangeConfiguration(onCfgChanged);
    vsprj.onDidChangeTextDocument(onDocChanged);
    vsprj.onDidCloseTextDocument((doc) => onDocEvent(doc, "closed"));
    vsprj.onDidOpenTextDocument((doc) => onDocEvent(doc, "opened from"));
    vsprj.onDidSaveTextDocument((doc) => onDocEvent(doc, "saved to"));
    vswin.onDidChangeActiveTextEditor((_) => putStrLn("window.onDidChangeActiveTextEditor"));
    vswin.onDidChangeTextEditorOptions((_) => putStrLn("window.onDidChangeTextEditorOptions"));
    vswin.onDidChangeTextEditorSelection((sel) => { if (sel && sel.kind)
        putStrLn("window.onDidChangeTextEditorSelection"); });
    vswin.onDidChangeTextEditorViewColumn((_) => putStrLn("window.onDidChangeTextEditorViewColumn"));
    vswin.onDidChangeVisibleTextEditors((_) => putStrLn("window.onDidChangeVisibleTextEditors"));
    vswin.onDidCloseTerminal((_) => putStrLn("window.onDidCloseTerminal"));
    const txtgen = { provideTextDocumentContent: demoTextGen };
    addDisp(vsprj.registerTextDocumentContentProvider('expo', txtgen));
}
exports.activate = activate;
function handleError(err) {
    vswin.showErrorMessage("Error/cancellation/issue: " + err);
}
function demoMsgInfo() {
    vswin.showInformationMessage("demoMsgInfo ➜ this is `vscode.window.showInformationMessage` in action")
        .then((_) => vswin.showInputBox().then(putStrLn));
}
function demoMsgErr() {
    vswin.showErrorMessage("demoMsgErr ➜ this is `vscode.window.showErrorMessage` in action", "QuickPick palette..")
        .then((pal) => { if (pal)
        vswin.showQuickPick(["A choice here..", "another there..", "pick your choice son!"]).then((pick) => putStrLn(pick)); }, handleError);
}
function demoMsgWarn() {
    vswin.showWarningMessage("demoMsgWarn ➜ this is `vscode.window.showWarningMessage` in action", "Do dis", "Do dat")
        .then((choice) => putStrLn(choice ? choice : "(dismissed by user)"), handleError);
}
function demoTerm() {
    nterms++;
    const term = vswin.createTerminal("EXPO Term " + nterms);
    addDisp(term);
    term.show(false);
    term.sendText("echo \"You called EXPO on line " + nterms + "?\"");
}
function demoTextGen(uri, token) {
    return vscode.extensions.all.map((ext) => ext.id).join('\n');
}
function printAllCmds() {
    vscmd.getCommands(true).then(putStrLns, handleError);
}
function printAllExts() {
    const path = vscode.Uri.parse('expo://printAllExts'), show = (doc) => vswin.showTextDocument(doc).then(null, handleError);
    vsprj.openTextDocument(path).then(show, handleError);
}
function printAllLangs() {
    vscode.languages.getLanguages().then(putStrLns, handleError);
}
function putStrLn(ln) {
    vsOut.appendLine(ln);
}
function putStrLns(lines) {
    vsOut.clear();
    vsOut.show(false);
    lines.map(putStrLn);
}
function addDisp(disp) {
    lot.push(disp);
    return disp;
}
function isDocWorthy(doc) {
    return doc.uri.scheme !== "git" && doc.uri.scheme !== "output";
}
function onDocEvent(doc, eventdesc) {
    if (isDocWorthy(doc))
        addDisp(vswin.setStatusBarMessage("EXPO: " + doc.languageId + " file (" + doc.lineCount + " lines) " + eventdesc + ": " + doc.uri));
}
function onDocChanged(evt) {
    const doc = evt.document, msg = () => "EXPO: " + doc.languageId + " file (" + doc.lineCount + " lines) " + doc.uri + ": " + evt.contentChanges.length + " change(s)";
    if (isDocWorthy(doc))
        addDisp(vswin.setStatusBarMessage(msg()));
}
function onCfgChanged() {
    addDisp(vswin.setStatusBarMessage("EXPO: configuration changed"));
}
//# sourceMappingURL=extexpo.js.map