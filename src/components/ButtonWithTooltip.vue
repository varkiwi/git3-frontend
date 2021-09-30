<template>
  <v-btn
    elevation="2"
    :icon="mdi !== undefined"
    :rounded="!mdi"
    outlined
    @click='emitClickEvent'
  >
    <v-tooltip bottom v-if="mdi">
      <template v-slot:activator="{ on, attrs }">
        <v-icon dark v-bind="attrs" v-on="on"> {{ mdi }} </v-icon>
      </template>
      <span>{{ spanText }}</span>
    </v-tooltip>
    <template v-else>
        {{ spanText }}
    </template>
  </v-btn>
</template>

<script>
export default {
    name: 'ButtonWithTooltip',

    props: {
        mdi: String,
        spanText: String,
    },

    methods: {
        emitClickEvent() {
            this.$emit('click');
        },
    },
};
</script>
