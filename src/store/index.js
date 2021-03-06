import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        walletActive: false,
        walletAddress: null,
        openedDialogOnce: false,
        web3Provider: null,
        gitRepository: null,
        repositoryDonations: 0,
    },
    mutations: {
        setActive(state, active) {
            if (!active) {
                state.web3Provider = null;
            }
            state.walletActive = active;
        },
        setWalletAddress(state, walletAddress) {
            state.walletAddress = walletAddress;
        },
        setOpenedDialogOnce(state, status) {
            state.openedDialogOnce = status;
        },
        setWeb3Provider(state, provider) {
            state.web3Provider = provider;
        },
        setGitRepository(state, gitRepo) {
            state.gitRepository = gitRepo;
        },
        setRepositoryDonations(state, tips) {
            state.repositoryDonations = tips;
        },
    },
    actions: {
    },
    modules: {
    },
});
