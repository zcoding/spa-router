import Vue    from 'vue';
import Router from 'spa-router-better';

Vue.config.debug = true;

let app = new Vue({
  el: '#app-root',

  components: {
    pageHome: function(resolve) {
      require(['views/pageHome.vue'], resolve);
    },
    pageOne: function(resolve) {
      require(['views/pageOne.vue'], resolve);
    },
    page404: function(resolve) {
      require(['views/page404.vue'], resolve);
    }
  },

  created() {
    window.addEventListener('error', (event) => {
      let errorLogInfo = {
        "name": event.error.name, // 错误类型
        "message": event.message, // 错误描述
        "filename": event.filename, // 文件
        "lineno": event.lineno, // 行号
        "colno": event.colno // 列号
      };
      this.$dispatch('LOG-ERROR', errorLogInfo, event.error);
    }, false);
  },

  data() {
    return {
      currentView: 'pageHome'
    };
  },

  events: {

    "LOG-ERROR": function(errorLogInfo) {
      console.group('%c错误信息', 'color: #f33;');
      console.count('计数');
      console.log('类型 %s', errorLogInfo.name);
      console.log('描述 %s', errorLogInfo.message);
      console.log('文件 %s', errorLogInfo.filename);
      console.log('行号 %s', errorLogInfo.lineno);
      console.log('列号 %s', errorLogInfo.colno);
      console.log('时间 %s', new Date(errorLogInfo.datetime).toLocaleString());
      console.log('UA %s', navigator.userAgent);
      console.groupEnd();
    }

  }

});

let spaRouter = new Router({
  "/": function(req) {
    app.currentView = 'pageHome';
  },
  "/one": function(req) {
    app.currentView = 'pageOne';
  }
});

spaRouter.start({
  root: '/',
  notFound: function() {
    app.currentView = 'page404';
  }
});
