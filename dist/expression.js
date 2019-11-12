"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser = require("./parser");
function build(exp, ...args) {
    let inArgs = [...args].map(arg => '__' + arg);
    let p = parser;
    exp.trim();
    if (exp[exp.length - 1] == ';') {
        exp = exp.slice(0, exp.length - 1);
    }
    let ast = p.parse(exp);
    // console.log(JSON.stringify(ast, null, 2));
    let code;
    if (ast.children.length == 1 && ast.children[0].type == 'stmt') {
        code = 'return ' + compile(ast, new context(inArgs.slice(), []));
    }
    else {
        code = compile(ast, new context(inArgs.slice(), []));
    }
    inArgs.push(code);
    return new Function(...inArgs);
}
exports.build = build;
class context {
    constructor(varList, funcList) {
        this.varSet = {};
        this.funcSet = {};
        varList.forEach(v => this.varSet[v] = true);
        funcList.forEach(v => this.funcSet[v] = true);
    }
    setVar(v) {
        this.varSet[v] = true;
    }
    hasVar(v) {
        return !!(this.varSet[v]) || (this.parent && this.parent.hasVar(v));
    }
    setFunc(v) {
        this.funcSet[v] = true;
    }
    hasFunc(v) {
        return !!(this.funcSet[v]) || (this.parent && this.parent.hasFunc(v));
    }
    fork() {
        let c = new context([], []);
        c.parent = this;
        return c;
    }
}
function compile(node, ctx) {
    switch (node.type) {
        case 'statements': {
            return node.children.map(x => compile(x, ctx)).join('\n');
        }
        case 'stmt': {
            if (node.children.length == 0) {
                return '';
            }
            return compile(node.children[0], ctx) + ';';
        }
        case 'ret_stmt': {
            return 'return ' + compile(node.children[0], ctx) + ';';
        }
        case 'block': {
            return `{\n${compile(node.children[0], ctx.fork())}\n}`;
        }
        case 'if': {
            return `if(${compile(node.children[0], ctx)})${compile(node.children[1], ctx)}`;
        }
        case 'if_else': {
            return `if(${compile(node.children[0], ctx)})${compile(node.children[1], ctx)}else ${compile(node.children[2], ctx)}`;
        }
        case 'declare': {
            ctx.setVar(node.name);
            return `let ${node.name}`;
        }
        case 'assign': {
            if (!(ctx.hasVar(node.name))) {
                throw new Error("undefined variable " + node.name);
            }
            return `${node.name}=${compile(node.children[0], ctx)}`;
        }
        case 'declare_assign': {
            ctx.setVar(node.name);
            return `let ${node.name}=${compile(node.children[0], ctx)}`;
        }
        case 'func': {
            let f = Math[node.name];
            if (f) {
                return 'Math.' + node.name + '(' + node.children.map(x => compile(x, ctx)).join(',') + ')';
            }
            f = ctx.hasFunc('__' + node.name);
            if (!f) {
                throw new Error("Not support function " + node.name);
            }
            return '__' + node.name + '(' + node.children.map(x => compile(x, ctx)).join(',') + ')';
        }
        case 'const': {
            return node.value.toString();
        }
        case 'plus': {
            return compile(node.children[0], ctx) + '+' + compile(node.children[1], ctx);
        }
        case 'minus': {
            return compile(node.children[0], ctx) + '-' + compile(node.children[1], ctx);
        }
        case 'mul': {
            return compile(node.children[0], ctx) + '*' + compile(node.children[1], ctx);
        }
        case 'div': {
            return compile(node.children[0], ctx) + '/' + compile(node.children[1], ctx);
        }
        case 'uminus': {
            return '-' + compile(node.children[0], ctx);
        }
        case 'pow': {
            return 'Math.pow(' + compile(node.children[0], ctx) + ',' + compile(node.children[1], ctx) + ')';
        }
        case 'var': {
            if (!ctx.hasVar(node.name)) {
                throw new Error("undefined variable " + node.name);
            }
            return node.name;
        }
        case 'lt': {
            return `${compile(node.children[0], ctx)}<${compile(node.children[1], ctx)}`;
        }
        case 'lte': {
            return `${compile(node.children[0], ctx)}<=${compile(node.children[1], ctx)}`;
        }
        case 'gt': {
            return `${compile(node.children[0], ctx)}>${compile(node.children[1], ctx)}`;
        }
        case 'gte': {
            return `${compile(node.children[0], ctx)}>=${compile(node.children[1], ctx)}`;
        }
        case 'eq': {
            return `${compile(node.children[0], ctx)}==${compile(node.children[1], ctx)}`;
        }
        case 'neq': {
            return `${compile(node.children[0], ctx)}!==${compile(node.children[1], ctx)}`;
        }
        case 'and': {
            return `${compile(node.children[0], ctx)}&&${compile(node.children[1], ctx)}`;
        }
        case 'or': {
            return `${compile(node.children[0], ctx)}||${compile(node.children[1], ctx)}`;
        }
        case 'not': {
            return `!${compile(node.children[0], ctx)}`;
        }
        case 'tri': {
            return `${compile(node.children[0], ctx)}?${compile(node.children[1], ctx)}:${compile(node.children[2], ctx)}`;
        }
        case 'bracket': {
            return `(${compile(node.children[0], ctx)})`;
        }
        case 'mod': {
            return `${compile(node.children[0], ctx)}%${compile(node.children[1], ctx)}`;
        }
        case 'function': {
            ctx.setFunc('__' + node.name);
            let c = ctx.fork();
            node.args.forEach(a => c.setVar('__' + a));
            return `function __${node.name}(${node.args.map(a => '__' + a).join(',')})${compile(node.body, c)}`;
        }
        default: {
            throw new Error("Not support node type " + node.type);
        }
    }
}
//# sourceMappingURL=expression.js.map