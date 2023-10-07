// [注意] 此依赖用于class-transformer 不能删除
import 'reflect-metadata';
import * as vscode from 'vscode';
import { Uri } from 'vscode'; 

import { handleCreate, handleDelete } from './handler';
import {initConfig} from './config';
import { checkFile, getRootUri } from './utils/fs';
import { addCrateToCmd } from './command';
import { loadSettingsFile } from './info/settingsFile';

const CARGO_TOML = "Cargo.toml";

let rsWatcher: vscode.FileSystemWatcher;

export async function activate(context: vscode.ExtensionContext) {
	// 初始化配置信息
	initConfig();

	// 初始化 rootUri
	let rootUri = getRootUri();
	if(rootUri === undefined) {
		console.log("查找工作路径失败!");
		return;
	}

	let cargoTomlUri = vscode.Uri.joinPath(rootUri, CARGO_TOML);
	const tomlWatcher = vscode.workspace.createFileSystemWatcher(cargoTomlUri.fsPath);
	// Cargo.toml删除 插件重新激活
	tomlWatcher.onDidDelete(async (_) => {
		reactivate(context);
		console.log("Cargo.toml删除，重新激活!");
	});
	// Cargo.toml创建 插件不激活
	tomlWatcher.onDidCreate(async (_) => {
		deactivate(context);
		console.log("Cargo.toml创建，不激活!");
	});

	// 根目录中存在Cargo.Toml 不激活函数
	if(await checkFile(cargoTomlUri)) {
		console.log("存在Cargo.toml项目，不激活!");
		return;
	}
	
	reactivate(context);

	console.log("rust-project extension is activated sucessfully!");
}

function reactivate(context: vscode.ExtensionContext) {
	// TODO: 目前只负责Auto模式 之后需要移动
	// 初始化设置文件
	loadSettingsFile();

    // 当创建文件的时候激活
	rsWatcher = vscode.workspace.createFileSystemWatcher("**/*.rs");
    rsWatcher.onDidCreate(async (fileUri: Uri) => {
		handleCreate(fileUri);
 	});
	rsWatcher.onDidDelete(async (fileUri: Uri) => {
		handleDelete(fileUri);
	});

	context.subscriptions.push(addCrateToCmd);
}

// This method is called when your extension is deactivated
export function deactivate(context: vscode.ExtensionContext) {
	rsWatcher.dispose();

	context.subscriptions.splice(0, context.subscriptions.length);
}
