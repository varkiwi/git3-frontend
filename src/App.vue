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
        />
      </div>

      <v-spacer></v-spacer>
      <div>
        <!--
          Maybe this button + tooltip can be made as component, where we are able to provide
          the mdi and tolltip text
        -->
        <v-btn
          elevation="2"
          icon
          outlined
        >
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                dark
                v-bind="attrs"
                v-on="on"
              >
                mdi-login
              </v-icon>
            </template>
            <span>Log In</span>
          </v-tooltip>
        </v-btn>
      </div>
    </v-app-bar>

    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>

export default {
    name: 'App',

    data: () => ({
        //
    }),
};
</script>
