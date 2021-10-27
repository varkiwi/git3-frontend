<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-img
          :src="require('../assets/logo.svg')"
          class="my-3"
          contain
          height="200"
        />
      </v-col>

      <v-col class="mb-4">
        <h1 class="display-2 font-weight-bold mb-3">
          Welcome to Git3
        </h1>
      </v-col>

      <v-col
        class="mb-5"
        cols="12"
      >
        <h2 class="headline font-weight-bold mb-3">
          Start by searching for some repositories, like:
          <!-- List like 5 of them if there are so many :D -->
        </h2>

        <v-row justify="center">
          <a
            v-for="(next, i) in whatsNext"
            :key="i"
            :href="next.href"
            class="headline mx-3 white--text"
          >
            {{ next.text }}
          </a>
        </v-row>
      </v-col>

      <v-col
        class="mb-5"
        cols="12"
      >
        <h2 class="headline font-weight-bold mb-3">
          You want to learn more about the project:
        </h2>

        <v-row justify="center">
          <a
            v-for="(next, i) in ecosystem"
            :key="i"
            :href="next.href"
            class="headline mx-3 white--text"
            target="_blank"
          >
            {{ next.text }}
          </a>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

export default {
    name: 'Frontpage',

    data: () => ({
        ecosystem: [
            {
                text: 'Github',
                href: 'https://github.com/varkiwi/',
            },
            {
                text: 'Gitcoin Grant',
                href: 'https://gitcoin.co/grants/1490/git3',
            },
            {
                text: 'Hackernoon: Git3 - First Alpha Release',
                href: 'https://hackernoon.com/git3-first-alpha-release-co1n32ix',
            },
        ],
        whatsNext: [],
    }),

    async mounted() {
        let displayRepos = [];
        this.$gitFactory.getRepositoryNames()
            .then((repoNames) => {
                // if there are already more than 3 repos available, pick 3 random
                // it is not really random, since it could repeat itself, but it is currently not
                // super important :)
                if (repoNames.length > 3) {
                    displayRepos[0] = repoNames[getRandomArbitrary(0, repoNames.length)];
                    displayRepos[1] = repoNames[getRandomArbitrary(0, repoNames.length)];
                    displayRepos[2] = repoNames[getRandomArbitrary(0, repoNames.length)];
                } else {
                    displayRepos = repoNames;
                }
                const resolve = [];
                displayRepos.forEach((repo) => resolve.push(this.$gitFactory.getRepositoriesUserList(repo)));
                return Promise.all(resolve);
            })
            .then((data) => {
                this.whatsNext.push({
                    text: displayRepos[0],
                    href: `${data[0][0]}/${displayRepos[0]}`,
                });
                this.whatsNext.push({
                    text: displayRepos[1],
                    href: `${data[1][0]}/${displayRepos[1]}`,
                });
                this.whatsNext.push({
                    text: displayRepos[2],
                    href: `${data[2][0]}/${displayRepos[2]}`,
                });
            });
    },
};
</script>
