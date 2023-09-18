// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {handle} from './handler';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// console.log(context.asAbsolutePath("."));

	// 查找根目录
	let entries = vscode.workspace.workspaceFolders;
	if (entries !== undefined) {
		handle(entries[0].uri);
	}

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "test-fs" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('test-fs.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from test-fs!');
	});

	context.subscriptions.push(disposable);


	let disposable2 = vscode.commands.registerCommand('test-fs.addFile', async (uri: vscode.Uri) => {

		vscode.window.showInformationMessage(uri. toString());
	});

	context.subscriptions.push(disposable2);
}

// This method is called when your extension is deactivated
export function deactivate() {}
