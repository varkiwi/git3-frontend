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
            <div class="d-flex flex-row">
               <v-textarea
                outlined
                name="input-7-4"
                label=""
                readonly
                no-resize
                color="white"
                solo
                persistent-hint
                :value="text"
                ></v-textarea>
            </div>
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
            </div>
        </v-col>
    </v-row>

  </v-container>
</template>

<script>

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
        comment: '',
        loading: false,
    }),

    mounted() {
        this.issue = JSON.parse(localStorage.getItem('issue'));
        localStorage.getItem('issue');
        console.log('data', this.issue);
        this.title = this.issue.title.replace(/#\d/, '');
        this.issueNumber = `#${this.issue.issueNumber}`;
        this.state = this.issue.state;
        this.text = this.issue.text;
        this.bounty = this.issue.bounty;
    },
    methods: {
        async postComment() {
            if (this.comment.length > 0) {
                const gitRepo = this.$store.state.gitRepository;
                // TODO: we will have to make a check here in case the user is not logged in
                const issue = {
                    issueText: this.comment,
                    issueTitle: '',
                    timestamp: Date.now(),
                    author: await gitRepo.web3Signer.getAddress(),
                };
                console.log('Issue to upload', issue);
                this.$ipfsClient.add(Buffer.from(JSON.stringify(issue)))
                    .then((answer) => {
                        const cid = answer[0].hash;
                        return gitRepo.appendAnswerToIssue(this.issue.issueHash, cid);
                    })
                    .then((tx) => {
                        this.loading = true;
                        return tx.wait();
                    })
                    .then(() => {
                        this.loading = false;
                    });
            }
        },
    },
};
</script>
