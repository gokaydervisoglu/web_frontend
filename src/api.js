import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // Using environment variable for API URL
});

export default API;
