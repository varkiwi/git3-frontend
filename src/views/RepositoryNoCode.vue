<template>
  <v-container class="px-md-4 px-lg-5">
    <v-row align="center" justify="center">
      <v-col lg="12">
          <v-card dark elevation="5">
              <v-card-title>
                  No active branch found
            </v-card-title>
            <v-card-text style='font-size:1rem'>
                The repository has been created but no active brunch has been found.
            </v-card-text>
            <v-card-text style='font-size:1rem'>
                Go to your repository and push your code:
                <v-text-field
                    filled
                    dense
                    outlined
                    solo
                    :value="text"
                    readonly
                    color='white'
                    background-color='grey darken-3'
                    append-icon='mdi-clipboard-edit-outline'
                    @click:append="copyToClipboard"
                />
            </v-card-text>
          </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
    name: 'RepositoryNoCode',

    props: {},

    data: () => ({
        text: 'git3 push',
    }),
    methods: {
        copyToClipboard() {
            navigator.clipboard.writeText(this.text);
        },
    },
};
</script>
