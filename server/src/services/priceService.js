const AssetCategory = require('../models/AssetCategory');
const Instrument = require('../models/Instrument');
const { defaultInstruments } = require('../data/instrumentsData');

let isSyncInProgress = false;

/**
 * Clean & format stock symbol for Yahoo Finance
 * Indian stocks on NSE/BSE need suffix (e.g. RELIANCE.NS, TCS.NS)
 * US stocks don't need suffix (e.g. AAPL, MSFT)
 */
function formatYahooSymbol(symbol = '', exchange = 'NSE') {
  let s = (symbol || '').trim().toUpperCase();
  if (!s) return '';

  if (s.endsWith('.NS') || s.endsWith('.BO')) return s;

  const ex = (exchange || 'NSE').toUpperCase();
  if (ex === 'BSE') {
    return `${s}.BO`;
  } else if (ex === 'NSE' || ex === 'INDIA') {
    return `${s}.NS`;
  }

  return s;
}

/**
 * Resolve ticker symbol if user only provided holding name or partial name
 */
function resolveStockSymbol(symbol = '', name = '', exchange = 'NSE') {
  let s = (symbol || '').trim().toUpperCase();

  // If symbol is missing or contains spaces (e.g. user entered company name as symbol)
  if (!s || s.includes(' ')) {
    const searchKey = (symbol || name || '').trim().toLowerCase();
    if (searchKey) {
      const match = (defaultInstruments || []).find(
        (inst) =>
          inst.name.toLowerCase().includes(searchKey) ||
          searchKey.includes(inst.name.toLowerCase()) ||
          inst.symbol.toLowerCase() === searchKey
      );
      if (match && match.symbol) {
        return {
          symbol: match.symbol,
          yahooSymbol: formatYahooSymbol(match.symbol, match.exchange || exchange),
          fallbackInstrument: match,
        };
      }
    }
    if (s.includes(' ')) {
      s = s.split(' ')[0].replace(/[^A-Z0-9]/g, '');
    }
  }

  const match = (defaultInstruments || []).find(
    (inst) => inst.symbol.toUpperCase() === s || inst.name.toUpperCase() === s
  );

  return {
    symbol: s,
    yahooSymbol: formatYahooSymbol(s, exchange),
    fallbackInstrument: match || null,
  };
}

/**
 * Fetch Stock / ETF price and daily price change from Yahoo Finance
 * Returns { price, latestPrice, previousClose, change, changePercent, currency }
 */
