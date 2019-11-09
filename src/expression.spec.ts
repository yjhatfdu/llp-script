import {build} from "./expression";

test("basic expression should parse", () => {
    build('0.501466-1.246334*sin(channel*0.125*PI)*(0.5*progress+0.5)', 'channel', 'progress');
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
    build('if(1){return 1};return 1');
    build('if(1){return 1}else if(2){return 2}else{return 3}');
});

test("functions not in whitelist should fail", () => {
    expect(() => build('alert()')).toThrowError(Error)
});

test("functions should work", () => {
    build('min(0,1)')
});

test("should build",()=>{
    build(`let p;
if (currentTime < 8071) {
\tp = (18/5-currentTime*6/40355)*(progress-1)+1;
} else if (currentTime < 9769) {
\tp = (76873/8490-currentTime*7/8490)*(progress-1)+1;
} else if (currentTime < 11609) {
\tp = (currentTime/7360-2409/7360)*(progress-1)+1;
} else if (currentTime < 12316) {
\tp = -(11*currentTime^2-270952*currentTime+1660524832)/1999396*(progress-1)+1;
} else if (currentTime < 42033) {
\tp = 4*progress-3;

} else if (currentTime < 44297) {
\tp = -(3*(currentTime-42033)^2-41005568)/10251392*(progress-1)+1;
} else if (currentTime < 53354) {
\tp = (currentTime/30190+15589/15095)*(progress-1)+1;
} else if (currentTime < 53779) {
\tp = (2*currentTime/2125-100758/2125)*(progress-1)+1;
} else if (currentTime < 55618) {
\tp = 3.2*progress-2.2;
} else if (currentTime < 56043) {
\tp = (2*currentTime/2125-104436/2125)*(progress-1)+1;

} else if (currentTime < 57882) {
\tp = 3.6*progress-2.6;
} else if (currentTime < 58307) {
\tp = (2*currentTime/2125-108114/2125)*(progress-1)+1;
} else if (currentTime < 86184) {
\tp = 4*progress-3;
} else if (currentTime < 87882) {
\tp = (11*(currentTime-87033)^2+6487209)/3604005*(progress-1)+1;
} else if (currentTime < 122694) {
\tp = 4*progress-3;

} else if (currentTime < 124675) {
\tp = (253312/1981-currentTime*2/1981)*(progress-1)+1;
} else {
\tp = 2*progress-1;
}
return -1.246334*cos(channel*0.125*PI)*max(0,p);`,'currentTime','progress','channel')
});
