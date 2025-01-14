const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_TOKEN = process.env.REACT_APP_API_TOKEN;
const API_URL = process.env.REACT_APP_API_URL;

// Strapi URL ve API Token
const STRAPI_URL = `${API_URL}/api/products`;
const CATEGORIES_URL = `${API_URL}/api/categories`;


// JSON dosyasını oku
const productsFilePath = path.join(__dirname, 'products.json');
const productsData = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));

// Axios Headers
const headers = {
  Authorization: `Bearer ${API_TOKEN}`,
};

// Kategoriyi kontrol et ve ID'yi al veya oluştur
const getCategoryId = async (categoryName) => {
  try {
    console.log(`Kategori kontrol ediliyor: ${categoryName}`);
    const response = await axios.get(
      `${CATEGORIES_URL}?filters[category_name][$eq]=${encodeURIComponent(categoryName)}`,
      { headers }
    );

    if (response.data.data.length > 0) {
      console.log(`Kategori bulundu: ${categoryName}`);
      return response.data.data[0].id; 
    }

    console.log(`Kategori ekleniyor: ${categoryName}`);
    const newCategory = await axios.post(
      CATEGORIES_URL,
      { data: { category_name: categoryName } },
      { headers }
    );
    console.log(`Yeni kategori eklendi: ${categoryName}`);
    return newCategory.data.data.id;
  } catch (error) {
    console.error(`Kategori alınırken veya eklenirken hata oluştu: ${error.message}`);
    throw error;
  }
};

// Ürünleri Strapi'ye ekle veya güncelle
const syncProducts = async () => {
  try {
    for (const product of productsData.products) {
      console.log(`İşleniyor: ${product.product_name}`);

      // 1) Kategori ID'sini al
      const categoryId = await getCategoryId(product.categories.category_name);

      // 2) Kategori relation'ı ayarla (çoklu relation ise [categoryId])
      const updatedProduct = {
        ...product,
        categories: [categoryId],
      };

      // 3) Bu ürün sistemde var mı? => product_name üzerinden arama
      const searchUrl = `${STRAPI_URL}?filters[product_name][$eq]=${encodeURIComponent(product.product_name)}&populate=categories`;
      console.log(`Strapi'ye GET isteği yapılıyor: ${searchUrl}`);
      const existingProductRes = await axios.get(searchUrl, { headers });

      // 4) Eğer ürün bulunduysa -> documentId al => PUT
      if (existingProductRes.data.data.length > 0) {
        // Bulduğumuz ürün
        const foundProduct = existingProductRes.data.data[0];
        const foundDocumentId = foundProduct.documentId; // Örneğin "ywef5gws4h74ifpwn0t2daan"

        console.log(`Ürün sistemde mevcut (documentId: ${foundDocumentId}), Güncelleniyor...`);

        // 5) Güncelle -> PUT /api/products/ywef5gws4h74ifpwn0t2daan
        await axios.put(
          `${STRAPI_URL}/${foundDocumentId}`,
          {
            data: updatedProduct,  // rich text vs. buraya da eklenir
          },
          { headers }
        );
        console.log(`Güncellendi: ${updatedProduct.product_name}`);
      } else {
        // 6) Yoksa -> Yeni ürün ekle
        console.log(`Yeni ürün ekleniyor: ${updatedProduct.product_name}`);
        await axios.post(
          STRAPI_URL,
          {
            data: updatedProduct, // documentId dahil
          },
          { headers }
        );
        console.log(`Eklendi: ${updatedProduct.product_name}`);
      }
    }

    console.log('Ürün senkronizasyonu tamamlandı!');
  } catch (error) {
    console.error('Hata oluştu:', error.response?.data || error.message);
  }
};

syncProducts();
