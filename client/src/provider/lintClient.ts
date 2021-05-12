import * as vscode from 'vscode';
import * as path from 'path';
import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient';
import { file } from '../config';

export default function(context: vscode.ExtensionContext) {
	// 服务器由node实现
	let serverModule = context.asAbsolutePath(
		path.join('server', 'out', 'server.js')
	);

	// 为服务器提供debug选项
	// --inspect=6011: 运行在Node's Inspector mode，这样VS Code就能调试服务器了
	// todo: 目前报错，需要调研
	let debugOptions = { execArgv: ['--nolazy', '--inspect=6011'] };

	// 如果插件运行在调试模式那么就会使用debug server options
	// 不然就使用run options
	let serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions
		}
	};

	// 控制语言客户端的选项
	let clientOptions: LanguageClientOptions = {
		documentSelector: file,
		synchronize: {
			fileEvents: vscode.workspace.createFileSystemWatcher('**/.clientrc')
		}
	};

	// 创建语言客户端并启动
	const client = new LanguageClient(
		'vscode-example-tyc',
		'vscode-example-tyc',
		serverOptions,
		clientOptions
	);;

	// 启动客户端，这也同时启动了服务器
	client.start();

	return client;
};