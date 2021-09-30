import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        walletActive: false,
        walletAddress: null,
        openedDialogOnce: false,
    },
    mutations: {
        setActive(state, active) {
            state.walletActive = active;
        },
        setWalletAddress(state, walletAddress) {
            state.walletAddress = walletAddress;
        },
        setOpenedDialogOnce(state, status) {
            state.openedDialogOnce = status;
        },
    },
    actions: {
    },
    modules: {
    },
});
