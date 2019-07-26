import Vue from 'vue'
import Vuex from 'vuex'
import axios from "./axios-auth";
import globalAxios from 'axios';
import router from './router';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    idToken: null,
    userId: null,
    user: null
  },
  mutations: {
    authUser(state, userData) {
      state.idToken = userData.token;
      state.userId = userData.userId;
    },
    storeUser(state, user) {
      state.user = user;
    },
    clearAuth(state) {
      state.idToken = null;
      state.userId = null;
    }
  },
  actions: {
    setLogoutTimer({ commit }, expirationTime) {
      setTimeout(() => {
        commit('clearAuth')
      }, expirationTime * 1000)
    },
    signup({ commit, dispatch }, authData) {
      axios
        .post(":signUp?key=AIzaSyA5HcC-4QJMbgXJhrLwB1_xJxysmlGRAy8", {
          email: authData.email,
          password: authData.password,
          returnSecureToken: true
        })
        .then(res => {
          console.log(res)
          commit('authUser', {
            token: res.data.idToken,
            userId: res.data.localId
          });
          const now = new Date();
          const expiresAt = new Date(now.getTime() + res.data.expiresIn * 1000);
          localStorage.setItem('token', res.data.idToken);
          localStorage.setItem('userId', res.data.localId);
          localStorage.setItem('expiresAt', expiresAt);
          dispatch('storeUser', authData);
          dispatch('setLogoutTimer', res.data.expiresIn);
        })
        .catch(err => console.log(err));
    },
    login({ commit, dispatch }, authData) {
      axios
        .post(":signInWithPassword?key=AIzaSyA5HcC-4QJMbgXJhrLwB1_xJxysmlGRAy8", {
          email: authData.email,
          password: authData.password,
          returnSecureToken: true
        })
        .then(res => {
          console.log(res)
          commit('authUser', {
            token: res.data.idToken,
            userId: res.data.localId
          });
          const now = new Date();
          const expiresAt = new Date(now.getTime() + res.data.expiresIn * 1000);
          localStorage.setItem('token', res.data.idToken);
          localStorage.setItem('userId', res.data.localId);
          localStorage.setItem('expiresAt', expiresAt);
          dispatch('setLogoutTimer', res.data.expiresIn);
        })
        .catch(err => console.log(err));
    },
    tryAutoLogin({ commit }) {
      const now = new Date();
      const expiresAt = localStorage.getItem('expiresAt');
      if(now >= expiresAt) {
        return
      }
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      commit('authUser', {
        token: token,
        userId: userId
      });
    },
    logout({ commit, dispatch }) {
      commit('clearAuth');
      dispatch('clearLocalStorage');
      router.replace('/signin');
    },
    clearLocalStorage() {
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      localStorage.removeItem('expiresAt');
    },
    storeUser({ commit, state }, userData) {
      if (!state.idToken) {
        return
      }
      globalAxios.post('/users.json' + '?auth=' + state.idToken, userData)
        .then(res => console.log(res))
        .catch(err => console.log(err));
    },
    fetchUser({ commit, state }) {
      if (!state.idToken) {
        return
      }
      globalAxios.get('/users.json' + '?auth=' + state.idToken)
        .then(res => {
          console.log(res);
          const data = res.data;
          const users = [];
          for (let key in data) {
            const user = data[key];
            user.id = key;
            users.push(user);
          }
          console.log(users);
          commit('storeUser', users[0]);
        })
        .catch(err => console.log(err));
    }
  },
  getters: {
    user(state) {
      return state.user;
    },
    isAuthenticated(state) {
      return state.idToken !== null;
    }
  }
})