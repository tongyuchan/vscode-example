/*
@desc 自动修复参数过多
*/
import * as vscode from 'vscode';

export default function (
    diagnostic: readonly vscode.Diagnostic[],
    document: vscode.TextDocument,
	_range: vscode.Range | vscode.Selection,
	_context: vscode.CodeActionContext,
	_token: vscode.CancellationToken) {
        return diagnostic.filter(item => item.message.indexOf('无意义的参数') > -1).map(item => {
            const autoFixQuickFix = new vscode.CodeAction('自动删除无意义的参数', vscode.CodeActionKind.QuickFix);
            // 在这里调用全局命令，并传入参数
            autoFixQuickFix.command = {
                title: '自动删除无意义的参数',
                command: 'vscode-example-tyc.fixParameters',
                arguments: [item, document, _range, _context, _token]
            };
            return autoFixQuickFix;
        });
}