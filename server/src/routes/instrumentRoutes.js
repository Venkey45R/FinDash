const express = require('express');
const router = express.Router();
const Instrument = require('../models/Instrument');
const { defaultInstruments } = require('../data/instrumentsData');

/**
 * Ensure default catalog is populated if database collection is empty or needs refresh.
 * Cached in memory so it only runs once per server lifetime (fixes #8).
 */
let _seedCompleted = false;
const ensureInstrumentsSeed = async () => {
  if (_seedCompleted) return;
  const count = await Instrument.countDocuments({});
  if (count < defaultInstruments.length) {
    // Upsert / Seed all default instruments
    for (const inst of defaultInstruments) {
      await Instrument.findOneAndUpdate(
        { symbol: inst.symbol, type: inst.type },
        { $set: inst },
        { upsert: true, new: true }
      );
    }
    console.log(`Synced ${defaultInstruments.length} market instruments into database.`);
  }
  _seedCompleted = true;
};

/**
 * GET /api/instruments/all — Return all instruments or by type
 */
router.get('/all', async (req, res) => {
  try {
    await ensureInstrumentsSeed();
    const { type } = req.query;
    const filter = {};
    if (type) filter.type = type.toUpperCase();
    const instruments = await Instrument.find(filter).sort({ symbol: 1 });
    res.json(instruments);
  } catch (error) {
    console.error('Error fetching all instruments:', error.message);
    res.status(500).json({ error: 'Server error fetching instruments' });
  }
});

/**
 * GET /api/instruments/search
 * Query params:
 *   q: search term (name, symbol, sector, or isin)
 *   type: STOCK | MUTUAL_FUND | ETF | OTHER (optional filter)
 *
 * Searches local DB first, then falls back to Yahoo Finance search API
 * for stocks not in the catalog (e.g. small/midcap, recently listed).
 */
router.get('/search', async (req, res) => {
  try {
    const { q = '', type } = req.query;
    const trimmedQuery = q.trim();

    // Auto-seed/sync if needed
    await ensureInstrumentsSeed();

    const filter = {};
    if (type && type !== 'ALL') {
      filter.type = type.toUpperCase();
    }

    if (trimmedQuery) {
      const regex = new RegExp(trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { symbol: regex },
        { name: regex },
        { sector: regex },
        { isin: regex },
        { plan: regex },
      ];
    }

    let instruments = await Instrument.find(filter)
      .limit(60)
      .sort({ symbol: 1 });

    // Prioritize exact / starts-with symbol matches
    if (trimmedQuery && instruments.length > 0) {
      const upperQ = trimmedQuery.toUpperCase();
      instruments = instruments.sort((a, b) => {
        const aSym = (a.symbol || '').toUpperCase();
        const bSym = (b.symbol || '').toUpperCase();
        if (aSym === upperQ) return -1;
        if (bSym === upperQ) return 1;
        if (aSym.startsWith(upperQ) && !bSym.startsWith(upperQ)) return -1;
        if (!aSym.startsWith(upperQ) && bSym.startsWith(upperQ)) return 1;
        return a.name.localeCompare(b.name);
      });
    }

    // If local DB has fewer than 10 results and we have a query, try Yahoo Finance search
    if (trimmedQuery && trimmedQuery.length >= 2 && instruments.length < 10) {
      try {
        const yahooResults = await searchYahooFinance(trimmedQuery);
        if (yahooResults.length > 0) {
          // Merge: deduplicate by symbol
          const existingSymbols = new Set(instruments.map(i => (i.symbol || '').toUpperCase()));
          const newResults = yahooResults.filter(yr => !existingSymbols.has((yr.symbol || '').toUpperCase()));
          instruments = [...instruments, ...newResults];

          // Persist newly discovered instruments to DB in background (don't block response)
          persistDiscoveredInstruments(newResults).catch(() => {});
        }
      } catch (err) {
        console.warn('[Instruments] Yahoo search fallback failed:', err.message);
      }
    }

    res.json(instruments);
  } catch (error) {
    console.error('Error searching instruments:', error.message);
    res.status(500).json({ error: 'Server error searching instruments' });
  }
});

/**
 * Search Yahoo Finance for Indian stocks/ETFs by query.
 * Returns normalized instrument-like objects.
 */
