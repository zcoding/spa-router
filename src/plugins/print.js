import { walk } from '../tree';

// This is a plugin to print a route tree
export function printRouteTree (router) {
  walk(router._routeTree, function (rnode) {
  });
}
