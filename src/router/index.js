import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Repository from '../views/Repository.vue';

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
        // component: Repository,
    },
    {
        path: '/:userAddress(0x[a-fA-F0-9]{40})/:repositoryName',
        name: 'Repository',
        component: Repository,
    },
    {
        path: '/:userAddress(0x[a-fA-F0-9]{40})/:repositoryName/:path',
        name: 'Path',
        component: Repository,
    },
    {
        path: '/:userAddress(0x[a-fA-F0-9]{40})/:repositoryName/:file',
        name: 'File',
        component: Repository,
    },
    {
        path: '/about',
        name: 'About',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
    },
];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes,
});

export default router;
