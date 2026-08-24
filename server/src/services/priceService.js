const AssetCategory = require('../models/AssetCategory');
const Instrument = require('../models/Instrument');

/**
 * Clean & format stock symbol for Yahoo Finance
 * Indian stocks on NSE/BSE need suffix (e.g. RELIANCE.NS, TCS.NS)
 * US stocks don't need suffix (e.g. AAPL, MSFT)
 */
function formatYahooSymbol(symbol = '', exchange = 'NSE') {
  let s = symbol.trim().toUpperCase();
  if (!s) return '';

  if (s.endsWith('.NS') || s.endsWith('.BO')) return s;

  if (exchange.toUpperCase() === 'BSE') {
    return `${s}.BO`;
  } else if (exchange.toUpperCase() === 'NSE' || exchange.toUpperCase() === 'INDIA') {
    return `${s}.NS`;
  }

  return s;
}

/**
 * Fetch Stock / ETF price and daily price change from Yahoo Finance
 * Returns { price, latestPrice, previousClose, change, changePercent, currency }
 */
async function fetchStockPrice(symbol, exchange = 'NSE') {
  if (!symbol) return null;
  const yahooSymbol = formatYahooSymbol(symbol, exchange);

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=2d`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(3500),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      if (yahooSymbol.endsWith('.NS')) {
        const rawSymbol = symbol.trim().toUpperCase();
        const fallbackUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${rawSymbol}?interval=1d&range=2d`;
        const fbRes = await fetch(fallbackUrl, {
          signal: AbortSignal.timeout(3000),
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        });
        if (fbRes.ok) {
          const fbData = await fbRes.json();
          const meta = fbData?.chart?.result?.[0]?.meta;
          const rawPrice = meta?.regularMarketPrice || meta?.chartPreviousClose;
          if (rawPrice && typeof rawPrice === 'number') {
            const price = parseFloat(rawPrice.toFixed(2));
            const prevClose = meta?.chartPreviousClose ? parseFloat(meta.chartPreviousClose.toFixed(2)) : price;
            const change = parseFloat((price - prevClose).toFixed(2));
            const changePercent = prevClose > 0 ? parseFloat((((price - prevClose) / prevClose) * 100).toFixed(2)) : 0;
            return {
              price,
              latestPrice: price,
              previousClose: prevClose,
              change,
              changePercent,
              currency: meta?.currency || 'INR',
            };
          }
        }
      }
      return null;
    }

    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    const rawPrice = meta?.regularMarketPrice || meta?.chartPreviousClose;

    if (rawPrice && typeof rawPrice === 'number') {
      const price = parseFloat(rawPrice.toFixed(2));
      const prevClose = meta?.chartPreviousClose ? parseFloat(meta.chartPreviousClose.toFixed(2)) : price;
      const change = parseFloat((price - prevClose).toFixed(2));
      const changePercent = prevClose > 0 ? parseFloat((((price - prevClose) / prevClose) * 100).toFixed(2)) : 0;
      return {
        price,
        latestPrice: price,
        previousClose: prevClose,
        change,
        changePercent,
        currency: meta?.currency || 'INR',
      };
    }
    return null;
  } catch (err) {
    return null;
  }
}

const SCHEME_CODE_MAP = {
  'PPFAS': '122639',
  'INF879O01019': '122639',
  'UTINIFTY50': '120716',
  'INF789F01AU6': '120716',
  'HDFCFLEXI': '118955',
  'INF179K01BE2': '118955',
  'QUANTFLEXI': '120847',
  'INF966L01BE3': '120847',
  'QUANTSMALL': '120828',
  'INF966L01AA3': '120828',
  'NIPPONSMALL': '120593',
  'INF204K01T83': '120593',
  'MIRAEELSS': '118834',
  'INF769K01029': '118834',
  'SBIBLUE': '119598',
  'INF200K01372': '119598',
  'AXISSMALL': '125354',
  'INF846K01CV7': '125354',
  'MOTILAL OSWAL NIFTY MIDCAP 150': '147621',
  'INF247L01908': '147621',
};

/**
 * Fetch Mutual Fund NAV, previous NAV, daily NAV change and date from MFAPI.in (AMFI official feed)
 * Returns { nav, latestNAV, previousNAV, change, changePercent, date, schemeCode, schemeName }
 */
