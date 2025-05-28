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
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
  {
    path: '/onboarding',
    component: () => import('pages/OnboardingForm.vue'), 
  },
  {
    path: '/:catchAll(.*)*',
    redirect: '/login',
  },
  {
    path: '/swipe',
    component: () => import('pages/MatchSwipe.vue'),
  },
  {
    path: '/chat/:partnerId',
    component: () => import('pages/ChatPage.vue'), 
    props: false,
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
  }
]

export default routes
