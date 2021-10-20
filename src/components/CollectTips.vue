<template>
    <div class='d-flex'>
        <v-tooltip bottom>
             <template v-slot:activator="{ on, attrs }">
                <v-btn
                :loading="waitingForTx"
                :disabled="waitingForTx"
                elevation="2"
                outlined
                icon
                @click="collectTips"
                v-bind="attrs"
                v-on="on"
                >
                    <v-icon dark> mdi-hand-coin-outline </v-icon>
                </v-btn>
             </template>
             <span>Collect your tips</span>
        </v-tooltip>
        <p class='mt-2 ml-2'>{{ donationAmount }} Matic</p>
    </div>
</template>

<script>
export default {
    name: 'CollectTips',

    data: () => ({
        waitingForTx: false,
    }),

    computed: {
        donationAmount() {
            return this.$store.state.repositoryDonations;
        },
    },

    props: {
        repoAddress: String,
    },

    methods: {
        async collectTips() {
            const gitRepo = this.$store.state.gitRepository;
            gitRepo.collectTips()
                .then((transaction) => {
                    this.waitingForTx = true;
                    return transaction.wait();
                })
                .then(() => {
                    this.waitingForTx = false;
                    return gitRepo.tips;
                })
                .then((tips) => {
                    this.$store.commit('setRepositoryDonations', tips);
                });
        },
    },
};
</script>
