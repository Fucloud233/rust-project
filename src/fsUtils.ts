import * as vscode from 'vscode';

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
        throw error;
    }
}

// 写入文件
export async function writeFile(fileUri: vscode.Uri, content: Uint8Array) {
    await vscode.workspace.fs.writeFile(fileUri, content).then(
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
