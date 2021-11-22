<template>
  <v-container class="px-md-4 px-lg-5">

    <v-row align="center" justify="center">
        <v-col lg="8">
            <div class="d-flex flex-row">
                <v-text-field
                    outlined
                    dense
                    name="issue-title"
                    label="Title"
                    hide-details="auto"
                    color="white"
                    v-model="issueTitle"
                    @input="updateButtonStatus"
                ></v-text-field>
            </div>
        </v-col>
    </v-row>

    <v-row align="center" justify="center">
        <v-col lg="8">
            <div class="d-flex flex-row">
                <v-textarea
                    @input="updateButtonStatus"
                    v-model="issueText"
                    outlined
                    dense
                    name="issue-text"
                    label="Leave a comment"
                    hide-details="auto"
                    color="white"
                ></v-textarea>
            </div>
        </v-col>
    </v-row>

    <v-row align="center" justify="center">
        <v-col lg="8">
            <div class="d-flex flex-row">
                <v-btn
                    :loading="loading"
                    :disabled="disabled"
                    class="ml-auto"
                    depressed
                    color="green"
                    @click="submitIssue"
                >
                    Submit issue
                </v-btn>
                <v-dialog
                    v-model="dialog"
                    max-width="290"
                >
                    <v-card>
                        <v-card-title class="text-h5">
                        No wallet found
                        </v-card-title>

                        <v-card-text>
                        Connect a wallet in order to submit an issue.
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
        </v-col>
    </v-row>
  </v-container>
</template>

<script>
import GitRepository from '../utils/GitRepository';

export default {
    name: 'NewIssue',

    props: {
        gitRepo: GitRepository,
    },

    data: () => ({
        issueTitle: '',
        issueText: '',
        disabled: true,
        loading: false,
        dialog: false,
    }),
    methods: {
        async submitIssue() {
            const issue = {
                issueText: this.issueText,
                issueTitle: this.issueTitle,
                timesampt: Date.now(),
            };
            this.$ipfsClient.add(Buffer.from(JSON.stringify(issue)))
                // eslint-disable-next-line consistent-return
                .then((answer) => {
                    const cid = answer[0].hash;
                    const { web3Provider } = this.$store.state;
                    if (web3Provider !== null) {
                        this.gitRepo.web3Signer = web3Provider.getSigner();
                        return this.gitRepo.openIssue(cid);
                    }
                    return Promise.reject(new Error('No web3 provider'));
                })
                .then((tx) => {
                    this.loading = true;
                    return tx.wait();
                })
                .then(() => {
                    this.loading = false;
                })
                .catch((err) => {
                    if (err.message === 'No web3 provider') {
                        this.dialog = true;
                    }
                });
        },
        updateButtonStatus() {
            this.disabled = this.issueTitle.length === 0 || this.issueText.length === 0;
        },
    },
};
</script>
