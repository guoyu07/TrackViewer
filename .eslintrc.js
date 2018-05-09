module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "parser": "babel-eslint",
    // 让eslint能够感知webpack的resolver
    // "settings": {
    //     "import/resolver": {
    //         "webpack": {
    //             "config": "config/webpack.base.config.js"
    //         }
    //     }
    // },
    "extends": "airbnb-base",
    // 添加全局函数和对象
    "globals": {
        "navinfo": true,
        "fastmap": true
    },
    /**
     * "off" 或 0 - 关闭规则
     * "warn" 或 1 - 开启规则，使用警告级别的错误：warn (不会导致程序退出),
     * "error" 或 2 - 开启规则，使用错误级别的错误：error (当被触发的时候，程序会退出)
     */
    "rules": {
        // 函数不允许为空，除了构造函数
        "no-empty-function": ["error", { "allow": ["constructors"] }],
        // 不可以对函数的参数赋值（取消）
        "no-param-reassign": 'off',
        // 使用.属性获取字段的值（取消）
        "dot-notation": 'off',
        // 字符串拼接
        "prefer-template": 'off',
        "space-before-function-paren": 'off',
        // 最后一行需要有空行（取消）
        "eol-last": 'off',
        "no-console": 'error',
        // 开始var定义变量
        "no-var": 'off',
        // 允许使用let定义未改变值的变量
        "prefer-const": 'warn',
        // 不强制使用箭头函数
        "prefer-arrow-callback": 'warn',
        // 允许var声明不在代码开始声明
        "vars-on-top": 'off',
        // 每个块的开始都需要空行(取消)
        "padded-blocks": 'off',
        // 开启4个空格缩进规则
        "indent": [
            "error",
            4,
            {
                "SwitchCase": 1,
                "ObjectExpression": "first",
                "ArrayExpression": "first",
                "CallExpression": {
                    "arguments": "first"
                },
                "FunctionExpression": {
                    "body": 1,
                    "parameters": "first"
                },
                "FunctionDeclaration": {
                    "parameters": "first"
                },
                "MemberExpression": 1,
                "VariableDeclarator": {
                    "var": 2,
                    "let": 2,
                    "const": 3
                }
            }
        ],
        // 修改规则,每行最多140个字符
        "max-len": [
            "warn",
            140
        ],
        //修改规则，箭头函数函数体有歧义时必须添加大括号
        "no-confusing-arrow": [
            "error"
        ],
        // 关闭规则，因为此条规则会导致npm run lint崩溃,主要用于处理async/await
        "generator-star-spacing": "off",
        // 关闭规则，允许函数中的参数不被使用
        "no-unused-vars": "off",
        // 关闭规则，忽略行结尾符
        "linebreak-style": "off",
        // 修改规则，只有一个参数时不适用括号
        "arrow-parens": [
            "error",
            "as-needed"
        ],
        // 关闭规则，对象属性不采用简写形式
        "object-shorthand": "off",
        // 关闭规则, 允许类写默认构造函数
        "no-useless-constructor": "off",
        // 修改规则, 允许空行和注释中使用空格
        "no-trailing-spaces": [
            "error",
            {
                "skipBlankLines": true,
                "ignoreComments": true
            }
        ],
        // 关闭规则, 允许使用++和--
        "no-plusplus": "off",
        // 关闭规则, 允许类成员方法中不使用this
        "class-methods-use-this": "off",
        // 修改规则, 定义运算符混用规则
        "no-mixed-operators": [
            "error",
            {
                "groups": [
                    [
                        "&",
                        "|",
                        "^",
                        "~",
                        "<<",
                        ">>",
                        ">>>"
                    ],
                    [
                        "==",
                        "!=",
                        "===",
                        "!==",
                        ">",
                        ">=",
                        "<",
                        "<="
                    ],
                    [
                        "&&",
                        "||"
                    ],
                    [
                        "in",
                        "instanceof"
                    ]
                ],
                "allowSamePrecedence": true
            }
        ],
        // 关闭规则, 允许使用continue
        "no-continue": "off",
        // 修改规则, 允许修改函数参数的属性
        "no-param-reassign": [
            "error",
            {
                "props": false
            }
        ],
        // 关闭规则, 可以使用一些新特性
        "no-restricted-syntax": "off",
        // 关闭规则, 允许变量前面添加下划线
        "no-underscore-dangle": "off",
        // 关闭规则, 允许使用prototype中方法
        "no-prototype-builtins": "off",
        // 关闭规则
        "no-restricted-properties": "off",
        // 关闭规则, 允许使用位操作符
        "no-bitwise": "off",
        // 关闭规则, 允许使用单独的if
        "no-lonely-if": "off",
        // 关闭规则, 允许在case分支中声明变量
        "no-case-declarations": "off",
        // 关闭规则, 允许直接访问属性和数组元素
        "prefer-destructuring": "off",
        // 关闭规则, promise的reject可以不传递error
        "prefer-promise-reject-errors": "off",
        // 关闭 === 替代 ==
        "eqeqeq": "warn",
        // 关闭对象最后一个属性后的逗号的检测
        "comma-dangle": "off",
        // 关闭驼峰法命名
        "camelcase": "warn",
        // 开启类成员之间必须加空行的检测
        "lines-between-class-members": "error",
        "no-await-in-loop": "warn"
    }
}