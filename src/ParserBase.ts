import Tokenizr from 'tokenizr'
import ASTY from 'asty-astq/lib/asty-astq.browser.js'

export class ParserBase {

  asty = new ASTY()

  astHelper (type, ref) {
    const ast = this.asty.create(type)
    if (typeof ref === 'object' && ref instanceof Array && ref.length > 0)
      ref = ref[0]
    if (typeof ref === 'object' && ref instanceof Tokenizr.Token)
      ast.pos(ref.line, ref.column, ref.pos)
    else if (typeof ref === 'object' && this.asty.isA(ref)) {
      const { line, column, offset } = ref.pos()
      ast.pos(line, column, offset)
    }
    return ast
  }

}