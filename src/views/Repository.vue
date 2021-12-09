<template>
  <div v-if='mounted'>
    <div class="mb-5">
      <div class="px-8 pt-3">
        <!-- this is the header part -->
        <div class="d-flex mb-3">
          <h1>Repository Name: {{ $route.params.repositoryName }}</h1>
          <donate-button
            v-if="walletActive && walletAddress.toLowerCase() !== userAddress.toLowerCase()"
            :repoAddress="repoAddress"
            class='ml-auto'
          />
          <collect-tips
            v-else-if="walletActive && walletAddress.toLowerCase() === userAddress.toLowerCase()"
            :repoAddress="repoAddress"
            class='ml-auto'
          />
        </div>
        <!-- This is the tabs parts -->
        <div>
          <v-tabs
            background-color="secondary"
            v-model="selectedTab"
          >

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
        v-if="($route.name == 'Repository' || $route.name == 'Path' || $route.name === 'File')
            && ($route.params.path == '' || $route.params.path == undefined) && activeBranch"
        v-bind:branches="branchNames"
        v-bind:files="files"
        v-bind:directoryPath="[repositoryName, ...directoryPath.filter((entry) => entry !== 'files')]"
        v-bind:showFileContent="showFileContent"
        v-bind:repository="userAddress + '/' + repositoryName"
        v-on:changeBranch="loadRemoteFiles"
        v-on:changeDirectory="changeDirectory"
        v-on:leaveFileContent="leaveFileContent"
    />
    <RepositoryNoCode
        v-else-if="($route.name == 'Repository' || $route.name == 'Path' || $route.name === 'File') && !activeBranch"
    />
    <IssuesList
        v-else-if="$route.name == 'Issues' && $route.params.action === undefined"
        :gitRepo="gitRepo"
    />
    <NewIssue
        v-else-if="$route.name === 'Issues' && $route.params.action === 'new'"
        :gitRepo="gitRepo"
    />
    <Issue
        v-else-if="$route.name === 'Issues' && !isNaN($route.params.action)"
    />
  </div>
</template>

<script>
import IssuesList from './IssuesList.vue';
import Issue from './Issue.vue';
import NewIssue from './NewIssue.vue';
import RepositoryCode from './RepositoryCode.vue';
import RepositoryNoCode from './RepositoryNoCode.vue';

import loadSmartContract from '../utils/utils';
import DonateButton from '../components/DonateButton.vue';
import CollectTips from '../components/CollectTips.vue';

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
        RepositoryNoCode,
        IssuesList,
        DonateButton,
        CollectTips,
        NewIssue,
        Issue,
    },

    data: () => ({
        // if a repository has been created but no code pushed, there are no activeBranches
        activeBranch: false,
        branchNames: undefined,
        directoryPath: [],
        files: [],
        mounted: false,
        remoteDatabase: undefined,
        repositoryName: undefined,
        repoAddress: undefined,
        selectedTab: 0,
        showFileContent: false,
        tabs: [
            { name: '/code' },
            { name: '/issues' },
        ],
        userAddress: undefined,
    }),

    async mounted() {
        // if userAddress and repositoryName remain the same, we don't have to do anything
        if (this.userAddress === this.$route.params.userAddress
              && this.repositoryName === this.$route.params.repositoryName) {
            return;
        }
        this.userAddress = this.$route.params.userAddress;
        this.repositoryName = this.$route.params.repositoryName;

        await this.loadGitRepository();
        this.mounted = true;
    },

    computed: {
        walletActive() {
            return this.$store.state.walletActive;
        },
        walletAddress() {
            return this.$store.state.walletAddress;
        },
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
            if (e.target.id === '/issues') {
                pushRoute.name = 'Issues';
            } else {
                pushRoute.name = 'Repository';
                pushRoute.params = {
                    path: '',
                };
            }
            this.$router.push(pushRoute);
        },
        async updatedBranchNames() {
            /**
             * Reads the git branches from the contract and updates the names in the frontend
             */
            const branchNames = await this.gitRepo.getBranchNames();
            [this.branchNames] = branchNames;
        },
        async loadRemoteFiles(branchName) {
            /**
             * Loads the files and directories for a branch and displays it for the user
             */
            this.gitRepo.getBranch(branchName)
                .then((branch) => {
                    if (branch[0][0] === false) {
                        console.log('Branch is not active!');
                        throw new Error('Branch is not active');
                    }
                    const cid = branch[0][1];
                    return this.resolveCID(cid);
                })
                .then((remoteDatabase) => {
                    this.remoteDatabase = remoteDatabase;
                    this.directoryPath = ['files'];
                    this.displayFiles();
                })
                .catch((err) => {
                    console.log('Err', err);
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
            console.log('Display files');
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
            /**
             * Function which handles the clicks on the path shown to the user
             * @param {Number} value - Which entry in the directory path has been clicked
             */
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
        async loadGitRepository() {
            /**
             * FUnction which loads the git repository from the chain and links with the
             * web3 provider of the user if one is set.
             */
            this.gitRepo = await loadSmartContract(
                this.$gitFactory, this.userAddress, this.repositoryName,
            );
            this.$store.commit('setGitRepository', this.gitRepo);
            this.repoAddress = this.gitRepo.repositoryAddress;

            const { web3Provider } = this.$store.state;
            if (web3Provider !== null) {
                this.gitRepo.web3Signer = web3Provider.getSigner();
            }

            this.gitRepo.tips
                .then((tips) => {
                    this.$store.commit('setRepositoryDonations', tips);
                });
            this.updatedBranchNames()
                .then(() => {
                    // if there are no branches
                    if (this.branchNames.length === 0) {
                        // we set the value to false
                        this.activeBranch = false;
                    } else {
                        // otherwise true
                        this.activeBranch = true;
                        // and load the main branch
                        this.loadRemoteFiles('main');
                    }
                });
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
                    if (to.params.path === undefined || to.params.path === '') {
                        this.selectedTab = 0;
                        await this.loadGitRepository();
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
