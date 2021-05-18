import * as vscode from 'vscode';

import { LanguageClient } from 'vscode-languageclient';
import lintClient from './provider/lintClient';
import autofix from './provider/autofix/index';
import autoCompletion from './provider/autoCompletion';

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
	// 启动服务，server端处理lint
	client = lintClient(context);

	// 自动修复
	autofix(context);

	// 自动补全
	autoCompletion(context);
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
