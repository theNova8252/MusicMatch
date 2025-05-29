// src/router/routes.js
import ChatList from 'pages/ChatList.vue';
import ChatPage from 'pages/ChatPage.vue';

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
  },
  {
    path: '/dashboard',
    component: () => import('pages/DashboardPage.vue'),
  },
  {
    path: '/onboarding',
    component: () => import('pages/OnboardingForm.vue'),
  },
  {
    path: '/swipe',
    name: 'MatchSwipe',
    component: () => import('pages/MatchSwipe.vue'),
  },
  {
    path: '/chats',
    name: 'ChatList',
    component: ChatList,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/chat/:partnerId',
    name: 'ChatPage',
    component: ChatPage,
    props: true,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
