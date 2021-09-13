import Vue from 'vue';
import { ethers } from 'ethers';
import IpfsHttpClientLite from 'ipfs-http-client-lite';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import gitFactoryJson from './assets/contracts/GitFactory.sol/GitFactory.json';
import App from './App.vue';

const provider = new ethers.providers.JsonRpcProvider(process.env.VUE_APP_RPC_ENDPOINT);

const gitFactoryAbi = gitFactoryJson.abi;
const gitFactoryAddress = process.env.VUE_APP_GITFACTORY_ADDRESS;
const gitFactory = new ethers.Contract(gitFactoryAddress, gitFactoryAbi, provider);

Vue.config.productionTip = false;

Vue.prototype.$gitFactory = gitFactory;
Vue.prototype.$ipfsClient = IpfsHttpClientLite(process.env.VUE_APP_IPFS_ENDPOINT);

new Vue({
    router,
    store,
    vuetify,
    render: (h) => h(App),
}).$mount('#app');
