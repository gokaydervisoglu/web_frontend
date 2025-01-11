import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:1337', // Strapi'nin temel URL'si
});

export default API;