async function searchYahooFinance(query) {
  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=20&newsCount=0&listsCount=0&lang=en-IN&region=IN`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(4000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/json',
      },
    });

    if (!res.ok) return [];

    const data = await res.json();
    const quotes = data?.quotes || [];

    // Filter to Indian equities (NSE/BSE) and ETFs only
    return quotes
      .filter(q => {
        const ex = (q.exchange || '').toUpperCase();
        const sym = (q.symbol || '');
        const quoteType = (q.quoteType || '').toUpperCase();
        // Indian stocks end with .NS or .BO, or exchange is NSI/BSE/NSE
        return (
          (sym.endsWith('.NS') || sym.endsWith('.BO') || ex === 'NSI' || ex === 'BSE' || ex === 'NSE') &&
          (quoteType === 'EQUITY' || quoteType === 'ETF')
        );
      })
      .map(q => {
        // Strip .NS / .BO suffix for clean symbol
        let cleanSymbol = (q.symbol || '').replace(/\.(NS|BO)$/i, '').toUpperCase();
        const exchange = (q.symbol || '').endsWith('.BO') ? 'BSE' : 'NSE';
        const isETF = (q.quoteType || '').toUpperCase() === 'ETF';

        return {
          type: isETF ? 'ETF' : 'STOCK',
          subCategory: isETF ? 'ETFS' : 'STOCKS',
          assetClass: 'EQUITY',
          symbol: cleanSymbol,
          name: q.longname || q.shortname || cleanSymbol,
          exchange: exchange,
          sector: q.industry || q.sector || '',
          isin: '',
          _isLiveResult: true, // flag for frontend to know this came from live search
        };
      });
  } catch (err) {
    console.warn('[Yahoo Search] Error:', err.message);
    return [];
  }
}

/**
 * Persist newly discovered instruments to the database for future fast lookups.
 */
async function persistDiscoveredInstruments(instruments) {
  for (const inst of instruments) {
    try {
      await Instrument.findOneAndUpdate(
        { symbol: inst.symbol, type: inst.type },
        {
          $set: {
            type: inst.type,
            subCategory: inst.subCategory,
            assetClass: inst.assetClass,
            symbol: inst.symbol,
            name: inst.name,
            exchange: inst.exchange,
            sector: inst.sector,
          },
        },
        { upsert: true, new: true }
      );
    } catch {
      // ignore duplicate key errors
    }
  }
}

const { fetchStockPrice, fetchMutualFundNAV } = require('../services/priceService');

/**
 * GET /api/instruments/live-price
 * Query params: symbol, type, exchange, name
 */
router.get('/live-price', async (req, res) => {
  try {
    const { symbol = '', type = '', exchange = 'NSE', name = '' } = req.query;

    if (type === 'MUTUAL_FUND' || name.toLowerCase().includes('fund') || name.toLowerCase().includes('direct') || name.toLowerCase().includes('regular')) {
      const mfData = await fetchMutualFundNAV(name || symbol, symbol);
      if (mfData && mfData.nav > 0) {
        return res.json({
          success: true,
          price: mfData.nav,
          nav: mfData.nav,
          latestNAV: mfData.latestNAV,
          previousNAV: mfData.previousNAV,
          change: mfData.change,
          changePercent: mfData.changePercent,
          date: mfData.date,
          schemeName: mfData.schemeName,
          type: 'MUTUAL_FUND',
          currency: 'INR',
        });
      }
    }

    if (symbol || name) {
      const stockData = await fetchStockPrice(symbol || name, exchange);
      if (stockData && stockData.price > 0) {
        return res.json({
          success: true,
          price: stockData.price,
          latestPrice: stockData.latestPrice,
          previousClose: stockData.previousClose,
          change: stockData.change,
          changePercent: stockData.changePercent,
          type: type || 'STOCK',
          currency: 'INR',
        });
      }
    }

    res.json({ success: false, price: null });
  } catch (error) {
    console.error('Error fetching live price:', error.message);
    res.status(500).json({ error: 'Failed to fetch live price' });
  }
});

/**
 * GET /api/instruments/:id — Get instrument details
 */
router.get('/:id', async (req, res) => {
  try {
    const instrument = await Instrument.findById(req.params.id);
    if (!instrument) {
      return res.status(404).json({ error: 'Instrument not found' });
    }
    res.json(instrument);
  } catch (error) {
    console.error('Error fetching instrument:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = { router, defaultInstruments };

