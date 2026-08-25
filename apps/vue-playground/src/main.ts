import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query';
import { createApp } from 'vue';

import App from './App.vue';
import './style.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

createApp(App).use(VueQueryPlugin, { queryClient }).mount('#app');
