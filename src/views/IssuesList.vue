<template>
  <v-container class="px-md-4 px-lg-5">
    <v-row align="center" justify="center">
      <v-col lg="8">
        <!-- Table with files and directories -->
        <v-data-table
          hide-default-footer
          :headers="headers"
          :items="issues"
          class="elevation-1"
        >
          <template v-slot:[`item.name`]="{ item }">
            {{ item.name }}
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
    name: 'IssuesList',

    data: () => ({
        headers: [
            {
                text: 'Name',
                align: 'start',
                sortable: false,
                value: 'name',
            },
        ],
        issues: [
            { name: 'Issue 1' },
            { name: 'Issue 2' },
        ],
    }),
};
</script>
