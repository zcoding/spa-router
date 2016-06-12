import Router from './main';

export default function install(Vue, options) {
  let directiveName = options.link || 'link2';
  let hasDirective = Vue.directive(directiveName);
  if (hasDirective) {
    throw new Error(`Directive ${directiveName} already exist.`);
  }
  Vue.directive(directiveName, {
    bind() {
      this.el.addEventListener('click', event => {
        event.preventDefault();
        this.vm.$router2.setRoute();
      }, false);
    }
  });
}
