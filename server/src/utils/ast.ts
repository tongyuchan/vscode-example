import {
	TextDocument
} from 'vscode-languageserver-textdocument';
import traverse from "@babel/traverse";
const vueParse = require('@vue/compiler-dom');
const parser = require('@babel/parser');

// js、ts、jsx、tsx解析递归
function parseAndTraverse(callback: (path: any, start?: number) => any, code: string, start: number = 0) {
    try {
        const astObj = parser.parse(code, {
            sourceType: "module",
            plugins: [ // 增加插件支持jsx、ts以及提案中的语法
                "jsx",
                "typescript",
                ["decorators", { decoratorsBeforeExport: true }],
                "classProperties",
                "classPrivateProperties",
                "classPrivateMethods",
                "classStaticBlock",
                "doExpressions",
                "exportDefaultFrom",
                "functionBind",
                "importAssertions",
                "moduleStringNames",
                "partialApplication",
                ["pipelineOperator", {proposal: "minimal"}],
                "privateIn",
                ["recordAndTuple", {syntaxType: "hash"}],
                "throwExpressions",
                "topLevelAwait"
            ]
        });
        traverse(astObj, {
            enter(path: any) {
                callback(path, start);
            }
        });
    } catch(err) {
        console.log(err);
    }
}

/*
@desc 生产AST遍历函数
@param callback 节点访问回调，参数path，节点，start节点需要累积的位置，在校验定位时，需要用此矫正位置信息
*/
export default function ast(callback: (path: any, start?: number) => any, textDocument: TextDocument) {
    try {
        const text = textDocument.getText();
        const { languageId } = textDocument;

        // vue文件解析
        if (languageId === 'vue') {
            const vueAstObj = vueParse.parse(text);
            // vue文件js的部分
            const scriptObjArr = vueAstObj.children.filter((item: any) => item.tag === 'script');
            const len = scriptObjArr.length;

            for (let i = 0; i < len; i++) {
                const scriptItem = scriptObjArr[i];
                if (!scriptItem) {
                    return;
                }
                const scriptStringArr = scriptItem.children;
                // 循环每一段js
                const scriptStringArrLen = scriptStringArr.length;
                for (let j = 0; j < scriptStringArrLen; j++) {
                    const scriptString = scriptStringArr[j].content;
                    // 位置需要计算累计，故计算出起始位置
                    const location = scriptStringArr[j].loc;
                    parseAndTraverse(callback, scriptString, location.start.offset);
                }
            }

        } else if (['javascript', 'typescript', 'javascriptreact', 'typescriptreact'].indexOf(languageId) > -1) {
            parseAndTraverse(callback, text);
        }
    } catch (err) {
    };
}