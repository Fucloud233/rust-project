import * as vscode from 'vscode';
import { Uri } from 'vscode'; 

export async function getRootUri(): Promise<Uri | undefined> {
	let entries = vscode.workspace.workspaceFolders;
	if (entries !== undefined && entries.length > 0) {
		return entries[0].uri;
	} else {
		return undefined;
	}
}

// 验证文件是否存在
export async function checkFile(fileUri: vscode.Uri): 
    Promise<vscode.FileStat | undefined> {
        
    return await vscode.workspace.fs.stat(fileUri).then(
        (fileStat) => {
            // console.log(fileStat); 
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
