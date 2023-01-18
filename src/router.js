import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
    {
        path: "/",
        name: "TODO",
        props: true,
        component: () => import('./views/main.vue')
    },
    {
        path: "/chat",
        name: "Chat",
        props: true,
        component: () => import('./views/chat.vue')
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router