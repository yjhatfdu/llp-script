"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser = require("./parser");
const functionMap = {};
function build(exp, ...args) {
    let inArgs = [...args].map(arg => '__' + arg);
    let p = parser;
    let ast = p.parse(exp);
    // console.log(JSON.stringify(ast, null, 2));
    let code;
    if (ast.children.length == 1 && ast.children[0].type == 'stmt') {
        code = 'return ' + compile(ast, inArgs.slice());
    }
    else {
        code = compile(ast, inArgs.slice());
    }
    inArgs.push(code);
    return new Function(...inArgs);
}
exports.build = build;
function compile(node, variableSet) {
    switch (node.type) {
        case 'statements': {
            return node.children.map(x => compile(x, variableSet)).join('\n');
        }
        case 'stmt': {
            return compile(node.children[0], variableSet) + ';';
        }
        case 'ret_stmt': {
            return 'return ' + compile(node.children[0], variableSet) + ';';
        }
        case 'block': {
            return `{\n${compile(node.children[0], variableSet)}\n}`;
        }
        case 'if': {
            return `if(${compile(node.children[0], variableSet)})${compile(node.children[1], variableSet)}`;
        }
        case 'if_else': {
            return `if(${compile(node.children[0], variableSet)})${compile(node.children[1], variableSet)}else ${compile(node.children[2], variableSet)}`;
        }
        case 'declare': {
            variableSet.push(node.name);
            return `let ${node.name}`;
        }
        case 'assign': {
            if (!(variableSet.indexOf(node.name) >= 0)) {
                throw new Error("undefined variable " + node.name);
            }
            return `${node.name}=${compile(node.children[0], variableSet)}`;
        }
        case 'declare_assign': {
            variableSet.push(node.name);
            return `let ${node.name}=${compile(node.children[0], variableSet)}`;
        }
        case 'func': {
            let f = Math[node.name];
            if (f) {
                return 'Math.' + node.name + '(' + node.children.map(x => compile(x, variableSet)).join(',') + ')';
            }
            f = functionMap[node.name];
            if (!f) {
                throw new Error("Not support function " + node.name);
            }
            return f + '(' + compile(node.children.map(x => compile(x, variableSet)).join(','), variableSet) + ')';
        }
        case 'const': {
            return node.value.toString();
        }
        case 'plus': {
            return compile(node.children[0], variableSet) + '+' + compile(node.children[1], variableSet);
        }
        case 'minus': {
            return compile(node.children[0], variableSet) + '-' + compile(node.children[1], variableSet);
        }
        case 'mul': {
            return compile(node.children[0], variableSet) + '*' + compile(node.children[1], variableSet);
        }
        case 'div': {
            return compile(node.children[0], variableSet) + '/' + compile(node.children[1], variableSet);
        }
        case 'uminus': {
            return '-' + compile(node.children[0], variableSet);
        }
        case 'pow': {
            return 'Math.pow(' + compile(node.children[0], variableSet) + ',' + compile(node.children[1], variableSet) + ')';
        }
        case 'var': {
            if (!(variableSet.indexOf(node.name) >= 0)) {
                throw new Error("undefined variable " + node.name);
            }
            return node.name;
        }
        case 'lt': {
            return `${compile(node.children[0], variableSet)}<${compile(node.children[1], variableSet)}`;
        }
        case 'lte': {
            return `${compile(node.children[0], variableSet)}<=${compile(node.children[1], variableSet)}`;
        }
        case 'gt': {
            return `${compile(node.children[0], variableSet)}>${compile(node.children[1], variableSet)}`;
        }
        case 'gte': {
            return `${compile(node.children[0], variableSet)}>=${compile(node.children[1], variableSet)}`;
        }
        case 'eq': {
            return `${compile(node.children[0], variableSet)}==${compile(node.children[1], variableSet)}`;
        }
        case 'neq': {
            return `${compile(node.children[0], variableSet)}!==${compile(node.children[1], variableSet)}`;
        }
        case 'and': {
            return `${compile(node.children[0], variableSet)}&&${compile(node.children[1], variableSet)}`;
        }
        case 'or': {
            return `${compile(node.children[0], variableSet)}||${compile(node.children[1], variableSet)}`;
        }
        case 'not': {
            return `!${compile(node.children[0], variableSet)}`;
        }
        case 'tri': {
            return `${compile(node.children[0], variableSet)}?${compile(node.children[1], variableSet)}:${compile(node.children[2], variableSet)}`;
        }
        case 'bracket': {
            return `(${compile(node.children[0], variableSet)})`;
        }
        case 'mod': {
            return `${compile(node.children[0], variableSet)}%${compile(node.children[1], variableSet)}`;
        }
        default: {
            throw new Error("Not support node type " + node.type);
        }
    }
}
//# sourceMappingURL=expression.js.map