async function fetchMutualFundNAV(schemeName, schemeCode = null) {
  try {
    let targetCode = null;

    // Check direct numeric code
    if (schemeCode && !isNaN(Number(schemeCode)) && Number(schemeCode) > 0) {
      targetCode = String(schemeCode);
    }

    // Check ISIN or symbol in SCHEME_CODE_MAP
    if (!targetCode && schemeCode && SCHEME_CODE_MAP[schemeCode.toUpperCase()]) {
      targetCode = SCHEME_CODE_MAP[schemeCode.toUpperCase()];
    }

    // Check schemeName keywords in SCHEME_CODE_MAP
    if (!targetCode && schemeName) {
      const upperName = schemeName.toUpperCase();
      for (const [key, code] of Object.entries(SCHEME_CODE_MAP)) {
        if (upperName.includes(key)) {
          targetCode = code;
          break;
        }
      }
    }

    // Dynamic Search on MFAPI if targetCode not found yet
    if (!targetCode && schemeName) {
      const cleanName = schemeName
        .replace(/Direct|Regular|Growth|Plan|Scheme|Mutual|Fund|-/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const searchRes = await fetch(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(cleanName)}`, {
        signal: AbortSignal.timeout(3500),
      });
      if (searchRes.ok) {
        const searchResults = await searchRes.json();
        if (Array.isArray(searchResults) && searchResults.length > 0) {
          // Prefer Direct Plan if available
          const directMatch = searchResults.find((r) =>
            (r.schemeName || '').toLowerCase().includes('direct') && (r.schemeName || '').toLowerCase().includes('growth')
          );
          targetCode = directMatch ? String(directMatch.schemeCode) : String(searchResults[0].schemeCode);
        }
      }
    }

    if (!targetCode) return null;

    // Fetch full NAV history to extract today's NAV (data[0]) and previous day's NAV (data[1])
    const navRes = await fetch(`https://api.mfapi.in/mf/${targetCode}`, {
      signal: AbortSignal.timeout(4000),
    });

    if (navRes.ok) {
      const navData = await navRes.json();
      const dataSeries = navData?.data;
      if (Array.isArray(dataSeries) && dataSeries.length > 0) {
        const latestEntry = dataSeries[0];
        const prevEntry = dataSeries.length > 1 ? dataSeries[1] : latestEntry;

        const latestNAV = parseFloat(latestEntry.nav);
        const prevNAV = parseFloat(prevEntry.nav);

        if (!isNaN(latestNAV) && latestNAV > 0) {
          const validLatest = parseFloat(latestNAV.toFixed(4));
          const validPrev = !isNaN(prevNAV) && prevNAV > 0 ? parseFloat(prevNAV.toFixed(4)) : validLatest;
          const change = parseFloat((validLatest - validPrev).toFixed(4));
          const changePercent = validPrev > 0 ? parseFloat((((validLatest - validPrev) / validPrev) * 100).toFixed(2)) : 0;

          return {
            price: validLatest,
            nav: validLatest,
            latestNAV: validLatest,
            previousNAV: validPrev,
            change,
            changePercent,
            date: latestEntry.date || new Date().toISOString().split('T')[0],
            schemeCode: targetCode,
            schemeName: navData?.meta?.scheme_name || schemeName,
            currency: 'INR',
          };
        }
      }
    }
    return null;
  } catch (err) {
    return null;
  }
}

const mongoose = require('mongoose');

/**
 * Sync prices for all asset categories in database (Stocks & Mutual Funds)
 */
