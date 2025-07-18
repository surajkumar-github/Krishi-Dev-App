const API_KEY = '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';
const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070'; // Agmarknet daily prices

const URL = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json&limit=10`;

export async function fetchMarketPrices() {
  try {
    const response = await fetch(URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    return data.records.map(record => ({
      commodity: record.commodity,
      state: record.state,
      district: record.district,
      market: record.market,
      variety: record.variety,
      arrival_date: record.arrival_date,
      min_price: record.min_price,
      max_price: record.max_price,
      modal_price: record.modal_price,
      unit_of_price: record.unit_of_price,
    }));
  } catch (err) {
    console.error('Error fetching market prices:', err.message);
    return [];
  }
}
