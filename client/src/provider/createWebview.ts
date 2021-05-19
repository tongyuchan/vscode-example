import * as vscode from 'vscode';
import { render } from './render/index';

let panel = null;

const preview = vscode.commands.registerCommand('vscode-example-tyc.preview', async function (uri) {

    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('请新开一个文件使用');
        return;
    }

    let selection = editor.selection;
    const document=editor.document;
    let text = document.getText(selection);

    if (!text) {
        return;
    };


    if (!panel || panel._store._isDisposed) {
        panel = createWebviewPanel();
    }
    // 设置文档内容
    panel.webview.html = render(text);

});

function createWebviewPanel() {
    let panel = vscode.window.createWebviewPanel(
        'vscode-example-tyc',
        '查看更多信息',
        vscode.ViewColumn.Two, {
            enableScripts: true,
            retainContextWhenHidden: false,
        }
    );
    panel.onDidDispose(async (event) => {
    });
    return panel;
}

export default function(context: vscode.ExtensionContext) {
    context.subscriptions.push(preview);
};