async function fetchStockPrice(symbol, exchange = 'NSE', name = '') {
  if (!symbol && !name) return null;

  const resolved = resolveStockSymbol(symbol, name, exchange);
  const yahooSymbol = resolved.yahooSymbol;
  if (!yahooSymbol) return null;

  const endpoints = [
    `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=2d`,
    `https://query2.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=2d`,
  ];

  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
  };

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(8000),
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        const meta = data?.chart?.result?.[0]?.meta;
        const rawPrice = meta?.regularMarketPrice || meta?.chartPreviousClose;

        if (rawPrice && typeof rawPrice === 'number' && !isNaN(rawPrice) && rawPrice > 0) {
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
      } else {
        console.warn(`[PriceService] Yahoo Finance returned status ${res.status} for ${yahooSymbol}`);
      }
    } catch (err) {
      console.warn(`[PriceService] Error fetching ${yahooSymbol} from ${url}: ${err.message}`);
    }
  }

  // Fallback 1: If .NS failed, retry with .BO (BSE)
  if (yahooSymbol.endsWith('.NS')) {
    const altSymbol = yahooSymbol.replace(/\.NS$/, '.BO');
    try {
      const altUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${altSymbol}?interval=1d&range=2d`;
      const res = await fetch(altUrl, { signal: AbortSignal.timeout(6000), headers });
      if (res.ok) {
        const data = await res.json();
        const meta = data?.chart?.result?.[0]?.meta;
        const rawPrice = meta?.regularMarketPrice || meta?.chartPreviousClose;
        if (rawPrice && typeof rawPrice === 'number' && rawPrice > 0) {
          const price = parseFloat(rawPrice.toFixed(2));
          const prevClose = meta?.chartPreviousClose ? parseFloat(meta.chartPreviousClose.toFixed(2)) : price;
          return {
            price,
            latestPrice: price,
            previousClose: prevClose,
            change: parseFloat((price - prevClose).toFixed(2)),
            changePercent: prevClose > 0 ? parseFloat((((price - prevClose) / prevClose) * 100).toFixed(2)) : 0,
            currency: meta?.currency || 'INR',
          };
        }
      }
    } catch {
      // secondary fallback failure ignored
    }
  }

  // Fallback 2: Use catalog reference price if external API is blocked or offline
  if (resolved.fallbackInstrument && resolved.fallbackInstrument.latestPrice > 0) {
    const inst = resolved.fallbackInstrument;
    const price = inst.latestPrice;
    const prevClose = inst.previousClose || price;
    console.log(`[PriceService] Using catalog baseline for ${symbol || name}: ₹${price}`);
    return {
      price,
      latestPrice: price,
      previousClose: prevClose,
      change: parseFloat((price - prevClose).toFixed(2)),
      changePercent: prevClose > 0 ? parseFloat((((price - prevClose) / prevClose) * 100).toFixed(2)) : 0,
      currency: 'INR',
      isFallback: true,
    };
  }

  return null;
}

const SCHEME_CODE_MAP = {
  'PPFAS': '122639',
  'INF879O01019': '122639',
  'PARAG PARIKH': '122639',
  'UTINIFTY50': '120716',
  'INF789F01AU6': '120716',
  'UTI NIFTY': '120716',
  'HDFCFLEXI': '118955',
  'INF179K01BE2': '118955',
  'HDFC FLEXI': '118955',
  'QUANTFLEXI': '120847',
  'INF966L01BE3': '120847',
  'QUANT FLEXI': '120847',
  'QUANTSMALL': '120828',
  'INF966L01AA3': '120828',
  'QUANT SMALL': '120828',
  'NIPPONSMALL': '120593',
  'INF204K01T83': '120593',
  'NIPPON INDIA SMALL': '120593',
  'MIRAEELSS': '118834',
  'INF769K01029': '118834',
  'MIRAE ASSET': '118834',
  'SBIBLUE': '119598',
  'INF200K01372': '119598',
  'SBI BLUECHIP': '119598',
  'AXISSMALL': '125354',
  'INF846K01CV7': '125354',
  'AXIS SMALL': '125354',
  'MOTILAL OSWAL NIFTY MIDCAP 150 INDEX FUND - REGULAR': '147621',
  'MOTILAL OSWAL NIFTY MIDCAP 150 INDEX FUND - DIRECT': '147622',
  'MOTILAL OSWAL NIFTY MIDCAP 150': '147622',
  'INF247L01908': '147621',
  'INF247L01896': '147622',
};

/**
 * Fetch Mutual Fund NAV, previous NAV, daily NAV change and date from MFAPI.in (AMFI official feed)
 * Returns { nav, latestNAV, previousNAV, change, changePercent, date, schemeCode, schemeName }
 */
async function fetchMutualFundNAV(schemeName, schemeCode = null) {
  try {
    let targetCode = null;

    // 1. Check direct numeric code
    if (schemeCode && !isNaN(Number(schemeCode)) && Number(schemeCode) > 0) {
      targetCode = String(schemeCode);
    }

    // 2. Check ISIN or symbol in SCHEME_CODE_MAP
    if (!targetCode && schemeCode && SCHEME_CODE_MAP[schemeCode.toUpperCase()]) {
      targetCode = SCHEME_CODE_MAP[schemeCode.toUpperCase()];
    }

    // 3. Check schemeName keywords in SCHEME_CODE_MAP
    if (!targetCode && schemeName) {
      const upperName = schemeName.toUpperCase();
      for (const [key, code] of Object.entries(SCHEME_CODE_MAP)) {
        if (upperName.includes(key)) {
          targetCode = code;
          break;
        }
      }
    }

    // 4. Dynamic Search on MFAPI if targetCode not found yet
    if (!targetCode && schemeName) {
      const cleanName = schemeName
        .replace(/Direct|Regular|Growth|Plan|Scheme|Mutual|Fund|-/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      try {
        const searchRes = await fetch(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(cleanName)}`, {
          signal: AbortSignal.timeout(8000),
        });
        if (searchRes.ok) {
          const searchResults = await searchRes.json();
          if (Array.isArray(searchResults) && searchResults.length > 0) {
            // Prefer Direct Growth plan if available
            const directMatch = searchResults.find(
              (r) =>
                (r.schemeName || '').toLowerCase().includes('direct') &&
                (r.schemeName || '').toLowerCase().includes('growth')
            );
            targetCode = directMatch ? String(directMatch.schemeCode) : String(searchResults[0].schemeCode);
          }
        }
      } catch (searchErr) {
        console.warn(`[PriceService] MFAPI search error for "${cleanName}": ${searchErr.message}`);
      }
    }

    if (targetCode) {
      // Fetch full NAV history to extract today's NAV (data[0]) and previous day's NAV (data[1])
      const navRes = await fetch(`https://api.mfapi.in/mf/${targetCode}`, {
        signal: AbortSignal.timeout(8000),
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
            const changePercent = prevPrevPercent(validLatest, validPrev);

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
      } else {
        console.warn(`[PriceService] MFAPI returned status ${navRes.status} for code ${targetCode}`);
      }
    }
  } catch (err) {
    console.warn(`[PriceService] fetchMutualFundNAV error for "${schemeName}": ${err.message}`);
  }

  // Fallback: Check defaultInstruments catalog
  const fallbackMF = (defaultInstruments || []).find(
    (inst) =>
      (schemeName && inst.name.toLowerCase().includes(schemeName.toLowerCase())) ||
      (schemeCode && inst.symbol.toLowerCase() === schemeCode.toLowerCase()) ||
      (schemeCode && inst.isin === schemeCode)
  );
  if (fallbackMF && fallbackMF.latestNAV > 0) {
    const nav = fallbackMF.latestNAV;
    const prev = fallbackMF.previousClose || nav;
    console.log(`[PriceService] Using catalog baseline for MF "${schemeName}": NAV ${nav}`);
    return {
      price: nav,
      nav,
      latestNAV: nav,
      previousNAV: prev,
      change: parseFloat((nav - prev).toFixed(4)),
      changePercent: prevPrevPercent(nav, prev),
      date: new Date().toISOString().split('T')[0],
      schemeCode: fallbackMF.symbol,
      schemeName: fallbackMF.name,
      currency: 'INR',
      isFallback: true,
    };
  }

  return null;
}

