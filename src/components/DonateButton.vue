<template>
    <div>
        <v-btn
          :loading="waitingForTx"
          :disabled="waitingForTx"
          elevation="2"
          outlined
          icon
          @click="showModal"
        >
            <v-icon dark style='color: red'> mdi-heart </v-icon>
        </v-btn>
        <v-dialog
          v-model="dialog"
          persistent
          max-width="290"
        >
            <v-card>
                <v-card-title class="text-h5">
                Donate
                </v-card-title>
                <v-card-text>
                    How much would you like to donate?
                    <!-- <v-switch
                        class='custom-red'
                        v-model="switch1"
                        color="orange darken-3"
                        :label="switch1 ? 'USD' : 'Matic'"
                    ></v-switch> -->
                    <v-text-field
                        dark
                        v-model="amount"
                        :rules="rules"
                        :hint="`Amount in Matic`"
                        label="Amount"
                    ></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      color="green darken-1"
                      text
                      @click="dialog = false"
                    >
                        Close
                    </v-btn>
                    <v-btn
                      color="green darken-1"
                      text
                      @click="sendDonation"
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

export default {
    name: 'Donate',

    data: () => ({
        amount: 0.01,
        dialog: false,
        switch1: true,
        rules: [(v) => /^\d+\.?\d{0,18}$/.test(v) || 'Must be numeric'],
        waitingForTx: false,
    }),

    props: {
        repoAddress: String,
    },

    methods: {
        async showModal() {
            this.dialog = true;
            // try {
            //     provider = await web3Modal.connect();
            // } catch (e) {
            //     console.log('Could not get a wallet connection', e);
            //     return;
            // }
            // // checkig if the user is connected to the right network
            // if (checkChainID(provider.chainId)) {
            //     this.$store.commit('setActive', true);
            //     this.$store.commit('setWalletAddress', provider.selectedAddress);
            // } else {
            //     console.log(`The chain id is ${provider.chainId}. We don't support that one`);
            //     this.dialog = true;
            //     this.$store.commit('setOpenedDialogOnce', true);
            //     return;
            // }

            // provider.on('accountsChanged', (accounts) => {
            //     console.log(`Accounts changed: ${accounts}`);
            //     this.$store.commit('setWalletAddress', provider.selectedAddress);
            // });
            // // Subscribe to chainId change
            // provider.on('chainChanged', (chainId) => {
            //     console.log('ChainID Changed', chainId);
            //     if (!checkChainID(chainId)) {
            //         this.$store.commit('setActive', false);
            //     }
            // });

            // // Subscribe to provider connection
            // provider.on('connect', (info) => {
            //     console.log('Connect:', info);
            // });

            // // Subscribe to provider disconnection
            // provider.on('disconnect', (error) => {
            //     console.log('Disconnect:', error);
            // });
        },
        async sendDonation() {
            // const currency = this.switch1 ? 'USD' : 'Matic';
            const { web3Provider } = this.$store.state;
            web3Provider.getGasPrice()
                .then(async (gasPrice) => {
                    const tx = {
                        from: this.$store.state.walletAddress,
                        to: this.repoAddress, // repo address
                        value: ethers.utils.parseEther(this.amount.toString()),
                        nonce: await web3Provider.getTransactionCount(this.$store.state.walletAddress, 'latest'),
                        gasLimit: ethers.utils.hexlify('0x100000'), // 100000
                        gasPrice: `0x${gasPrice.toString()}`,
                    };
                    const signer = web3Provider.getSigner();
                    return signer.sendTransaction(tx);
                })
                .then((transaction) => {
                    this.dialog = false;
                    this.waitingForTx = true;
                    return transaction.wait();
                })
                .then(() => {
                    this.waitingForTx = false;
                });
        },
    },
};
</script>
