export const doc = [
    {
        name: 'set',
        kind: 'Function',
        body: [
            "'set', key, value",
            '"set", key, value'
        ],
        detail: "(method) LXAnalytics('set', key: string, value: any)",
        documentation: `设置灵犀web环境变量。该方法在TitansX容器内无效。
@param key — 要设置的字段名.
@param value — 要设置的值.`
    },
    {
        name: 'set',
        kind: 'Function',
        body: ['set(key,value)'],
        detail: "(method) lx.set(key: string, value: string|object|boolean|number)",
        documentation: `设置环境变量，也叫全局变量
@param key — 要设置的字段名.
@param value — 要设置的值.`
    }
];