<template>
  <v-app>
    <v-app-bar
      app
    >
      <div class="d-flex align-center">
        <v-img
          alt="Git3 Logo"
          class="shrink mr-2"
          contain
          :src="require('./assets/git3Logo.png')"
          transition="scale-transition"
          width="60"
          @click="backHome"
        />
      </div>

      <div class="d-flex align-center">
          <v-autocomplete
            class="pl-6 shrink"
            style="height: 30px;"
            color="white"
            prepend-icon="mdi-magnify"
            v-model="model"
            :items="items"
            :search-input.sync="searchRepository"
            clearable
            item-text="name"
            item-value="symbol"
            label="Search repository"
            @change="routeToRepo"
            ref="searchBar"
          ></v-autocomplete>
      </div>

      <v-spacer></v-spacer>
      <div>
        <login-button v-if="!walletActive"/>
        <button-with-tooltip v-else :spanText="walletAddress"/>
      </div>
    </v-app-bar>

    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>
import LoginButton from './components/LoginButton.vue';
import ButtonWithTooltip from './components/ButtonWithTooltip.vue';

export default {
    name: 'App',

    components: {
        LoginButton,
        ButtonWithTooltip,
    },

    data: () => ({
        items: [],
        model: null,
        searchRepository: null,
    }),

    computed: {
        walletActive() {
            return this.$store.state.walletActive;
        },
        walletAddress() {
            const address = this.$store.state.walletAddress;
            return `${address.slice(0, 5)}...${address.slice(38)}`;
        },
    },

    methods: {
        routeToRepo() {
            const [partialUserAddress, repositoryName] = this.model.split('/');
            const [front, back] = partialUserAddress.split('..');
            this.$gitFactory.getRepositoriesUserList(repositoryName)
                .then((users) => {
                    const userAddress = users.find((address) => {
                        if (address.startsWith(front) && address.endsWith(back)) {
                            return address;
                        }
                        return false;
                    });
                    this.model = null;
                    // we remove the focus from the search bar
                    this.$refs.searchBar.blur();
                    // if the user address and the repository are equal as the ones
                    // in the route (url), we don't have to push a new path!
                    if (userAddress === this.$route.params.userAddress
                          && repositoryName === this.$route.params.repositoryName) {
                        return;
                    }
                    this.$router.push({
                        name: 'Repository',
                        params: {
                            userAddress,
                            repositoryName,
                        },
                    }).catch(() => {});
                    // the catch block is used in order to catch the
                    // redundant error message
                });
        },
        backHome() {
            if (this.$router.currentRoute.name !== 'Home') {
                this.$router.push({
                    name: 'Home',
                }).catch(() => {});
            }
        },
    },

    watch: {
        searchRepository(userInput) {
            if (userInput === undefined || userInput === null || userInput.length < 4) return;
            this.$gitFactory.getRepositoryNames()
                .then((repoNames) => {
                    // and filter based on the search entered by the user
                    // TODO: overtime, we should go over all possible repositories and not only the
                    // first one get all user addresses who have a repository by the first name
                    const filteredRepoNames = repoNames.filter((entry) => entry.toLowerCase()
                        .startsWith(userInput.toLowerCase()));
                    return Promise.all([
                        this.$gitFactory.getRepositoriesUserList(filteredRepoNames[0]),
                        filteredRepoNames[0],
                    ]);
                })
                .then(([userList, filteredRepoName]) => {
                    // eslint-disable-next-line
                    this.items = userList.map((userAddress) => `${userAddress.substring(0, 6)}..${userAddress.substring(37)}/${filteredRepoName}`);
                })
                .catch((e) => {
                    console.log('No findings', e);
                });
        },
    },
};
</script>
