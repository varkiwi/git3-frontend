<template>
  <v-container class="px-md-4 px-lg-5">
    <v-row align="center" justify="center">
      <v-col lg="12">
        <!-- the if is used to only show the element when the data is available -->
        <div class="d-flex flex-row" v-if="branches !== undefined">
          <!-- Dropdown menu where we can switch the branch -->
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn dark v-bind="attrs" v-on="on">
                {{ branches[model].title }}
              </v-btn>
            </template>

            <v-list>
              <v-list-item-group v-model="model" v-on:change="changeBranch">
                <v-list-item
                  v-for="(branch, index) in branches"
                  :key="index"
                  link
                >
                  <v-list-item-title>{{ branch.title }}</v-list-item-title>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-menu>

          <p class="pt-2 pl-3">
            <v-icon dark small> mdi-source-branch </v-icon>
            {{ branches.length }} branches
          </p>

          <!-- Download button -->
          <v-btn class="ml-auto">Download</v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row align="center" justify="center">
      <v-col lg="12">
        <!-- Table with files and directories -->
        <v-data-table
          v-if='!showFileContent'
          hide-default-footer
          :headers="headersFiles"
          :items="files"
          class="elevation-1"
          style="cursor: pointer"
          @click:row="changeDirectory"
        >
          <template v-slot:[`item.name`]="{ item }">
            <!-- if it is a file, we show the file icon, otherwise the directory icon -->
            <v-icon dark v-if="item.type === 'file'"> mdi-file </v-icon>
            <v-icon dark v-else-if="item.type === 'dir'"> mdi-folder </v-icon>
            {{ item.name }}
          </template>
        </v-data-table>

        <!-- Useing this simplied table to show the content of a file -->
        <v-simple-table v-else dense>
            <template v-slot:default>
                <tbody>
                    <tr
                      v-for="item in files"
                      :key="item.name"
                      style='background-color: initial !important; cursor: pointer;'
                    >
                        <td
                          style='border-bottom-width: 0; width: 5px; height: 20px'
                          class='px-1 text-right'>
                            {{item.line}}
                        </td>
                        <td style='border-bottom-width: 0; height: 20px' class='px-1 text-left'>{{item.text}}</td>
                    </tr>
                </tbody>
            </template>
        </v-simple-table>

      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
    name: 'RepositoryCode',

    props: {
        branches: Array,
        files: Array,
        showFileContent: Boolean,
    },

    data: () => ({
        model: 0,
        headersFiles: [
            {
                text: 'Name',
                align: 'start',
                sortable: false,
                value: 'name',
            },
            { text: 'Commit Message', sortable: false, value: 'commit_message' },
            { text: 'Commit Time', sortable: false, value: 'commit_time' },
        ],
        headersCode: [
            {
                text: '',
                align: 'start',
                sortable: false,
                value: 'line',
                width: '2%',
            },
            {
                text: '',
                sortable: false,
                value: 'text',
                width: '98%',
            },
        ],
    }),
    methods: {
        changeBranch() {
            this.$emit('changeBranch', this.branches[this.model].title);
        },
        changeDirectory(value) {
            this.$emit('changeDirectory', value);
        },
    },
};
</script>
