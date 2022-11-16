import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

const routes = [{
        path: '*',
        redirect: '/m'
    },
    {
        path: '/m',
        component: () => import('./pages/main'),
        children: [{
                path: "/m",
                redirect: "/m/home"
            },
            {
                name: 'home',
                path: 'home',
                component: () => import('./pages/home'),
            },
            {
                name: 'cinemas',
                path: 'cinemas',
                component: () => import('./pages/cinemas'),
            },
            {
                name: 'movies',
                path: 'movies',
                component: () => import('./pages/movies')
            }
        ]
    },
    {
        name: '/movie',
        path: '/movie',
        component: () => import('./pages/movie'),
        props(route) {
            return route.query || {}
        }
    },
    {
        name: '/cinema',
        path: '/cinema',
        component: () => import('./pages/cinema'),
        props(route) {
            return route.query || {}
        }
    },
    {
        name: '/seatSelect2D',
        path: '/seatSelect2D',
        component: () => import('./pages/seatSelect2D'),
        props(route) {
            return route.query || {}
        }
    },
    {
        name: '/seatSelect3D',
        path: '/seatSelect3D',
        component: () => import('./pages/seatSelect3D'),
        props(route) {
            return route.query || {}
        }
    },
    {
        name: '/finish',
        path: '/finish',
        component: () => import('./pages/finish'),
    }
];

const router = new Router({
    routes
});

export {
    router
};