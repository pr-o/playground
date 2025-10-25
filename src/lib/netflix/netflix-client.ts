'use client';

import Axios from 'axios';

export const netflixApiClient = Axios.create({
  baseURL: '/api/apps/netflix',
  timeout: 10000,
});
