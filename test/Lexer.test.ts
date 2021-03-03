import { expect } from 'chai'
import { Lexer, ParameterLexer } from '../src/Lexers'

describe('block lexer', () => {

  it('parses only comments', function() {
    let sql = `
    /*
    123
    */
    -- abc
    -- cde
    `
    let result = Lexer.input(sql).state("Global").tokens()
    expect(result.length).eq(8)
    expect(result.filter(i => i.type !== 'SpaceLike').length).eq(4) // include 'EOF'
  })

  it('parses only chars', function() {
    let sql = `
    12312
    *&^%)
    abcde
    `
    let result = Lexer.input(sql).state("Global").tokens()
    expect(result.length).eq(20)
  })

  it('parses comments & chars', function() {
    let sql = `
    /*
    comment1
    */
    12312 -- comment2
    abcde /* comment3 */ def
    -- comment 4
    `
    let result = Lexer.input(sql).state("Global").tokens()
    expect(result.length).eq(26)
    expect(result.filter(i => i.type.includes('Comment')).length).eq(4)
  })

  it('parses annotations', function() {
    let sql = `
    /*
    @Annotation1(id=1)
    @Annotation2
    */
    -- abc @Annotation3 123
    -- @Annotation4()
    `
    let result = Lexer.input(sql).state("Global").tokens();
    expect(result.length).eq(12) // include EOF
    let annotations = result.filter(i => i.type === 'Annotation')
    expect(annotations.length).eq(4)
    expect(annotations[0].text).eq('@Annotation1(id=1)')
    expect(annotations[1].text).eq('@Annotation2')
    expect(annotations[2].text).eq('@Annotation3')
    expect(annotations[3].text).eq('@Annotation4()')
  });
})

describe('param lexer', () => {

  it('parses annotation', function() {
    let text = '@Annotation(id = 1, title="123", description=\'abc\')'
    let result = ParameterLexer.input(text).tokens()
    expect(result.length).eq(15)
    let name = result.filter(i => i.type === 'AnnotationName')
    expect(name.length).eq(1)
    expect(name[0].value).eq('Annotation')
    let id = result.filter(i => i.type === 'Id')
    expect(id.length).eq(3)
    expect(id[0].value).eq('id')
    expect(id[1].value).eq('title')
    expect(id[2].value).eq('description')
  })

  // todo, test case for illegal syntax
})
