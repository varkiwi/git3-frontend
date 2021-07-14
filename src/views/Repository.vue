<template>
  <!-- <repo-content /> -->
  <div class="px-8 pt-3">
    <!-- this is the header part -->
    <div class="d-flex mb-3">
      <h1>Repository Name: {{ $route.params.repositoryName }}</h1>
      <!-- <p>User Address: {{ $route.params.userAddress }}</p> -->
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
</template>

<script>
// import RepoContent from '../components/RepoContent.vue';

export default {
    name: 'Repository',

    data: () => ({
        tabs: [
            { name: '/code' },
            { name: '/issues' },
        ],
    }),
    methods: {
        handleTabs: (e) => {
            console.log('Yes man', e.target.id);
        },
    },

    // components: {
    //     RepoContent,
    // },
};
</script>
