import { ParameterLexer } from './Lexers'
import { ParserBase } from './ParserBase'

type KV = [string, string]
const EMPTY = Symbol()

export class ParamParser extends ParserBase {
  input(raw: string) {
    let result: KV[] = []
    ParameterLexer.input(raw)
    result.push(this.parseAnnotationName())
    result = result.concat(this.parseParameters())
    return result.reduce((a, b) => {
      a[b[0]] = b[1]
      return a
    }, {})
  }

  parseAnnotationName(): KV {
    let token = ParameterLexer.consume('AnnotationName')
    return ['AnnotationName', token.value]
  }

  parseParameters() {
    let params: KV[] = []

    while (1) {
      let token = ParameterLexer.alternatives(
        () => ParameterLexer.consume('Char', '('),
        this.parseParameter,
        () => ParameterLexer.consume('Char', ','),
        () => ParameterLexer.consume('Char', ')'),
        this.parseEmpty
      )
      if (token === EMPTY || token.value === ')') {
        break
      }
      if (Array.isArray(token)) {
        params.push(token as KV)
      }
    }

    return params
  }

  parseParameter = () => {
    let id = ParameterLexer.consume('Id')
    ParameterLexer.consume('Char', '=')
    let value = ParameterLexer.alternatives(this.parseNumber, this.parseString)
    return [id.value, value.value]
  }

  parseNumber = () => {
    return ParameterLexer.consume('Number')
  }
  parseString = () => {
    return ParameterLexer.consume('String')
  }
  parseEmpty() {
    return EMPTY
  }
}

export default new ParamParser()
