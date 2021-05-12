import {
	Diagnostic,
	DiagnosticSeverity,
} from 'vscode-languageserver';
import {
	TextDocument
} from 'vscode-languageserver-textdocument';
// import * as helpers from "@babel/helpers";
// import * as t from "@babel/types";

import ast from './utils/ast';

enum TypeCollection {
    'number',
    'string',
    'function'
}

const paramsRules = {
    a: {
        min: 1,
        max: 2,
        typeArray: [TypeCollection.number, TypeCollection.string]
    }
};

const commandList = Object.keys(paramsRules);

const typeNameObj = {
    [TypeCollection.number]: ['NumericLiteral'],
    [TypeCollection.string]: ['StringLiteral'],
    [TypeCollection.function]: ['ArrowFunctionExpression', 'FunctionExpression']
};

export default function lint(textDocument: TextDocument, hasDiagnosticRelatedInformationCapability: boolean, settings: any) {
    let diagnostics: Diagnostic[] = [];
    ast((path: any, scriptStart: any) => {
        try {
            const node = path.node;
            const { type, expression, start, end } = node;
            // tyc_test调用判断
            if (type === 'ExpressionStatement' && expression.type === 'CallExpression' && expression.callee.type === 'MemberExpression' && expression.callee.object.name === 'tyc_test') {
                // 包含了属性信息
                const { property, computed} = expression.callee;
                // 当前语法位置
                const range = {
                    start: textDocument.positionAt(start + scriptStart),
                    end: textDocument.positionAt(end + scriptStart)
                };
                // 变量暂时不校验
                if(property && ((property.type === 'Identifier' && !computed) || property.type === 'StringLiteral')) {
                    const name = property.name || property.value;
                    if (!commandList.includes(name)) {
                        diagnostics.push({
                            severity: DiagnosticSeverity.Error,
                            range,
                            message: '当前命令不存在',
                            source: 'vscode-example-tyc'
                        });
                    } else {
                        // 参数个数校验
                        const { arguments: args } = expression;
                        const { min, max, typeArray } = paramsRules[name as keyof typeof paramsRules];
                        const len = args.length;
                        if (len < min  || len > max) {
                            const isError = len < min;
                            let diagnostic: Diagnostic | null = null;
                            // 允许用户关闭弱提示
                            if (settings.warning) {
                                const moreParams = args.slice(max);
                                diagnostic = {
                                    severity: DiagnosticSeverity.Warning,
                                    range,
                                    message: `设置了${moreParams.length}个无意义的参数: ${moreParams.map((item: any) => item.value).join(',')}`,
                                    source: 'vscode-example-tyc',
                                };
                            }

                            if (isError) {
                                diagnostic = {
                                    severity: DiagnosticSeverity.Error,
                                    range,
                                    message: `参数少于规定参数个数`,
                                    source: 'vscode-example-tyc'
                                };
                                // 补充信息说明
                                if (hasDiagnosticRelatedInformationCapability) {
                                    // 可补充更多信息，这里不展开了
                                    // diagnostic.relatedInformation = [];
                                }
                            }

                            diagnostic && diagnostics.push(diagnostic);
                        }

                        // 参数类型校验
                        if (typeArray) {
                            typeArray.map((item: (TypeCollection | string), index: number) => {
                                // 按理来说不需要拷贝，但是很奇怪不拷贝会出异常
                                const currentParam = {...args[index]};
                                if (args[index] && item !== '' && currentParam.type !== 'Identifier' && !typeNameObj[item as TypeCollection].includes(currentParam.type)) {
                                    diagnostics.push({
                                        severity: DiagnosticSeverity.Error,
                                        range,
                                        message: `第${index+1}个参数类型不对, 请输入${TypeCollection[item as TypeCollection]}类型`,
                                        source: 'vscode-example-tyc',
                                    });
                                }
                            });
                        }
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }
    }, textDocument);

    return diagnostics;
}