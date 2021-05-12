import {
	createConnection,
	TextDocuments,
	Diagnostic,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	TextDocumentSyncKind,
	InitializeResult,
	_
} from 'vscode-languageserver';

import {
	TextDocument
} from 'vscode-languageserver-textdocument';

// 参数校验
import lint from './lint';

// 创建一个服务器连接。使用Node的IPC作为传输方式。
// 也包含所有的预览、建议等LSP特性
let connection = createConnection(ProposedFeatures.all);

// 创建一个简单的文本管理器。
// 文本管理器只支持全文本同步。
let documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability: boolean = false;
let hasWorkspaceFolderCapability: boolean = false;
let hasDiagnosticRelatedInformationCapability: boolean = false;

connection.onInitialize((params: InitializeParams) => {
	let capabilities = params.capabilities;

	// 客户端是否支持`workspace/configuration`请求?
	// 如果不是的话，降级到使用全局设置
	hasConfigurationCapability = !!(
		capabilities.workspace && !!capabilities.workspace.configuration
	);
	hasWorkspaceFolderCapability = !!(
		capabilities.workspace && !!capabilities.workspace.workspaceFolders
	);
	hasDiagnosticRelatedInformationCapability = !!(
		capabilities.textDocument &&
		capabilities.textDocument.publishDiagnostics &&
		capabilities.textDocument.publishDiagnostics.relatedInformation
	);

	const result: InitializeResult = {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,
			completionProvider: {
				resolveProvider: true
			}
		}
	};
	if (hasWorkspaceFolderCapability) {
		result.capabilities.workspace = {
			workspaceFolders: {
				supported: true
			}
		};
	}
	return result;
});

connection.onInitialized(() => {
	if (hasConfigurationCapability) {
		// 为所有配置Register for all configuration changes.
		connection.client.register(DidChangeConfigurationNotification.type, undefined);
	}
	if (hasWorkspaceFolderCapability) {
		connection.workspace.onDidChangeWorkspaceFolders(_event => {
			connection.console.log('Workspace folder change event received.');
		});
	}
});

// 配置示例
interface ExampleSettings {
	[prop: string]: any;
}

// 当客户端不支持`workspace/configuration`请求时，使用global settings
// 请注意，在这个例子中服务器使用的客户端并不是问题所在，而是这种情况还可能发生在其他客户端身上。
const defaultSettings: ExampleSettings = { warning: true };
let globalSettings: ExampleSettings = defaultSettings;

// 对所有打开的文档配置进行缓存
let documentSettings: Map<string, Thenable<ExampleSettings>> = new Map();

connection.onDidChangeConfiguration(change => {
	if (hasConfigurationCapability) {
		// 重置所有已缓存的文档配置
		documentSettings.clear();
	} else {
		globalSettings = <ExampleSettings>(
			(change.settings['vscode-example-tyc'] || defaultSettings)
		);
	}

	// 重新验证所有打开的文本文档
	documents.all().forEach(validateTextDocument);
});

// 获取配置
function getDocumentSettings(resource: string): Thenable<ExampleSettings> {
	if (!hasConfigurationCapability) {
		return Promise.resolve(globalSettings);
	}
	let result = documentSettings.get(resource);
	if (!result) {
		result = connection.workspace.getConfiguration({
			scopeUri: resource,
			section: 'vscode-example-tyc'
		});
		documentSettings.set(resource, result);
	}
	return result;
}

// 只保留打开文档的设置
documents.onDidClose(e => {
	documentSettings.delete(e.document.uri);
});

// 文档变更时触发（第一次打开或内容变更）
documents.onDidChangeContent(change => {
	validateTextDocument(change.document);
});

// lint文档函数
async function validateTextDocument(textDocument: TextDocument): Promise<void> {
	let diagnostics: Diagnostic[] = [];
	// 获取当前文档设置
	let settings = await getDocumentSettings(textDocument.uri);

	// 校验
	diagnostics.push(...lint(textDocument, hasDiagnosticRelatedInformationCapability, settings));

	// 发送诊断结果
	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

// 监听文档变化
connection.onDidChangeWatchedFiles(_change => {
	connection.console.log('We received an file change event');
});

// 让文档管理器监听文档的打开，变动和关闭事件
documents.listen(connection);

// 连接后启动监听
connection.listen();