async function syncAllAssetPrices() {
  if (mongoose.connection.readyState !== 1) {
    console.warn('[PriceService] Database is not connected (readyState !== 1). Skipping DB price sync.');
    return {
      success: false,
      totalUpdated: 0,
      dbOffline: true,
      timestamp: new Date().toISOString(),
      results: [],
    };
  }

  console.log('[PriceService] Starting asset price synchronization for Stocks & Mutual Funds...');
  let categories = [];
  try {
    categories = await AssetCategory.find({});
  } catch (e) {
    console.warn('[PriceService] DB find failed:', e.message);
    return {
      success: false,
      totalUpdated: 0,
      dbOffline: true,
      timestamp: new Date().toISOString(),
      results: [],
    };
  }

  let totalUpdated = 0;
  const syncResults = [];
  const modifiedCategories = new Set();
  
  // 1. Collect all update tasks
  const updateTasks = [];

  for (const category of categories) {
    for (const entry of (category.entries || [])) {
      const sub = entry.subCategory || 'OTHER';

      const isStockOrETF =
        sub === 'STOCKS' ||
        sub === 'ETFS' ||
        (sub === 'OTHER' && entry.quantity > 0 && entry.averageBuyPrice > 0 && !(entry.units > 0 && entry.averageNAV > 0));

      const isMF =
        sub === 'MUTUAL_FUNDS' ||
        (sub === 'OTHER' && entry.units > 0 && entry.averageNAV > 0);

      if ((isStockOrETF && entry.quantity > 0) || (isMF && entry.units > 0)) {
        updateTasks.push(async () => {
          if (isStockOrETF) {
            const symbolToLookup = entry.symbol || entry.name;
            const stockResult = await fetchStockPrice(symbolToLookup, entry.exchange || 'NSE');

            if (stockResult && stockResult.price > 0) {
              const oldVal = entry.currentValue || entry.investedAmount;
              const newVal = parseFloat((entry.quantity * stockResult.price).toFixed(2));

              entry.latestPrice = stockResult.price;
              entry.currentPrice = stockResult.price;
              entry.previousClose = stockResult.previousClose;
              entry.dailyChange = stockResult.change;
              entry.dailyChangePercent = stockResult.changePercent;
              entry.currentValue = newVal;
              entry.lastPriceUpdated = new Date();
              entry.valuationType = 'MARKET';
              
              modifiedCategories.add(category);
              totalUpdated++;

              syncResults.push({
                name: entry.name,
                symbol: entry.symbol,
                type: 'STOCK/ETF',
                oldValue: oldVal,
                newValue: newVal,
                price: stockResult.price,
                previousClose: stockResult.previousClose,
                dailyChange: stockResult.change,
                dailyChangePercent: stockResult.changePercent,
                dayGainLoss: parseFloat((entry.quantity * stockResult.change).toFixed(2)),
              });
            }
          } else if (isMF) {
            const mfResult = await fetchMutualFundNAV(entry.name, entry.isin || null);

            if (mfResult && mfResult.nav > 0) {
              const oldVal = entry.currentValue || entry.investedAmount;
              const newVal = parseFloat((entry.units * mfResult.nav).toFixed(2));

              entry.latestNAV = mfResult.nav;
              entry.previousNAV = mfResult.previousNAV;
              entry.dailyChange = mfResult.change;
              entry.dailyChangePercent = mfResult.changePercent;
              entry.navDate = mfResult.date;
              entry.currentValue = newVal;
              entry.lastPriceUpdated = new Date();
              entry.valuationType = 'MARKET';
              
              modifiedCategories.add(category);
              totalUpdated++;

              syncResults.push({
                name: entry.name,
                type: 'MUTUAL_FUND',
                oldValue: oldVal,
                newValue: newVal,
                nav: mfResult.nav,
                previousNAV: mfResult.previousNAV,
                dailyChange: mfResult.change,
                dailyChangePercent: mfResult.changePercent,
                navDate: mfResult.date,
                dayGainLoss: parseFloat((entry.units * mfResult.change).toFixed(2)),
              });
            }
          }
        });
      }
    }
  }

  // 2. Process tasks in chunks to avoid overwhelming APIs
  const CHUNK_SIZE = 10;
  for (let i = 0; i < updateTasks.length; i += CHUNK_SIZE) {
    const chunk = updateTasks.slice(i, i + CHUNK_SIZE);
    await Promise.allSettled(chunk.map(task => task()));
  }

  // 3. Save modified categories
  for (const category of modifiedCategories) {
    try {
      await category.save();
    } catch (saveErr) {
      console.warn('[PriceService] Failed to save category:', saveErr.message);
    }
  }

  console.log(`[PriceService] Price sync completed! Updated ${totalUpdated} holdings.`);
  return {
    success: true,
    totalUpdated,
    timestamp: new Date().toISOString(),
    results: syncResults,
  };
}

module.exports = {
  fetchStockPrice,
  fetchMutualFundNAV,
  syncAllAssetPrices,
};

