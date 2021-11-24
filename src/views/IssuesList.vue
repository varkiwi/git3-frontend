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
          hide-default-footer
          :headers="headers"
          :items="issues"
          class="elevation-1"
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
                .map(async (issue) => {
                    // resolve the cid to get the issues data
                    const issueDataRaw = await this.$ipfsClient.cat(issue[0][2]);
                    const issueData = JSON.parse(issueDataRaw.toString());

                    let state;
                    if (issue[0][1] === 0) {
                        state = 'Open';
                    } else if (issue[0][1] === 1) {
                        state = 'Closed';
                    } else if (issue[0][1] === 2) {
                        state = 'Resolved';
                    } else {
                        state = 'Unknown';
                    }
                    return {
                        state,
                        bounty: issue[0][4],
                        opener: issue[0][5],
                        title: issueData.issueTitle,
                        text: issueData.issueText,
                    };
                }))
            .then((allIssues) => Promise.all(allIssues))
            .then((data) => { this.issues = data; });
    },
    methods: {
        newIssue() {
            /**
             * Pushes a new route in order to create a new issue.
             */
            const pushRoute = {
                name: 'Path',
                params: this.$router.history.current.params,
            };
            pushRoute.params.action = 'new';
            this.$router.push(pushRoute);
        },
    },
};
</script>
