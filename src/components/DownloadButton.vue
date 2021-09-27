<template>
  <div class="text-center">
    <v-menu
      :close-on-content-click="false"
      :nudge-width="200"
      offset-y
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn dark v-bind="attrs" v-on="on">
          Download
        </v-btn>
      </template>

      <v-card>
        <v-list dense>
            <v-list-item>
                <v-icon class='mr-2'>mdi-console</v-icon>
                <span class="font-weight-bold">Clone</span>
            </v-list-item>
            <v-list-item>
                Git3 CLI
            </v-list-item>
            <v-list-item>
                <v-text-field
                  v-model="text"
                  outlined
                  dense
                  readonly
                  color="white"
                  append-outer-icon="mdi-clipboard-edit-outline"
                  @click:append-outer="copyToClipboard"
                ></v-text-field>
            </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
export default {
    name: 'DownloadButton',
    props: {
        repo: String,
    },
    data: (instance) => ({
        text: `git3 clone ${instance.repo}`,
    }),
    methods: {
        copyToClipboard() {
            navigator.clipboard.writeText(this.text);
        },
    },
};
</script>
