import ASTy from 'asty'
import ASTq from 'astq'

const ASTQ = new ASTq()

export function getStatementByIndex (idx, ast: ASTy): ASTy {
  const query = `// Statement [ @index == ${idx} ]`
  return ASTQ.query(ast, query)[0]
}

export function getAllStatements(ast): ASTy {
  const query = `// Statement`
  return ASTQ.query(ast, query)
}

const VarReg = /\$\{([^}]*)}/g
export function getVariablesFromString(input) {
  let matches = {}
  let match: any
  while ((match = VarReg.exec(input)) !== null) {
    matches[match[1]] = (matches[match[1]] || 0) + 1
  }
  return matches
}