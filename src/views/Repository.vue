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
        v-if="$route.name == 'Repository' || $route.name == 'Path' || $route.name === 'File'"
        v-bind:branches="branchNames"
        v-bind:files="files"
        v-bind:directoryPath="[repositoryName, ...directoryPath.filter((entry) => entry !== 'files')]"
        v-bind:showFileContent="showFileContent"
        v-bind:repository="userAddress + '/' + repositoryName"
        v-on:changeBranch="loadRemoteFiles"
        v-on:changeDirectory="changeDirectory"
        v-on:leaveFileContent="leaveFileContent"
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
        showFileContent: false,
        remoteDatabase: undefined,
        directoryPath: [],
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
            /**
             * Loads the files and directories for a branch and displays it for the user
             */
            this.$gitRepo.getBranch(branchName)
                .then((branch) => {
                    if (branch[0][0] === false) {
                        console.log('Branch is not active!');
                    }
                    const cid = branch[0][1];
                    return this.resolveCID(cid);
                }).then((remoteDatabase) => {
                    this.remoteDatabase = remoteDatabase;
                    this.directoryPath = ['files'];
                    this.displayFiles();
                });
        },
        async changeDirectory(value) {
            /**
             * Function triggered whenever a user clicks on of the rows in order to load a file or
             * change directory.
             */
            if (value.type === 'file') {
                this.showFileContent = true;
                const fileContent = await this.resolveCID(value.cid);
                let lineNumber = 0;
                // replaces the last newline with a whitespace, in case there is one
                if (fileContent.content.endsWith('\n')) {
                    fileContent.content = fileContent.content.replace(/\n$/, '');
                }
                this.files = fileContent.content.split('\n').map((text) => {
                    lineNumber += 1;
                    return { line: lineNumber, text };
                });

                this.directoryPath.push(value.name);
                const path = this.directoryPath.filter((entry) => entry !== 'files').join('.');
                const routerPath = {
                    name: 'File',
                    params: {
                        userAddress: this.userAddress,
                        repositoryName: this.repositoryName,
                        file: path,
                    },
                };
                this.$router.push(routerPath).catch(() => {});
            } else {
                if (value.name === '. .' && value.type === 'dotdot') {
                    this.directoryPath = this.directoryPath.slice(0, this.directoryPath.length - 2);
                } else {
                    this.directoryPath.push(value.name);
                    this.directoryPath.push('files');
                }
                const path = this.directoryPath.filter((entry) => entry !== 'files').join('.');

                const routerPath = {
                    params: {
                        userAddress: this.userAddress,
                        repositoryName: this.repositoryName,
                    },
                };
                if (path === '') {
                    routerPath.name = 'Repository';
                } else {
                    routerPath.name = 'Path';
                    routerPath.params.path = path;
                }
                this.$router.push(routerPath).catch(() => {});
            }
        },
        async resolveCID(cid) {
            /**
             * Takes a cid to load the data from IPFS and decodes it for further use.
             */
            const data = await this.$ipfsClient.cat(cid);
            return JSON.parse(new TextDecoder('utf-8').decode(data));
        },
        displayFiles() {
            /**
             * Function goes through the remote database and displays the files
             * from the selected directory.
             */
            let folder = this.remoteDatabase;
            // check where the user currently is
            /* eslint-disable-next-line */
            for (const path of this.directoryPath) {
                folder = folder[path];
            }
            // update the entries with some additional data
            this.files = Object.keys(folder).map((key) => {
                const entry = folder[key];
                entry.type = entry.mode === 33188 ? 'file' : 'dir';
                entry.commit_time = calculateCommitTime(entry.commit_time);
                return entry;
            });
            // if we are in a subdirectory, we need the user to give the possibility to go back
            if (this.directoryPath.length > 1) {
                this.files.unshift({ name: '. .', type: 'dotdot' });
            }
        },
        async leaveFileContent(value) {
            // if the value is zero, the user clicked on the repository name
            this.showFileContent = false;
            const routerPath = {
                params: {
                    userAddress: this.userAddress,
                    repositoryName: this.repositoryName,
                },
            };
            if (value === 0) {
                this.directoryPath = ['files'];
                routerPath.name = 'Repository';
            } else {
                let i = 0;
                let position = 0;
                for (; i < this.directoryPath.length; i += 1) {
                    if (this.directoryPath[i] !== 'files') {
                        position += 1;
                    }
                    if (position === value) {
                        break;
                    }
                }
                // we do i + 2, because we want to preserve the directory name and the files entry in the array
                this.directoryPath = this.directoryPath.slice(0, i + 2);
                routerPath.name = 'Path';
                routerPath.params.path = this.directoryPath.filter((entry) => entry !== 'files').join('.');
            }
            this.$router.push(routerPath).catch(() => {});
        },
    },

    watch: {
        async $route(to) {
            if (to.name === 'Repository') {
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
                        this.$gitRepo = await loadSmartContract(
                            this.$gitFactory, this.userAddress, this.repositoryName,
                        );
                        this.updatedBranchNames();
                    }
                } else {
                    this.displayFiles();
                }
            } else if (to.name === 'Path') {
                this.displayFiles();
            }
        },
    },
};
</script>
