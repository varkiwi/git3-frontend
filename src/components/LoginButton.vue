<template>
    <div>
        <v-btn
          elevation="2"
          outlined
          icon
          @click="showModal"
        >
            <v-icon dark> mdi-login </v-icon>
        </v-btn>
        <v-dialog
          v-model="dialog"
          persistent
          max-width="290"
        >
            <v-card>
                <v-card-title class="text-h5">
                Switch network
                </v-card-title>
                <v-card-text>
                    Please switch your network to {{ networkName }}.
                    We currently only support this network.
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      color="green darken-1"
                      text
                      @click="dialog = false"
                    >
                        Ok
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';

const providerOptions = {
    walletconnect: {
        package: WalletConnectProvider,
        options: {
            infuraId: process.env.VUE_APP_INFURA_ID,
        },
    },
};
let provider;

const web3Modal = new Web3Modal({
    cacheProvider: false, // optional
    providerOptions, // required
    disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
    theme: 'dark',
});

function checkChainID(chainId) {
    return +chainId === +process.env.VUE_APP_CHAINID;
}

export default {
    name: 'Login',

    data: () => ({
        dialog: false,
        openedDialogOnce: false,
    }),

    computed: {
        networkName() {
            /**
             * Show this network the user should connect to, to use git3
             */
            return +process.env.VUE_APP_CHAINID === 80001 ? 'Polygon Mumbai' : 'Polygon Mainnet';
        },
        walletActive() {
            /**
             * Fired when the walletActive value in the storage changes. The idea is to show a dialog when the user
             * changes the network.
             */
            const { openedDialogOnce, walletActive } = this.$store.state;
            if (!walletActive && openedDialogOnce) {
                this.openDialog();
            }
            return walletActive;
        },
    },
    methods: {
        async showModal() {
            try {
                provider = await web3Modal.connect();
            } catch (e) {
                console.log('Could not get a wallet connection', e);
                return;
            }
            // checkig if the user is connected to the right network
            if (checkChainID(provider.chainId)) {
                const web3Provider = new ethers.providers.Web3Provider(provider);
                const gitRepo = this.$store.state.gitRepository;
                // if we login but no repository has been loaded yet
                if (gitRepo !== null) {
                    // we are providing the signer to the gitRepository object, since otherwise
                    // we are not able to send state chaning tx
                    gitRepo.web3Signer = web3Provider.getSigner();
                }

                this.$store.commit('setActive', true);
                this.$store.commit('setWalletAddress', provider.selectedAddress);
                this.$store.commit('setWeb3Provider', web3Provider);
            } else {
                console.log(`The chain id is ${provider.chainId}. We don't support that one`);
                this.dialog = true;
                this.$store.commit('setOpenedDialogOnce', true);
                return;
            }

            provider.on('accountsChanged', (accounts) => {
                const gitRepo = this.$store.state.gitRepository;
                if (accounts.length === 0) {
                    this.$store.commit('setActive', false);
                    gitRepo.web3Signer = undefined;
                } else {
                    console.log(`Accounts changed: ${accounts}`);
                    this.$store.commit('setWalletAddress', provider.selectedAddress);
                    gitRepo.tips.then((tips) => {
                        this.$store.commit('setRepositoryDonations', tips);
                    });
                }
            });
            // Subscribe to chainId change
            provider.on('chainChanged', (chainId) => {
                console.log('ChainID Changed', chainId);
                if (!checkChainID(chainId)) {
                    this.$store.commit('setActive', false);
                }
            });

            // Subscribe to provider connection
            provider.on('connect', (info) => {
                console.log('Connect:', info);
            });

            // Subscribe to provider disconnection
            provider.on('disconnect', () => {
                console.log('Provider disconnected:');
                this.$store.commit('setActive', false);
            });
        },
        openDialog() {
            this.dialog = true;
        },
    },
    watch: {
        walletActive: () => {
            console.log('Status changed');
        },
    },
};
</script>
