import Vue from 'vue';
import { ethers } from 'ethers';
import App from './App.vue';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import gitFactoryJson from './assets/contracts/GitFactory.sol/GitFactory.json';

const provider = new ethers.providers.JsonRpcProvider(process.env.VUE_APP_RPC_ENDPOINT);

const gitFactoryAbi = gitFactoryJson.abi;
const gitFactoryAddress = process.env.VUE_APP_GITFACTORY_ADDRESS;
const gitFactory = new ethers.Contract(gitFactoryAddress, gitFactoryAbi, provider);

Vue.config.productionTip = false;

Vue.prototype.$gitFactory = gitFactory;

new Vue({
    router,
    store,
    vuetify,
    render: (h) => h(App),
}).$mount('#app');
