import * as vscode from 'vscode';
import { file } from '../config';
import { doc } from '../config/doc';

class CompletionItemProvider {
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
        // 支持换行 代码从起始位置到输入位置
        const text = document.getText(new vscode.Range(
            new vscode.Position(0, 0),
            position
        ));

        // 只有tyc_test调用会触发联想内容
        if(/tyc_test\.$/.test(text)){
            return doc.map(item => {
                return item.body.map(iitem => {
                    let completionItem = new vscode.CompletionItem(iitem, vscode.CompletionItemKind[item.kind]);
                    completionItem.detail=item.detail;
                    completionItem.documentation = item.documentation;
                    // 代码替换位置，查找位置会同步应用
                    completionItem.range = new vscode.Range(new vscode.Position(position.line, position.character), new vscode.Position(position.line, position.character));
                    return completionItem;
                });
            }).flat();
        }
    }

    // resolveCompletionItem(){}
}

export default function autoCompletion(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(file, new CompletionItemProvider(), '.'));
}