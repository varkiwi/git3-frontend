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

      <div class="d-flex align-center">
        <div
          class="d-flex align-center"
          :class="{smallSearchBar: smallClass, bigSearchBar: !smallClass}"
        >
          <v-text-field
            hide-details
            outlined
            placeholder="Search repository..."
            label="Search repository..."
            dense
            prepend-inner-icon="mdi-magnify"
            single-line
            @focus="increaseSearchBar"
            @focusout="decreaseSearchBar"
            tabindex="0"
          ></v-text-field>
        </div>
      </div>

      <v-spacer></v-spacer>
      <div>
        <button-with-tooltip spanText="Log In" mdi="mdi-login"></button-with-tooltip>
      </div>
    </v-app-bar>

    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>
import ButtonWithTooltip from './components/ButtonWithTooltip.vue';

export default {
    name: 'App',

    components: {
        ButtonWithTooltip,
    },

    data: () => ({
        smallClass: true,
    }),

    methods: {
        increaseSearchBar() {
            this.smallClass = false;
        },
        decreaseSearchBar() {
            this.smallClass = true;
        },
    },
};
</script>

<style scoped>
.smallSearchBar {
  width: 272px;
  max-width:  272px;
}

.bigSearchBar {
  width: 544px;
  max-width: 544px;
}
</style>
