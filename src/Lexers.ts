import Tokenizr from 'tokenizr'

const BlockCommentReg = /\/\*(\*(?!\/)|[^*])*\*\//gm
const SingleLineCommentReg = /--[^\n\r]+?(?:[\n\r])/gm
const EmptyLineRegex = /^[ \t\r\n]+\n/
const SpaceLikeRegex = /[ \r\n\t]+/gm;
const AnnotationReg = /@([a-zA-Z]{1,})([a-zA-Z0-9_\-]*)(\(.*\))?/

export const Lexer = new Tokenizr()

Lexer.rule('Global', BlockCommentReg, (ctx, match) => {
  ctx.accept('BlockComment')
}, 'BlockComment')

Lexer.rule('Global', SingleLineCommentReg, (ctx, match) => {
  ctx.accept('SingleLineComment')
}, 'SingleLineComment')

Lexer.rule('Global', SpaceLikeRegex, (ctx, match) => {
  ctx.accept('SpaceLike')
})
Lexer.rule('Global', /(["'])(?:(?=(\\?))\2.)*?\1/, (ctx, m) => {
  ctx.accept('String')
})
Lexer.rule('Global', /(.|\n)/, (ctx) => {
  ctx.accept('Char')
})
Lexer.rule('Global', EmptyLineRegex, (ctx) => {
  ctx.ignore()
})

Lexer.after((ctx, match, { name }) => {
  if (name === 'BlockComment') {
    ctx.push('BlockComment')
    ctx.state('BlockComment')
    ctx.repeat()
  }
  if (name === 'SingleLineComment') {
    ctx.push('SingleLineComment')
    ctx.state('SingleLineComment')
    ctx.repeat()
  }
})

Lexer.rule('BlockComment', AnnotationReg, (ctx, match) => {
  ctx.accept('Annotation')
})
Lexer.rule('BlockComment', /\*\//g, (ctx) => {
  ctx.pop();
  ctx.ignore()
})
Lexer.rule('BlockComment', /(.|\n)/, (ctx) => {
  ctx.ignore()
})

Lexer.rule('SingleLineComment', AnnotationReg, (ctx, match) => {
  ctx.accept('Annotation')
})
Lexer.rule('SingleLineComment', /([\n\r]|.$)/g, (ctx) => {
  ctx.pop();
  ctx.ignore()
})
Lexer.rule('SingleLineComment', /(.)/, (ctx) => {
  ctx.ignore()
})


export const ParameterLexer = new Tokenizr()

ParameterLexer.rule(/@[a-zA-Z].[a-zA-Z0-9_]*/g, (ctx, match) => {
  ctx.accept('AnnotationName', match[0].slice(1))
})
ParameterLexer.rule(/[a-zA-Z_][a-zA-Z0-9_]*/, (ctx, m) => {
  ctx.accept('Id')
})
ParameterLexer.rule(/[+-]?[0-9]+/, (ctx, m) => {
  ctx.accept('Number', parseInt(m[0]))
})
ParameterLexer.rule(/(["'])(?:(?=(\\?))\2.)*?\1/, (ctx, m) => {
  ctx.accept('String', m[0].replace(/^["']|["']$/g, ''))
})
ParameterLexer.rule(/[ \t\r\n]+/, (ctx, m) => {
  ctx.ignore()
})
ParameterLexer.rule(/./, (ctx, m) => {
  ctx.accept('Char')
})