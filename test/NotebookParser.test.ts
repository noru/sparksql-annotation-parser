import parser from '../src/NotebookParser'
import { expect } from 'chai'

describe('parser', () => {

  it('parses full blocks', function() {
    let sql = `
    /*
    @Schedule(id=1)
    @Unknown1
    */
    -- abc @Unknown2 123
    -- @Unknown3()
    insert overwrite table working.lstg_item_tax_v 
    select/*test*/ 
        adpof.item_id as item_id--abc --@Unknown3()
      ,site.site_cntry_id as jrsdctn_cntry_id 
    from 
    working.dw_lstg_item_w_adpo_final  adpof
    inner join
    batch_views.dw_sites as site
    on site.site_id=adpof.item_site_id 
    where (cast(case  when adpof.flags4 < 0 then adpof.flags4 + 2147483648 else adpof.flags4 end  / 32 as int ) % 2)=0
    and (adpof.hot_process_flag in('I','U','S') or adpof.cold_process_flag in ('U','S')) ;

    /*@groupid=1*/
    create or replace temporary view 
    temp_item_id_v as 
    select 
        item_id 
    from 
    working.lstg_item_tax_v 
    group by 
    item_id;

    select * from test;
    `
    let result = parser.input(sql);
    expect(result.C.length, 'blocks').eq(3)
    expect(result.C[0].C.length).eq(2)
    expect(result.C[0].C[0].T).eq('Comment')
    expect(result.C[0].C[1].T).eq('Statement')
    expect(result.C[0].C[1].A.value).eq(`
    insert overwrite table working.lstg_item_tax_v 
    select/*test*/ 
        adpof.item_id as item_id--abc --@Unknown3()
      ,site.site_cntry_id as jrsdctn_cntry_id 
    from 
    working.dw_lstg_item_w_adpo_final  adpof
    inner join
    batch_views.dw_sites as site
    on site.site_id=adpof.item_site_id 
    where (cast(case  when adpof.flags4 < 0 then adpof.flags4 + 2147483648 else adpof.flags4 end  / 32 as int ) % 2)=0
    and (adpof.hot_process_flag in('I','U','S') or adpof.cold_process_flag in ('U','S')) ;
    `.trim())
    

    expect(result.C[1].C.length).eq(2)
    expect(result.C[1].C[0].T).eq('Comment')
    expect(result.C[1].C[1].T).eq('Statement')

    expect(result.C[2].C.length).eq(1)
    expect(result.C[2].C[0].T).eq('Statement')

  });

  it('parses single block', function() {
    let sql = `
    /*
    test
    */
    -- test
    -- test
    insert overwrite table working.lstg_item_tax_v;
    `
    let result = parser.input(sql);
    expect(result.C.length, 'blocks').eq(1)
    expect(result.C[0].C.length).eq(2)
    expect(result.C[0].C[0].T).eq('Comment')
    expect(result.C[0].C[1].T).eq('Statement')

    let comment = result.C[0].C[0].A.value
    expect(comment.trim()).eq(`
    /*
    test
    */
    -- test
    -- test
    `.trim())
    let statement = result.C[0].C[1].A.value
    expect(statement.trim()).eq(`insert overwrite table working.lstg_item_tax_v;`)

  });

  it('parses only statement block', function() {
    let sql = `
    insert overwrite table working.lstg_item_tax_v;
    `
    let result = parser.input(sql);
    expect(result.C.length, 'blocks').eq(1)
    expect(result.C[0].C.length).eq(1)
    expect(result.C[0].C[0].T).eq('Statement')

    let statement = result.C[0].C[0].A.value
    expect(statement.trim()).eq(`insert overwrite table working.lstg_item_tax_v;`)
  });

  it('parses only comment block', function() {
    let sql = `
    /*
    block 1
    */
    -- abc 
    -- 123
    `
    let result = parser.input(sql)
    expect(result.C.length, 'blocks').eq(1)
    expect(result.C[0].C.length).eq(1)
    expect(result.C[0].C[0].T).eq('Comment')

  });

  it('parses Annotation within comment block', function() {
    let sql = `
    /*
    @Schedule(id=1)
    @Unknown
    */
    -- abc @Unknown 123
    -- @Unknown
    `
    let result = parser.input(sql)
    expect(result.C.length, 'blocks').eq(1)
    expect(result.C[0].C.length).eq(1)
    expect(result.C[0].C[0].T).eq('Comment')
    expect(result.C[0].C[0].C.length).eq(4)

    let annotations = result.C[0].C[0].C.filter(i => i.T === 'Annotation')
    expect(annotations.length).eq(4)
    expect(annotations[0].A.params).eqls( { AnnotationName: 'Schedule', id: 1 })
    expect(annotations[1].A.params).eqls( { AnnotationName: 'Unknown' })
    expect(annotations[2].A.params).eqls( { AnnotationName: 'Unknown' })

  });

})