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

    <RepositoryCode v-if="$route.params.path == undefined" />
    <IssuesList v-else-if="$route.params.path == 'issues'" />

  </div>
</template>

<script>
import IssuesList from './IssuesList.vue';
import RepositoryCode from './RepositoryCode.vue';

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
        userAddress: undefined,
        repositoryName: undefined,
        selectedTab: 0,
    }),

    mounted() {
        // if userAddress and repositoryName remain the same, we don't have to do anything
        if (this.userAddress === this.$route.params.userAddress
              && this.repositoryName === this.$route.params.repositoryName) {
            return;
        }
        this.userAddress = this.$route.params.userAddress;
        this.repositoryName = this.$route.params.repositoryName;
        // TODO: load smart contract and the files!
        console.log('Loaded Repository', this.userAddress);
        console.log(this.$route.params.userAddress);
    },

    methods: {
        handleTabs(e) {
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
    },

    watch: {
        $route(to) {
            // if the user address or the repository name has changed
            if (this.userAddress !== to.params.userAddress
                  || this.repositoryName !== to.params.repositoryName) {
                // and the path is undefined, we set the selected tab on 0
                // if someone is on issues and searches for a diffrerent repo
                // this is going to set the tab on code.
                if (to.params.path === undefined) {
                    this.selectedTab = 0;
                }
            }
        },
    },
};
</script>
