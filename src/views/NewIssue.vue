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
        <v-col offset-md="10" md="2" offset-lg="6" lg="2">
            <div class="d-flex flex-row">
                <v-text-field
                    outlined
                    dense
                    name="bounty"
                    label="Bounty"
                    hide-details="auto"
                    color="white"
                    v-model="bounty"
                    @input="updateButtonStatus"
                ></v-text-field>
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
import { ethers } from 'ethers';
import GitRepository from '../utils/GitRepository';

export default {
    name: 'NewIssue',

    props: {
        gitRepo: GitRepository,
    },

    data: () => ({
        issueTitle: '',
        issueText: '',
        bounty: 0,
        disabled: true,
        loading: false,
        dialog: false,
    }),
    methods: {
        async submitIssue() {
            const issue = {
                issueText: this.issueText,
                issueTitle: this.issueTitle,
                timestamp: Date.now(),
            };
            const { web3Provider } = this.$store.state;
            if (web3Provider === null) {
                this.dialog = true;
                return;
            }
            let cid;
            this.gitRepo.web3Signer = web3Provider.getSigner();
            this.$ipfsClient.add(Buffer.from(JSON.stringify(issue)))
                .then((answer) => {
                    cid = answer[0].hash;
                    const overrides = {
                        value: ethers.utils.parseEther(this.bounty.toString()),
                    };
                    return this.gitRepo.openIssue(cid, overrides);
                })
                .then((tx) => {
                    this.loading = true;
                    return tx.wait();
                })
                .then(() => {
                    this.loading = false;
                    return this.gitRepo.web3Signer.getAddress();
                })
                .then((address) => this.gitRepo.getUserCidHash(address, cid))
                .then((result) => this.gitRepo.issue(result[0]))
                .then((newIssue) => {
                    let state;
                    if (newIssue[0].state === 0) {
                        state = 'Open';
                    } else if (newIssue[0].state === 1) {
                        state = 'Closed';
                    } else if (newIssue[0].state === 2) {
                        state = 'Resolved';
                    } else {
                        state = 'Unknown';
                    }
                    const issueData = {
                        state,
                        bounty: ethers.utils.formatEther(newIssue[0].bounty),
                        opener: newIssue[0].opener,
                        title: `#${newIssue[0].issueNumber} ${this.issueTitle}`,
                        text: this.issueText,
                        answers: [],
                        issueNumber: newIssue[0].issueNumber.toString(),
                    };
                    localStorage.setItem('issue', JSON.stringify(issueData));
                    this.$router.push({
                        name: 'Issues',
                        params: {
                            userAddress: this.$router.history.current.params.userAddress,
                            repositoryName: this.$router.history.current.params.repositoryName,
                            action: newIssue[0].issueNumber,
                        },
                    });
                });
        },
        updateButtonStatus() {
            this.disabled = this.issueTitle.length === 0 || this.issueText.length === 0;
        },
    },
};
</script>
