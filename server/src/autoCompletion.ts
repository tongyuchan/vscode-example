import {
    TextDocuments,
	CompletionItem,
	CompletionItemKind,
	TextDocumentPositionParams,
    Connection,
    _,
} from 'vscode-languageserver';
import {
	TextDocument
} from 'vscode-languageserver-textdocument';
import { CallHierarchy } from 'vscode-languageserver/lib/callHierarchy.proposed';
import { SemanticTokens } from 'vscode-languageserver/lib/sematicTokens.proposed';

const doc = [
    {
        kind: 'Function',
        body: [
            "testA"
        ],
        detail: "(method) tyc_test2.testA( key: string, value: any)",
        documentation: `测试testA自动补全
@param key — 要设置的字段名.
@param value — 要设置的值.`
    }
];


export default function autoCompletion(connection: Connection<_, _, _, _, _, _, CallHierarchy & SemanticTokens>, documents: TextDocuments<TextDocument>) {
    connection.onCompletion(
        (_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] | null => {
            const document = documents.get(_textDocumentPosition.textDocument.uri);
            if (!document) {
                return null;
            }
            const text = document.getText({
                start: document.positionAt(0),
                end: _textDocumentPosition.position
            });

            const offsetAt = document.offsetAt(_textDocumentPosition.position);

            // tyc_test关键字联想
            let res: CompletionItem[] = [{
                label: 'tyc_test2',
                kind: CompletionItemKind.Variable,
                detail: 'tyc_test2',
                documentation: '我的测试方法库'
            }];

            // 服务端根据输入字母，识别到是tyc_test的调用后，提供联想项
            if (/tyc_test2\.[a-zA-Z]*$/.test(text)){
                res = res.concat(
                    doc.map((item) => ({
                            label: item.body[0],
                            kind: CompletionItemKind[item.kind as keyof typeof CompletionItemKind],
                            detail: item.detail,
                            documentation: item.documentation,
                            // textEdit: {
                            //     range: {
                            //         start: document.positionAt(offsetAt - 2),
                            //         end: document.positionAt(offsetAt + 1)
                            //     },
                            //     newText: item.body[0]
                            // }
                        })
                    ) as CompletionItem[]
                );
            }
            return res;
        }
    );

    connection.onCompletionResolve(
        (item: CompletionItem): CompletionItem => {
            return {
                ...item,
            };
        }
    );
}