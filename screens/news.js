// news.js
import axios from 'axios';
const API_KEY = '439111914bf04333bca407508824f60d'; 

const NEWS_URL = `https://newsapi.org/v2/everything?q=agriculture%20farming%20india&sortBy=publishedAt&language=en&apiKey=${API_KEY}`;

export async function fetchAgriculturalNews() {
  try {
    const response = await fetch(NEWS_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    

    return json.articles.map((article) => ({
      title: article.title,
      description: article.description,
      url: article.url,
      imageUrl: article.urlToImage,
      publishedAt: article.publishedAt,
      source: article.source.name,
    }));
  } catch (error) {
    console.error('Error fetching news:', error.message);
    return [];
  }
}

