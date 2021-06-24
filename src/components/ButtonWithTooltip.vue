<template>
  <v-btn elevation="2" icon outlined>
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-icon dark v-bind="attrs" v-on="on"> {{ mdi }} </v-icon>
      </template>
      <span>{{ spanText }}</span>
    </v-tooltip>
  </v-btn>
</template>

<script>
export default {
    name: 'ButtonWithTooltip',

    props: {
        mdi: String,
        spanText: String,
    },
};
</script>
