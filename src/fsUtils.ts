import * as vscode from 'vscode';

// 验证文件是否存在
export function checkFile(fileUri: vscode.Uri): vscode.FileStat | undefined {
    let result;

    vscode.workspace.fs.stat(fileUri).then(
        (fileStat) => { result = fileStat; },
        () => { result = undefined; }
    );

    return result;
}
