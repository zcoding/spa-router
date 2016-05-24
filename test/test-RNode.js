import RNode from '../src/rnode';

describe("RNode对象", function() {
  let rnode = new RNode('1');
  it("value", function() {
    expect(rnode.value).toBe('1');
  });
});
