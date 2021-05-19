import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient';
import lintClient from './provider/lintClient';
import autofix from './provider/autofix/index';
import autoCompletion from './provider/autoCompletion';
import hoverInfo from './provider/hoverInfo';
import createWebview from './provider/createWebview';

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
	// 启动服务，server端处理lint
	client = lintClient(context);

	// 自动修复
	autofix(context);

	// 自动补全
	autoCompletion(context);

	// 悬浮提示
	hoverInfo(context);

	// 创建webview
	createWebview(context);
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
