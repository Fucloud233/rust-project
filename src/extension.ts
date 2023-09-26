import * as vscode from 'vscode';
import { Uri } from 'vscode'; 

import {handle} from './handler';
import {initConfig} from './config';
import { checkFile, getRootUri } from './fsUtils';

const CARGO_TOML = "Cargo.toml";

let rsWatcher: vscode.FileSystemWatcher;
let rootUri: Uri;

export async function activate(context: vscode.ExtensionContext) {
	// 初始化配置信息
	initConfig();

	// 初始化 rootUri
	let tmpRootUri = await getRootUri();
	if(tmpRootUri === undefined) {
		console.log("查找工作路径失败!");
		return;
	} else {
		rootUri = tmpRootUri;
	}

	let cargoTomlUri = vscode.Uri.joinPath(rootUri, CARGO_TOML);
	const tomlWatcher = vscode.workspace.createFileSystemWatcher(cargoTomlUri.fsPath);
	// Cargo.toml删除 插件重新激活
	tomlWatcher.onDidDelete(async (_) => {
		reactivate();
		console.log("Cargo.toml删除，重新激活!");
	});
	// Cargo.toml创建 插件不激活
	tomlWatcher.onDidCreate(async (_) => {
		deactivate();
		console.log("Cargo.toml创建，不激活!");
	});
	// 根目录中存在Cargo.Toml 不激活函数
	if(await checkFile(cargoTomlUri)) {
		console.log("存在Cargo.toml项目，不激活!");
		return;
	}
	
	reactivate();
}

function reactivate() {
    // 当创建文件的时候激活
	rsWatcher = vscode.workspace.createFileSystemWatcher("**/*.rs");
    rsWatcher.onDidCreate(async (fileUri: Uri) => {
		handle(rootUri, fileUri);
 	});
}

// This method is called when your extension is deactivated
export function deactivate() {
	rsWatcher.dispose();
}
