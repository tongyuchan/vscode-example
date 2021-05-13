import * as vscode from 'vscode';

export default function fixParameters () {
    return vscode.commands.registerCommand('vscode-example-tyc.fixParameters', (...argus) => {
        const diagnostic = argus[0];
        const document = argus[1];
        const range = diagnostic.range;
        // 调用文本编辑修改
        vscode.window.activeTextEditor.edit((editBuilder) => {
            const text = document.getText(range);
            const deleteText = diagnostic.message.match(/设置了(\d{1})个无意义的参数/);
            const deleteNum = deleteText && deleteText[1] || 0;

            editBuilder.replace(range, text.replace(/\(([^(]*?)\)/, (...args) => {
                let params = args[1].split(',');
                const last = params.pop();
                // 兼容tyc_test['a'](1, 'a', 3, );情况
                if (last && last.trim()) {
                    params.push(last);
                }
                const len = params.length;
                return `(${params.slice(0, len - deleteNum)})`;
            }));
        });
	});
};