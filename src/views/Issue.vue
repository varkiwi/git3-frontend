<template>
  <v-container class="px-md-4 px-lg-5">

    <v-row align="center" justify="center">
        <v-col lg="8">
            <div class="d-flex flex-row">
                <h1>{{ issueNumber }} {{ title }}</h1>
            </div>
        </v-col>
    </v-row>

    <v-row align="center" justify="center">
        <v-col lg="8">
            <div class="d-flex flex-row">
               <v-chip color="green">{{ state }}</v-chip>
            </div>
        </v-col>
    </v-row>

    <v-row align="center" justify="center">
        <v-col lg="8">
            <div class="d-flex flex-row">
               <v-textarea
                outlined
                name="input-7-4"
                label=""
                readonly
                no-resize
                color="white"
                solo
                persistent-hint
                :value="text"
                ></v-textarea>
            </div>
        </v-col>
    </v-row>

  </v-container>
</template>

<script>

export default {
    name: 'Issue',

    components: {},

    data: () => ({
        title: '',
        issueNumber: '',
        state: '',
        text: '',
    }),

    mounted() {
        const data = JSON.parse(localStorage.getItem('issue'));
        console.log('Data', data);
        this.title = data.title.replace(/#\d/, '');
        this.issueNumber = `#${data.issueNumber}`;
        this.state = data.state;
        this.text = data.text;
    },
};
</script>
