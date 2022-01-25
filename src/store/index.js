import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export function createStore() {
  return new Vuex.Store({
    state: {
      item: {
        title: '',
      },
    },
    mutations: {
      setItem(state, obj) {
        state.item = obj;
      },
    },
    actions: {
      fetchItem({ commit }, { id }) {
        console.log(id);
        const list = [
          { id: 1, details: { title: '首页' } },
          { id: 2, details: { title: '产品中心页' } },
          { id: 3, details: { title: '学堂' } },
          { id: 4, details: { title: '我的' } },
        ];
        commit('setItem', list.find(item => item.id === +id).details);
      },
    },
    modules: {},
  });
}
