import * as vscode from 'vscode';
import { getRootUri } from './fsUtils';
import { SettingsFile } from './info/settingsFile';

class Command {
    name: string;
    handler: Function;

    constructor(name: string, handler: Function) {
        this.name = name;
        this.handler = handler;
    }
}

export const addCrateToCmd = vscode.commands.registerTextEditorCommand(
    "rust-project.auto.addCrateTo",
    async (editor) => {
        let rootUri = await getRootUri();
        if(rootUri === undefined) {
            return;
        }

        // 获取可以添加的选项
        let settingsFile = new SettingsFile(rootUri);
        await settingsFile.load();
        let options = settingsFile.getCratesRelativeUri(rootUri);

        vscode.window.showQuickPick(options)
            .then((selectedOption) => {
                if(selectedOption) {
                    vscode.window.showInformationMessage(`Your select ${selectedOption}`);

                    //TODO: 继续完成选择Crate的操作
                }
            });
    }
);

