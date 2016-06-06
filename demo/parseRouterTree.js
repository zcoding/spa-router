function getDom(selector) {
  return document.querySelectorAll(selector)[0];
}

var rootElement = getDom('.render-tree');

function renderRouterTree(rNode, level, idx) {
  var li = document.createElement('li');
  li.dataset.node = level + '-' + idx;
  var item = document.createElement('a');
  item.href = 'javascript:;';
  item.innerHTML = '/' + rNode.value;
  li.appendChild(item);
  return li;
}

/**
 * 解析路由树，渲染成图形
 */
function parseRouterTree(parentNode, routerTree, level, idx) {
  level = level || 1;
  idx = idx || 1;
  var newNode = renderRouterTree(routerTree, level, idx);
  parentNode.appendChild(newNode);
  if (routerTree._children.length > 0) {
    var ul = document.createElement('ul');
    newNode.appendChild(ul);
  }
  for (var i = 0; i < routerTree._children.length; ++i) {
    parseRouterTree(ul, routerTree._children[i], level + 1, i + 1);
  }
}
