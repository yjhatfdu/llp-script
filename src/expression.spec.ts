import {build} from "./expression";

test("basic expression should parse", () => {
    let result = build('0.501466-1.246334*sin(channel*0.125*PI)*(0.5*progress+0.5)', 'channel', 'progress');
    expect(result.toString()).toBe(`function anonymous(__channel,__progress
) {
return 0.501466-1.246334*Math.sin(__channel*0.125*3.141592653589793)*(0.5*__progress+0.5);
}`)
});

test("operators should parse", () => {
    build(`-(1+1/1-1*1%1^1)`);
    build(`true&&true||!false?true:false`);
    build(`1>1&&1<1&&1==1&&1>=1&&1<=1&&1!==1`)
});

test("declare expression should parse", () => {
    build('let a; return a');
    build('let a=1; return a');
});

test("assign expression should parse", () => {
    build('let a;a=1;return a')
});

test("undefined variable should fail", () => {
    expect(() => build('return c')).toThrowError(Error);
    expect(() => build('a=1;return a;')).toThrowError(Error);
});

test("if should parse", () => {
    build('if(1){return 1}');
    build('if(1){return 1}else if(2){return 2}else{return 3}');
});

test("functions not in whitelist should fail", () => {
    expect(() => build('alert()')).toThrowError(Error)
});

test("functions should work", () => {
    build('min(0,1)')
});
