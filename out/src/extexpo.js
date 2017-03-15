'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
var demoInfoMsg = () => vscode.window.showInformationMessage("demoInfoMsg ➜ this is `vscode.window.showInformationMessage` in action.");
function activate(context) {
    console.log("EXPO: activated");
    let cmd = vscode.commands.registerCommand('expo.demoInfoMsg', demoInfoMsg);
    context.subscriptions.push(cmd);
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extexpo.js.map