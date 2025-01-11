import axios from 'axios';

const API = axios.create({
  baseURL: 'https://webbackend-main.up.railway.app', // Strapi'nin temel URL'si
});

export default API;
