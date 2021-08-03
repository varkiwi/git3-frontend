<template>
  <v-container class="px-md-4 px-lg-5">
    <v-row align="center" justify="center">

      <!-- <v-col cols="2"> -->
      <v-col>
        <div class="d-flex flex-row">
          <!-- Dropdown menu where we can switch the branch -->
          <v-menu offset-y>

            <template v-slot:activator="{ on, attrs }">
              <v-btn dark v-bind="attrs" v-on="on">
                {{ items[model].title }}
              </v-btn>
            </template>

            <v-list>
              <v-list-item-group v-model="model">
                <v-list-item
                  v-for="(item, index) in items"
                  :key="index"
                  link
                >
                  <v-list-item-title>{{ item.title }}</v-list-item-title>
                </v-list-item>
              </v-list-item-group>
            </v-list>

          </v-menu>

          <p class="pt-3">
            <v-icon dark small>
              mdi-source-branch
            </v-icon>
            x branches
          </p>

        </div>
      </v-col>

      <!-- <v-col> -->
        <!-- Displayes the number of active branches -->
        <!-- <p class="pt-3">
          <v-icon dark small>
            mdi-source-branch
          </v-icon>
          x branches
        </p>
      </v-col> -->

      <v-spacer></v-spacer>

      <v-col cols="1">
        <!-- Download button -->
        <v-btn>Download</v-btn>
      </v-col>

    </v-row>
  </v-container>
</template>

<script>

export default {
    name: 'RepositoryCode',

    data: () => ({
        items: [
            { title: 'main' },
            { title: 'branch 1' },
            { title: 'branch 2' },
        ],
        model: 0,
    }),
};
</script>
