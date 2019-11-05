/* description: Parses end executes mathematical expressions. */

/* lexical grammar */
%lex
%options case-insensitive
%%

\s+                   /* skip whitespace */
[0-9]+("."[0-9]+)?\b  return 'NUMBER'
"("             return  '('
")"             return  ')'
"("             return  '('
")"             return  ')'
"+"             return  '+'
"-"             return  '-'
"*"             return  '*'
"/"             return  '/'
"^"             return  '^'
"PI"            return  'PI'
"E"             return  'E'
","             return  ','
">="            return  'gte'
">"             return  'gt'
"<="            return  'lte'
"<"             return  'lt'
"!=="           return  'neq'
"=="            return  'eq'
"&&"            return  'and'
"||"            return  'or'
"!"             return  'not'
"?"             return  '?'
":"             return  ':'
"%"             return  '%'
"let"           return  'let'
";"             return  ';'
"="             return  '='
"return"        return  'ret'
"if"            return  'if'
"else"          return  'else'
"{"             return  '{'
"}"             return  '}'
"true"          return  'true'
"false"         return  'false'

[\w\d]+	{ return 'NAME'};
<<EOF>>	return 'EOF';

/lex

/* operator associations and precedence */

%right '='
%right 'let'
%right '?' ':'
%left 'or'
%left 'and'
%left 'not'
%left 'gt' 'gte' 'lt' 'lte' 'eq' 'neq'
%left '+' '-'
%left '*' '/' '%'
%left '^'
%right '('

%start expression
%%

expression    :
    statements
    {return $1;}
    ;


arg_list
        :   e  ','  arg_list
            {$$=$3; $$.unshift($1);}
        |   e
            {$$=[$1];}
        |
            {$$=[];}
        ;

statement
        : e
        {$$={type:'stmt',children:[$1]};}
        | 'ret' e
        {$$={type:'ret_stmt',children:[$2]};}
        ;


block
        : '{' statements '}'
        {$$={type:'block',children:[$2]};}
        ;

if_block
        : 'if' '(' e ')' block
        {$$={type:'if',children:[$3,$5]};}
        | 'if' '(' e ')' block 'else' block
        {$$={type:'if_else',children:[$3,$5,$7]};}
        | 'if' '(' e ')' block 'else' if_block
        {$$={type:'if_else',children:[$3,$5,$7]};}
        ;



statements
        : statement ';' statements
            {$$=$3;$$.children.unshift($1);}
        | if_block statements
            {$$=$2;$$.children.unshift($1);}
        | if_block ';' statements
            {$$=$3;$$.children.unshift($1);}
        | statement
            {$$={type:'statements',children:[$1]};}
        | if_block EOF
            {$$={type:'statements',children:[$1]};}
        | statement EOF
            {$$={type:'statements',children:[$1]};}
        |
            {$$={type:'statements',children:[]};}
        ;


var
        : NAME
            {$$='__'+yytext;}
        ;

e    :
    NUMBER
        {$$={type:'const',value:Number(yytext)};}
    | 'true'
        {$$={type:'const',value:'true'};}
    | 'false'
        {$$={type:'const',value:'false'};}
    | var
        {$$={type:'var',name:$1};}
    | PI
        {$$={type:'const',value:Math.PI};}
    | 'E'
        {$$={type:'const',value:Math.E};}
    | '(' e ')'
        {$$={type:'bracket',children:[$2]}}
    | e '+' e
        {$$={type:'plus',children:[$1,$3]};}
    | e '-' e
        {$$={type:'minus',children:[$1,$3]};}
    | e '*' e
        {$$={type:'mul',children:[$1,$3]};}
    | e '/' e
        {$$={type:'div',children:[$1,$3]};}
    | e '%' e
        {$$={type:'mod',children:[$1,$3]};}
    | e '^' e
        {$$={type:'pow',children:[$1,$3]};}
    | '-' e
        {$$ = {type:'uminus',children:[$2]};}
    | e 'gt' e
        {$$={type:'gt',children:[$1,$3]};}
    | e 'gte' e
        {$$={type:'gte',children:[$1,$3]};}
    | e 'lt' e
        {$$={type:'lt',children:[$1,$3]};}
    | e 'lte' e
        {$$={type:'lte',children:[$1,$3]};}
    | e 'eq' e
        {$$={type:'eq',children:[$1,$3]};}
    | e 'neq' e
        {$$={type:'neq',children:[$1,$3]};}
    | e 'and' e
        {$$={type:'and',children:[$1,$3]};}
    | 'not' e
        {$$={type:'not',children:[$2]};}
    | e 'or' e
        {$$={type:'or',children:[$1,$3]};}
    | e '?' e ':' e
        {$$={type:'tri',children:[$1,$3,$5]};}
    |  NAME '(' arg_list ')'
        {$$={type:'func',name:$1,children:$3};}
    |  'let' var '=' e
        {$$={type:'declare_assign',name:$2,children:[$4]};}
    |  'let' var
       {$$={type:'declare',name:$2};}
    |  var '=' e
        {$$={type:'assign',name:$1,children:[$3]};}
    ;
