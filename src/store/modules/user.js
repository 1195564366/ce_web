import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    userInfo: localStorage.getItem('CE_userInfo') ? JSON.parse(localStorage.getItem('CE_userInfo')) : null,
    source: localStorage.getItem('CE_source') || null
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    setToken(token);
    state.token = token
  },
  SET_USERINFO: (state, userInfo) => {
    state.userInfo = userInfo
    localStorage.setItem('CE_userInfo', JSON.stringify(userInfo))
  },
  SET_SOURCE: (state, source) => {
    state.source = source;
    localStorage.setItem('CE_source', source)
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { name, pwd } = userInfo
    console.log(userInfo)
    return new Promise((resolve, reject) => {
      login({ phone: name.trim(), pwd: pwd }).then(response => {
        console.log(response.data)
        const { token, name, phone, userType, image, id } = response.data
        console.log(token, name, phone, userType, image, id)
        commit('SET_TOKEN', token)
        setToken(token)
        commit('SET_NAME', name)
        commit('SET_AVATAR', image)
        commit('SET_ID', id)
        commit('SET_userType', userType)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response

        if (!data) {
          return reject('Verification failed, please Login again.')
        }

        const { name, avatar } = data

        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

