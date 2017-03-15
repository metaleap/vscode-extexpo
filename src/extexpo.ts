'use strict'

import * as vscode from 'vscode'


var demoInfoMsg = () =>
    vscode.window.showInformationMessage("demoInfoMsg ➜ this is `vscode.window.showInformationMessage` in action.")


export function activate(context: vscode.ExtensionContext) {
    console.log("EXPO: activated")

    let cmd = vscode.commands.registerCommand('expo.demoInfoMsg', demoInfoMsg)
    context.subscriptions.push(cmd)
}

export function deactivate() {
}