function prevPrevPercent(current, previous) {
  return previous > 0 ? parseFloat((((current - previous) / previous) * 100).toFixed(2)) : 0;
}

const mongoose = require('mongoose');

/**
 * Sync prices for all asset categories in database (Stocks & Mutual Funds)
 */
async function syncAllAssetPrices() {
  if (isSyncInProgress) {
    console.log('[PriceService] Price sync already in progress. Skipping overlapping run.');
    return {
      success: true,
      alreadyRunning: true,
      totalUpdated: 0,
      timestamp: new Date().toISOString(),
      results: [],
    };
  }

  isSyncInProgress = true;
  try {
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
            try {
              if (isStockOrETF) {
                const stockResult = await fetchStockPrice(entry.symbol, entry.exchange || 'NSE', entry.name);

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
                } else {
                  console.warn(`[PriceService] Could not update price for stock: "${entry.name}" (${entry.symbol || 'no ticker'})`);
                }
              } else if (isMF) {
                const mfResult = await fetchMutualFundNAV(entry.name, entry.isin || entry.symbol || null);

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
                } else {
                  console.warn(`[PriceService] Could not update NAV for mutual fund: "${entry.name}"`);
                }
              }
            } catch (holdingErr) {
              console.error(`[PriceService] Error updating holding "${entry.name}":`, holdingErr.message);
            }
          });
        }
      }
    }

    // Process tasks in chunks to be respectful to rate limits
    const CHUNK_SIZE = 5;
    for (let i = 0; i < updateTasks.length; i += CHUNK_SIZE) {
      const chunk = updateTasks.slice(i, i + CHUNK_SIZE);
      await Promise.allSettled(chunk.map((task) => task()));
      if (i + CHUNK_SIZE < updateTasks.length) {
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    // Save modified categories
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
  } finally {
    isSyncInProgress = false;
  }
}

/**
 * Process SIPs automatically with idempotency guard.
 */
async function processDailySips() {
  console.log('[PriceService] Checking daily SIPs...');
  try {
    const today = new Date().getDate();
    const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    let sipCount = 0;

    const categories = await AssetCategory.find({});

    for (const cat of categories) {
      let isModified = false;
      for (const entry of cat.entries) {
        if (entry.isSip && entry.sipDate === today && entry.sipAmount > 0) {
          // Idempotency: Don't process twice in the same month
          if (entry.lastSipProcessedMonth === currentMonth) {
            console.log(`[PriceService] SIP for "${entry.name}" already processed for month ${currentMonth}. Skipping.`);
            continue;
          }

          const nav = entry.latestNAV || entry.averageNAV || entry.latestPrice;
          if (!nav || nav <= 0) {
            console.warn(`[PriceService] Skipping SIP for "${entry.name}": no valid NAV found.`);
            continue;
          }

          const newUnits = entry.sipAmount / nav;
          entry.investedAmount = (entry.investedAmount || 0) + entry.sipAmount;
          entry.units = (entry.units || 0) + newUnits;
          entry.averageNAV = entry.investedAmount / entry.units;
          entry.currentValue = parseFloat((entry.units * nav).toFixed(2));
          entry.lastSipProcessedMonth = currentMonth;

          isModified = true;
          sipCount++;
          console.log(`[PriceService] Processed SIP for ${entry.name}: invested ₹${entry.sipAmount} @ NAV ${nav} -> added ${newUnits.toFixed(4)} units.`);
        }
      }

      if (isModified) {
        await cat.save();
      }
    }

    if (sipCount > 0) {
      console.log(`[PriceService] Processed ${sipCount} SIP(s) today.`);
    }
    return { success: true, processedCount: sipCount };
  } catch (err) {
    console.error('[PriceService] Error processing daily SIPs:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  fetchStockPrice,
  fetchMutualFundNAV,
  syncAllAssetPrices,
  processDailySips,
  formatYahooSymbol,
  resolveStockSymbol,
};
