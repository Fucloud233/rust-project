import * as vscode from 'vscode';
import * as path from 'path';

import { Uri } from 'vscode'; 
import { NotFoundError } from '../error';

// 如果rootUri没有被加载 则是null 否则Uri/undefined
let rootUri: Uri = initRootUri();

function initRootUri(): Uri {
    // [注意]这里返回数组只是因为vscode可能会打开多个数组
    let entries = vscode.workspace.workspaceFolders;
    if (entries === undefined || entries.length === 0) {
        throw new NotFoundError("The RootUri");
    } 
    
    return entries[0].uri;
}

/**
 * 
 * @returns 返回当前工作区的第一个工作路径
 */
export function getRootUri(): Uri {
    return rootUri;
}

export function getRelativeUri(fileUri: Uri): string {
    return path.relative(getRootUri().fsPath, fileUri.fsPath);
}

export function getAbsoluteUri(fileUri: string): Uri {
    return Uri.joinPath(getRootUri(), fileUri);
}

// 验证文件是否存在
export async function checkFile(fileUri: vscode.Uri): 
    Promise<vscode.FileStat | undefined> {
        
    return await vscode.workspace.fs.stat(fileUri).then(
        (fileStat) => {
            return fileStat; 
        },
        () => { return undefined; }
    );
}

// 读取文件
export async function readFile(fileUri: vscode.Uri): Promise<Uint8Array> {
    return await vscode.workspace.fs.readFile(fileUri).then(
        (settingsData) => { return settingsData; },
        () => { throw vscode.FileSystemError.FileNotFound; },
    );
}

// 读取Json文件
export async function readJsonFile(fileUri: vscode.Uri): Promise<any | undefined> {
    try {
        const data = await readFile(fileUri);
        
        let dataStr;
        // 当读取到空文件的时候 需要额外处理
        if(data.length) {
            dataStr = Buffer.from(data).toString();
        } else {
            dataStr = "{}";
        }

        return JSON.parse(dataStr);
    } catch (error) {
        // FIXME: 捕获解析失败的错误
        throw error;
    }
}

// 写入文件
export async function writeFile(fileUri: vscode.Uri, content: Uint8Array) {
    await vscode.workspace.fs.writeFile(fileUri, content).then(
        // FIXME: 捕获文件是否存在
        ()=>{}, (reason) => {
            throw new vscode.FileSystemError(reason);
        }
    );
}

// 写入Json文件
export async function writeJsonFile(fileUri: vscode.Uri, content: any) {
    const data = new TextEncoder().encode(JSON.stringify(content, null, '\t'));
    writeFile(fileUri, data);
} 
