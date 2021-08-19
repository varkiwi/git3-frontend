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
          <v-tabs background-color="secondary">

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
            { name: '/code' },
            { name: '/issues' },
        ],
    }),
    methods: {
        handleTabs(e) {
            const pushRoute = {
                params: {
                    userAddress: this.$route.params.userAddress,
                    repositoryName: this.$route.params.repositoryName,
                },
            };
            // if we visit a tab, we have to differentiate between files overview
            // and everything else.
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
};
</script>
