<template>
  <div>
    <div class="mb-5">
      <div class="px-8 pt-3">
        <!-- this is the header part -->
        <div class="d-flex mb-3">
          <h1>Repository Name: {{ $route.params.repositoryName }}</h1>
        </div>
        <!-- This is the tabs parts -->
        <div>
          <v-tabs background-color="secondary" v-model="selectedTab">

            <v-tabs-slider color="white"></v-tabs-slider>

            <v-tab v-for="tab in tabs" :key="tab.name"
              :id="tab.name"
              @click="handleTabs"
              class="white--text"
            >
              {{ tab.name }}
            </v-tab>
          </v-tabs>
        </div>
      </div>

      <v-divider/>
    </div>

    <RepositoryCode
        v-if="$route.params.path == undefined"
        v-bind:branches="branchNames"
        v-bind:files="files"
        v-on:changeBranch="loadRemoteFiles"
    />
    <IssuesList v-else-if="$route.params.path == 'issues'" />
  </div>
</template>

<script>
import IssuesList from './IssuesList.vue';
import RepositoryCode from './RepositoryCode.vue';

import loadSmartContract from '../utils/utils';

/**
 * Takes a timestamp and calculates the difference between the given timestamp and the current timestamp.
 * Returns a string, that shows the difference in either seconds, minutes, hours, days or years.
 *
 * @param commitTimestamp {Number} - A timestamp from the past
 * @returns {string} - A string showing the differnce between the past and the current timestamp
 */
function calculateCommitTime(commitTimestamp) {
    const currentTimestamp = Math.round(new Date().getTime() / 1000);
    const diffSec = Math.round(currentTimestamp - commitTimestamp);
    if (diffSec < 60) {
        return `${diffSec} seconds ago`;
    }
    const diffMin = Math.round(diffSec / 60);
    if (diffMin < 60) {
        return `${diffMin} minutes ago`;
    }
    const diffHours = Math.round(diffMin / 60);
    if (diffHours < 24) {
        return `${diffHours} hours ago`;
    }
    const diffDays = Math.round(diffHours / 24);
    if (diffDays < 365) {
        return `${diffDays} days ago`;
    }
    return `${Math.round(diffDays / 365)} yeats ago`;
}

function addFileToMap(commit, entry, map) {
    let entryInformation;
    // if the map contains the entry, which is the file/folder name
    if (map.has(entry.name)) {
        // we are extracting the information it maps to
        entryInformation = map.get(entry.name);
        // if the cid from the previous entry is identical to the current cid, we have to update the
        // commit message. Reason being is, we go from the youngest to the oldest commit. Since the youngest commit
        // contains all files and folder information, we have to see, if they have been modified in between.
        // If the cid is identical, we file/folder has not been modified, and we have to use an older commit message.
        if (entryInformation.cid === entry.cid) {
            entryInformation.commit_message = commit.commit_message;
            map.set(entry.name, entryInformation);
        }
    } else {
        // if the map does not contain the entry, we create a new entry
        entryInformation = {
            name: entry.name,
            mode: entry.mode,
            cid: entry.cid,
            commit_message: commit.commit_message,
            commit_time: calculateCommitTime(commit.committer.date_seconds),
            type: entry.mode === 33188 ? 'file' : 'dir',
        };
        map.set(entry.name, entryInformation);
    }
}

export default {
    name: 'Repository',

    components: {
        RepositoryCode,
        IssuesList,
    },

    data: () => ({
        tabs: [
            { name: '/code', selected: true },
            { name: '/issues', selected: false },
        ],
        files: [],
        userAddress: undefined,
        repositoryName: undefined,
        selectedTab: 0,
        branchNames: undefined,
    }),

    async mounted() {
        // if userAddress and repositoryName remain the same, we don't have to do anything
        if (this.userAddress === this.$route.params.userAddress
              && this.repositoryName === this.$route.params.repositoryName) {
            return;
        }
        this.userAddress = this.$route.params.userAddress;
        this.repositoryName = this.$route.params.repositoryName;

        this.$gitRepo = await loadSmartContract(this.$gitFactory, this.userAddress, this.repositoryName);
        await this.updatedBranchNames();
        // todo: we have to read in the files
        this.loadRemoteFiles('main');
    },

    methods: {
        handleTabs(e) {
            /**
             * Method to handle the changes in the tabs
             */
            const pushRoute = {
                params: {
                    userAddress: this.userAddress,
                    repositoryName: this.repositoryName,
                },
            };
            // if we visit a tab, we have to differentiate between files overview
            // and everything else.
            // e.target.id.substring(1) gives me the name of the tab, excluding the leading slash
            if (e.target.id !== '/code') {
                pushRoute.name = 'Path';
                pushRoute.params = {
                    path: e.target.id.substring(1),
                };
            } else {
                pushRoute.name = 'Repository';
            }
            this.$router.push(pushRoute);
        },
        async updatedBranchNames() {
            /**
             * Reads the git branches from the contract and updates the names in the frontend
             */
            const branchNames = await this.$gitRepo.getBranchNames();
            // eslint-disable-next-line arrow-body-style
            this.branchNames = branchNames.map((branchName) => { return { title: branchName[0] }; });
        },
        async loadRemoteFiles(branchName) {
            // console.log('Loading remote files for branch', branchName);
            this.$gitRepo.getBranch(branchName)
                .then((branch) => {
                    if (branch[0][0] === false) {
                        console.log('Branch is not active!');
                    }
                    const cid = branch[0][1];
                    console.log('CID:', cid);
                    this.traverseGitStructures(cid);
                });
        },
        async traverseGitStructures(cid) {
            let parentCid = cid;
            let data;
            let commit;
            let tree;
            const fileStructure = new Map();
            // let commit = commitJson;
            const commitQueue = [];
            do {
                // eslint-disable-next-line no-await-in-loop
                data = await this.$ipfsClient.cat(parentCid);
                commit = JSON.parse(new TextDecoder('utf-8').decode(data));
                // console.log('Commit', commit);

                // eslint-disable-next-line no-await-in-loop
                data = await this.$ipfsClient.cat(commit.tree);
                tree = JSON.parse(new TextDecoder('utf-8').decode(data));
                // console.log('Tree:', tree);

                const { entries } = tree;
                for (let i = 0; i < entries.length; i += 1) {
                    // console.log('Entry:', entries[i]);
                    addFileToMap(commit, entries[i], fileStructure);
                }

                // we add the parents cids to the queue
                commitQueue.push(...commit.parents);
                parentCid = commitQueue.shift();
                console.log();
            } while (parentCid);
            // console.log('File Structure', fileStructure);
            this.files = [];
            fileStructure.forEach((value) => {
                this.files.push(value);
            });
        },
    },

    watch: {
        async $route(to) {
            console.log(to);
            // if the user address or the repository name has changed
            if (this.userAddress !== to.params.userAddress
                  || this.repositoryName !== to.params.repositoryName) {
                this.userAddress = to.params.userAddress;
                this.repositoryName = to.params.repositoryName;
                // and the path is undefined, we set the selected tab on 0
                // if someone is on issues and searches for a diffrerent repo
                // this is going to set the tab on code.
                if (to.params.path === undefined) {
                    this.selectedTab = 0;
                    this.$gitRepo = await loadSmartContract(this.$gitFactory, this.userAddress, this.repositoryName);
                    this.updatedBranchNames();
                }
            }
        },
    },
};
</script>
