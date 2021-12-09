<template>
  <v-container class="px-md-4 px-lg-5">

    <v-row align="center" justify="center">
        <v-col lg="12">
            <div class="d-flex flex-row">
                <v-btn depressed color="green" @click="newIssue">
                    New issue
                </v-btn>
            </div>
        </v-col>
    </v-row>

    <v-row align="center" justify="center">
      <v-col lg="12">
        <!-- Table with files and directories -->
        <v-data-table
          :headers="headers"
          :items="issues"
          class="elevation-1"
          @click:row="handleClick"
        >
          <template v-slot:[`item.name`]="{ item }">
            {{ item.name }}
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ethers } from 'ethers';
import GitRepository from '../utils/GitRepository';

export default {
    name: 'IssuesList',
    props: {
        gitRepo: GitRepository,
    },
    data: () => ({
        headers: [
            {
                text: 'Name',
                align: 'start',
                sortable: false,
                value: 'title',
            },
            {
                text: 'Status',
                sortable: false,
                value: 'state',
            },
            {
                text: 'Bounty',
                sortable: false,
                value: 'bounty',
            },
        ],
        issues: [],
    }),
    async mounted() {
        const issueHashes = await this.gitRepo.allIssues;
        // eslint-disable-next-line no-restricted-syntax
        const issues = issueHashes[0].map((userCidHash) => this.gitRepo.issue(userCidHash));
        // resolve the hashes to the actual issues
        Promise.all(issues)
            .then((allIssues) => allIssues
                .map(async (issue, index) => {
                    // resolve the cid to get the issues data
                    const issueDataRaw = await this.$ipfsClient.cat(issue[0][2]);
                    const issueData = JSON.parse(issueDataRaw.toString());
                    let state;
                    if (issue[0].state === 0) {
                        state = 'Open';
                    } else if (issue[0].state === 1) {
                        state = 'Closed';
                    } else if (issue[0].state === 2) {
                        const currentBlockNumber = await this.gitRepo.web3Provider.getBlockNumber();
                        const remainingBlocks = (604800 - ((currentBlockNumber - issue[0].resolvedBlockNumber)));
                        state = `Resolved ( ${remainingBlocks} till closing )`;
                    } else {
                        state = 'Unknown';
                    }
                    return {
                        state,
                        bounty: ethers.utils.formatEther(issue[0].bounty),
                        opener: issue[0].opener,
                        title: `#${issue[0].issueNumber} ${issueData.issueTitle}`,
                        text: issueData.issueText,
                        answers: issue[0].issueAnswers,
                        issueNumber: issue[0].issueNumber.toString(),
                        issueHash: issueHashes[0][index],
                    };
                }))
            .then((allIssues) => Promise.all(allIssues))
            .then((data) => { this.issues = data.reverse(); });
    },
    methods: {
        handleClick(value) {
            localStorage.setItem('issue', JSON.stringify(value));
            this.$router.push({
                name: 'Issues',
                params: {
                    userAddress: this.$router.history.current.params.userAddress,
                    repositoryName: this.$router.history.current.params.repositoryName,
                    action: value.issueNumber,
                },
            });
        },
        newIssue() {
            /**
             * Pushes a new route in order to create a new issue.
             */
            const pushRoute = {
                name: 'Issues',
                params: this.$router.history.current.params,
            };
            pushRoute.params.action = 'new';
            console.log(pushRoute);
            this.$router.push(pushRoute);
        },
    },
};
</script>
