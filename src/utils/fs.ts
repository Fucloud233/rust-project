import * as vscode from 'vscode';
import * as path from 'path';

import { Uri, FileStat } from 'vscode'; 
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

// 将Uri类型链接转换为字符串
export function uriToString(fileUri: Uri | string): string {
    if(fileUri instanceof Uri) {
        return fileUri.fsPath;
    } else {
        return fileUri;
    }
}

// get the relative/absoute uri by customize folderPath
/**
 * @deprecated
 */
export function getRelativeUri(fileUri: Uri | string, 
        rootUri: Uri=getRootUri()): string {
    return path.relative(rootUri.fsPath, uriToString(fileUri));
}
/**
 * @deprecated
 */
export function getAbsoluteUri(fileUri: string, 
        rootUri: Uri=getRootUri()): Uri {
    return Uri.joinPath(rootUri, fileUri);
}

// Important: it's not allowed to record relative path using vscode.URI
// So: relative path using string, and absolute using URI
export function toRelativePath(fileUri: Uri, rootUri: Uri=getRootUri()): string {
    return path.relative(rootUri.fsPath, uriToString(fileUri));
}
export function toAbsolutePath(relativeFilePath: string, rootUri: Uri=getRootUri()): Uri {
    return Uri.joinPath(rootUri, relativeFilePath);
}

/**
 * 验证文件是否存在
 * @deprecated
 * @param fileUri 
 * @returns 
 */
export async function checkFile(fileUri: vscode.Uri): 
    Promise<vscode.FileStat | undefined> {

    return await vscode.workspace.fs.stat(fileUri).then(
        (fileStat) => {
            return fileStat; 
        },
        () => { return undefined; }
    );
}

export async function checkFileExist(fileUri: Uri): 
        Promise<FileStat|undefined> {
    
    // 当正常读取时 返回对应fileStat; 否则回返undefined
    return await vscode.workspace.fs.stat(fileUri).then(
        (fileStat) => fileStat,
        () => undefined
    );
}

export async function checkFolderEmpty(fileUri: Uri):
        Promise<boolean> {
    return await vscode.workspace.fs.readDirectory(fileUri).then(
        (entries) => entries.length === 0,
        () => false
    );
}

export function deleteFile(fileUri: Uri) {
    vscode.workspace.fs.delete(fileUri);
};

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
