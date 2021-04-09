import parser from '../src/ParamParser'
import { expect } from 'chai'

describe('param parser', () => {

  it('parses annotation with no parentheses', function() {
    let text = '@Annotation'
    let result = parser.input(text);
    expect(result).eqls({
      AnnotationName: 'Annotation',
    })
  });

  it('parses annotation with empty parentheses', function() {
    let text = '@Annotation'
    let result = parser.input(text);
    expect(result).eqls({
      AnnotationName: 'Annotation',
    })
  });


  it('parses annotation and returns all params', function() {
    let text = '@Annotation(id = 1, title="123", description=\'abc\', other="test")'
    let result = parser.input(text);
    expect(result).eqls({
      AnnotationName: 'Annotation',
      id: 1,
      title: '123',
      description: 'abc',
      other: 'test'
    })

  });

})