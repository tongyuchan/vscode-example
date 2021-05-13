import * as vscode from 'vscode';
import { file } from '../../config';
import fixParameters from './fixParameters';
import fixParametersCommand from './fixParametersCommand';

class CodeActionProvider {
	provideCodeActions (
		document: vscode.TextDocument,
		_range: vscode.Range | vscode.Selection,
		_context: vscode.CodeActionContext,
		_token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeAction[]> {
		// 拿到当前文档全部诊断信息
		const diagnostic: readonly vscode.Diagnostic[] = _context.diagnostics.filter(item => item.source === 'vscode-example-tyc');

		let result: vscode.CodeAction[] = [];

		// 自动修复命令注册
		result.push(...fixParameters(diagnostic, document, _range, _context, _token));
		return result;
	}
}

class CodeActionProviderMetadata {
	providedCodeActionKinds = [ vscode.CodeActionKind.QuickFix ];
}

export default function autofix (context: vscode.ExtensionContext) {
	// 自动修复命令
	context.subscriptions.push(fixParametersCommand());
    context.subscriptions.push(vscode.languages.registerCodeActionsProvider(
		file,
		new CodeActionProvider(),
		new CodeActionProviderMetadata()
	));
};