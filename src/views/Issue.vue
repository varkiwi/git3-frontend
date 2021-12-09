<template>
  <v-container class="px-md-4 px-lg-5">

    <v-row align="center" justify="center">
        <v-col lg="8">
            <div class="d-flex flex-row">
                <h1>{{ issueNumber }} {{ title }}</h1>
            </div>
        </v-col>
    </v-row>

    <v-row align="center" justify="center">
        <v-col lg="8">
            <div class="d-flex flex-row">
               <v-chip color="green">{{ state }}</v-chip>
               <v-chip v-if="bounty !== '0.0'" color="green">Bounty: {{ bounty }}</v-chip>
            </div>
        </v-col>
    </v-row>

    <v-row align="center" justify="center">
        <v-col lg="8">
            <v-timeline dense>
                <v-timeline-item color="green" small>
                    <v-textarea
                        outlined
                        name="input-7-4"
                        label=""
                        readonly
                        no-resize
                        color="white"
                        persistent-hint
                        :value="text"
                        ></v-textarea>
                </v-timeline-item>

                <v-timeline-item color="green" small v-for="answer in answers" :key="answer.timestamp">
                    <v-textarea
                        outlined
                        name="input-7-4"
                        :label="`${answer.author} commented`"
                        readonly
                        no-resize
                        color="white"
                        :value="answer.issueText"
                    ></v-textarea>
                </v-timeline-item>
            </v-timeline>
        </v-col>
    </v-row>

    <v-row align="center" justify="center">
        <v-col lg="8">
            <div class="d-flex flex-row">
               <v-textarea
                outlined
                name="input-7-4"
                label="Leave a comment"
                no-resize
                color="white"
                v-model="comment"
                >
              </v-textarea>
            </div>
        </v-col>
    </v-row>

    <v-row align="center" justify="center">
        <v-col offset-md="10" md="2" offset-lg="6" lg="2">
            <div class="d-flex flex-row">
               <v-text-field
                    outlined
                    dense
                    name="additionalBounty"
                    label="Add Bounty"
                    hide-details="auto"
                    color="white"
                    v-model="addBounty"
                ></v-text-field>
            </div>
        </v-col>
    </v-row>

    <v-row align="center" justify="center">
        <v-col lg="8">
            <div class="d-flex flex-row">
               <v-btn
                :loading="loading"
                rounded
                class="ml-auto"
                depressed
                color="green"
                @click="postComment"
                >
                    Comment
                </v-btn>
                <v-btn
                v-if="issue.opener && walletAddress && walletAddress.toLowerCase() === issue.opener.toLowerCase()"
                :loading="loading"
                rounded
                class="ml-4"
                depressed
                color="green"
                @click="postAndCloseComment"
                >
                    Comment and {{ action }}
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
                        Connect a wallet in order to add an answer to the issue.
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

export default {
    name: 'Issue',

    components: {},

    data: () => ({
        issue: {},
        title: '',
        issueNumber: '',
        state: '',
        text: '',
        bounty: 0,
        addBounty: 0,
        additionalBounty: 0,
        comment: '',
        loading: false,
        answers: [],
        dialog: false,
        action: '',
    }),

    mounted() {
        this.issue = JSON.parse(localStorage.getItem('issue'));
        localStorage.getItem('issue');

        this.title = this.issue.title.replace(/#\d/, '');
        this.issueNumber = `#${this.issue.issueNumber}`;
        this.state = this.issue.state;
        this.text = this.issue.text;
        this.bounty = this.issue.bounty.toString();

        if (this.issue.bounty > 0 && this.state === 'Open') {
            this.action = 'resolve';
        } else {
            this.action = 'close';
        }

        const answers = this.issue.answers.map((answer) => this.$ipfsClient.cat(answer[0])
            .then((rawData) => JSON.parse(new TextDecoder('utf-8').decode(rawData))));
        Promise.all(answers).then((data) => { this.answers = data; });
    },
    methods: {
        async postComment() {
            if (this.comment.length > 0) {
                const gitRepo = this.$store.state.gitRepository;
                if (!gitRepo.web3Signer) {
                    this.dialog = true;
                    return;
                }
                const issue = {
                    issueText: this.comment,
                    issueTitle: '',
                    timestamp: Date.now(),
                    author: await gitRepo.web3Signer.getAddress(),
                };
                let cid;
                this.$ipfsClient.add(Buffer.from(JSON.stringify(issue)))
                    .then((answer) => {
                        cid = answer[0].hash;
                        const overrides = {
                            value: ethers.utils.parseEther(this.addBounty.toString()),
                        };
                        return gitRepo.appendAnswerToIssue(this.issue.issueHash, cid, overrides);
                    })
                    .then((tx) => {
                        this.loading = true;
                        return tx.wait();
                    })
                    .then(() => {
                        this.loading = false;
                        this.answers.push(issue);
                        this.comment = '';
                    });
            }
        },
        async postAndCloseComment() {
            await this.postComment();
            this.loading = true;
            const gitRepo = this.$store.state.gitRepository;

            if (this.issue.bounty > 0) {
                // when there is a bounty, we have to resolve it first,
                // before we can close it! This might change in the future or maybe should :D
                gitRepo.updateIssueState(this.issue.issueHash, 2)
                    .then((tx) => tx.wait())
                    .then(() => { this.loading = false; });
            } else {
                // there is no bounty, so we can close the issue :)
                gitRepo.updateIssueState(this.issue.issueHash, 1)
                    .then((tx) => tx.wait())
                    .then(() => { this.loading = false; });
            }
        },
    },
    computed: {
        walletAddress() {
            return this.$store.state.walletAddress;
        },
    },
};
</script>
