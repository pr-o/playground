'use client';

import Axios from 'axios';

export const netflixApiClient = Axios.create({
  baseURL: '/api/clones/netflix',
  timeout: 10000,
});
