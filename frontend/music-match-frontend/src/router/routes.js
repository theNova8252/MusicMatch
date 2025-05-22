// src/router/routes.js
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
]

export default routes
