import paramParser from "./ParamParser"
import { ParserBase } from "./ParserBase"
import { Lexer } from './Lexers'
const EMPTY = Symbol()

export class Parser extends ParserBase {

  statementCount = 0
  commentCount = 0

  parseAll = (input) => {
    this.statementCount = 0
    this.commentCount = 0
    Lexer.input(input)
    Lexer.push('Global')
    Lexer.state('Global')
    const blocks = this.parseBlocks()
    Lexer.pop()
    try {
      Lexer.consume('EOF')
    } catch (e) {
      // finish parsing
    }
    return this.astHelper('Blocks', blocks).add(blocks)
  }

  parseBlocks = () => {
    const blocks: any[] = []
    for (;;) {
      let block = this.parseBlock()
      if (block.length === 0) {
        break
      }
      blocks.push(this.astHelper('Block', block[0]).set({ index: this.statementCount, key: 'Block-' + this.statementCount }).add(block))

    }
    return blocks
  }

  parseBlock = () => {
    let block: any[] = []
    while (1) {
      const token = Lexer.alternatives(
        this.parseSpaceLike,
        this.parseComment,
        this.parseStatement,
        this.parseEmpty,
      )
      if (token === EMPTY) {
        break
      }
      let type = token.T || token.type
      if (type !== 'SpaceLike') {
        block.push(token)
      }
      if (type === 'Statement') {
        break
      }
    }
    return block
  }

  parseComment = () => {
    let comment = ''
    let first: any = null
    let annotations: any[] = []
    for (;;) {
      const block = Lexer.alternatives(
        this.parseBlockComment,
        this.parseSingleLineComment,
        this.parseSpaceLike,
        this.parseAnnotation,
        this.parseEmpty,
      )
      first = first || block
      if (block === EMPTY) {
        break
      }
      if (block.T === 'Annotation') {
        annotations.push(block)
      } else {
        comment += block.value
      }
    }
    if (!comment.trim()) {
      throw new Error()
    }
    return this.astHelper('Comment', first).set({ key: 'Comment-' + this.commentCount++, value: comment }).add(annotations)
  }

  parseStatement = () => {
    // todo: optimize it
    let statement = ''
    let first: any = null
    let annotations: any[] = []
    for (;;) {
      const token = Lexer.token()
      first = first || token
      if (token.type === 'Annotation') {
        annotations.push(this.astHelper(token.type, token))
      } else {
        statement += token.value
      }
      if (token.value === ';') {
        break
      }
      if (token.type === 'EOF') {
        if (statement === '') {
          throw Error() // 'EOF' is not considered a statement
        } else {
          break
        }
      }
    }
    let index = this.statementCount++
    return this.astHelper('Statement', first).set({ key: 'Statement-' + index, value: statement, index, }).add(annotations)
  }
  parseSingleLineComment = () => {
    return Lexer.consume('SingleLineComment')
  }
  parseBlockComment = () => {
    return Lexer.consume('BlockComment')
  }
  parseSpaceLike = () => {
    return Lexer.consume('SpaceLike')
  }
  parseAnnotation = () => {
    let annotation = Lexer.consume('Annotation')
    return this.astHelper('Annotation', annotation).set({ key: annotation.value, value: annotation.value, params: paramParser.input(annotation.value) })
  }
  parseEmpty = () => {
    return EMPTY
  }
  input (raw: string) {
    let ast
    try {
      ast = this.parseAll(raw)
    } catch (ex) {
      console.error(ex.toString())
    }
    return ast
  }
}
export default new Parser()