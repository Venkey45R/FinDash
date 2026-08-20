/**
 * Comprehensive Catalog of Indian Stocks, ETFs, and Mutual Funds
 * Covers Nifty 50, Nifty Next 50, Nifty Midcap 150, Nifty Smallcap 250,
 * major PSU, Defence, Banking, IT, FMCG, Auto, Pharma, Energy, New-Age Tech equities,
 * all major NSE/BSE ETFs (Index, Sector, Commodity, Global, Debt), and top Mutual Funds.
 */

export const INDIAN_STOCKS = [
  // ─── NIFTY 50 & TOP LARGE CAP ───
  { symbol: 'RELIANCE', name: 'Reliance Industries Limited', exchange: 'NSE', sector: 'Energy & Conglomerate', isin: 'INE002A01018', price: 2980.00 },
  { symbol: 'TCS', name: 'Tata Consultancy Services Limited', exchange: 'NSE', sector: 'Information Technology', isin: 'INE467B01029', price: 3890.00 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', exchange: 'NSE', sector: 'Banking & Financials', isin: 'INE040A01034', price: 1645.00 },
  { symbol: 'INFY', name: 'Infosys Limited', exchange: 'NSE', sector: 'Information Technology', isin: 'INE009A01021', price: 1690.00 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Limited', exchange: 'NSE', sector: 'Banking & Financials', isin: 'INE090A01021', price: 1195.00 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Limited', exchange: 'NSE', sector: 'Telecommunications', isin: 'INE397D01024', price: 1460.00 },
  { symbol: 'SBIN', name: 'State Bank of India', exchange: 'NSE', sector: 'Public Sector Banking', isin: 'INE062A01020', price: 830.00 },
  { symbol: 'ITC', name: 'ITC Limited', exchange: 'NSE', sector: 'FMCG & Cigarettes', isin: 'INE154A01025', price: 415.00 },
  { symbol: 'LICI', name: 'Life Insurance Corporation of India', exchange: 'NSE', sector: 'Life Insurance', isin: 'INE115A01026', price: 1040.00 },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Limited', exchange: 'NSE', sector: 'FMCG & Personal Care', isin: 'INE030A01027', price: 2480.00 },
  { symbol: 'LT', name: 'Larsen & Toubro Limited', exchange: 'NSE', sector: 'Capital Goods & Infrastructure', isin: 'INE018A01030', price: 3640.00 },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Limited', exchange: 'NSE', sector: 'Financial Services (NBFC)', isin: 'INE296A01024', price: 6880.00 },
  { symbol: 'HCLTECH', name: 'HCL Technologies Limited', exchange: 'NSE', sector: 'Information Technology', isin: 'INE860A01027', price: 1620.00 },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Limited', exchange: 'NSE', sector: 'Automobile', isin: 'INE585B01010', price: 12450.00 },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Ltd', exchange: 'NSE', sector: 'Pharmaceuticals', isin: 'INE044A01036', price: 1710.00 },
  { symbol: 'ADANIENT', name: 'Adani Enterprises Limited', exchange: 'NSE', sector: 'Commodities & Trading', isin: 'INE423A01024', price: 3120.00 },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Limited', exchange: 'NSE', sector: 'Banking & Financials', isin: 'INE237A01028', price: 1795.00 },
  { symbol: 'TITAN', name: 'Titan Company Limited', exchange: 'NSE', sector: 'Gems, Jewellery & Watches', isin: 'INE280A01028', price: 3480.00 },
  { symbol: 'ONGC', name: 'Oil & Natural Gas Corporation Limited', exchange: 'NSE', sector: 'Oil & Gas Exploration', isin: 'INE213A01029', price: 310.00 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Limited', exchange: 'NSE', sector: 'Automobile & EV', isin: 'INE155A01022', price: 995.00 },
  { symbol: 'NTPC', name: 'NTPC Limited', exchange: 'NSE', sector: 'Power Generation & Utilities', isin: 'INE733E01010', price: 395.00 },
  { symbol: 'AXISBANK', name: 'Axis Bank Limited', exchange: 'NSE', sector: 'Banking & Financials', isin: 'INE238A01034', price: 1180.00 },
  { symbol: 'ADANIPORTS', name: 'Adani Ports & Special Economic Zone Ltd', exchange: 'NSE', sector: 'Port Infrastructure', isin: 'INE742F01042', price: 1480.00 },
  { symbol: 'POWERGRID', name: 'Power Grid Corporation of India Ltd', exchange: 'NSE', sector: 'Power Transmission', isin: 'INE752E01010', price: 330.00 },
  { symbol: 'ASIANPAINT', name: 'Asian Paints Limited', exchange: 'NSE', sector: 'Paints & Decor', isin: 'INE021A01026', price: 2950.00 },
  { symbol: 'COALINDIA', name: 'Coal India Limited', exchange: 'NSE', sector: 'Mining & Coal', isin: 'INE522F01014', price: 510.00 },
  { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Limited', exchange: 'NSE', sector: 'Financial Services & Insurance', isin: 'INE918I01026', price: 1610.00 },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Limited', exchange: 'NSE', sector: 'Cement & Building Materials', isin: 'INE481G01011', price: 11200.00 },
  { symbol: 'WIPRO', name: 'Wipro Limited', exchange: 'NSE', sector: 'Information Technology', isin: 'INE075A01022', price: 515.00 },
  { symbol: 'JSWSTEEL', name: 'JSW Steel Limited', exchange: 'NSE', sector: 'Steel & Metals', isin: 'INE019A01038', price: 920.00 },
  { symbol: 'TATASTEEL', name: 'Tata Steel Limited', exchange: 'NSE', sector: 'Steel & Metals', isin: 'INE081A01020', price: 155.00 },
  { symbol: 'M&M', name: 'Mahindra & Mahindra Limited', exchange: 'NSE', sector: 'Automobile & Tractors', isin: 'INE101A01026', price: 2850.00 },
  { symbol: 'TECHM', name: 'Tech Mahindra Limited', exchange: 'NSE', sector: 'Information Technology', isin: 'INE669C01036', price: 1480.00 },
  { symbol: 'GRASIM', name: 'Grasim Industries Limited', exchange: 'NSE', sector: 'Textiles, Chemicals & Paints', isin: 'INE047A01021', price: 2620.00 },
  { symbol: 'NESTLEIND', name: 'Nestle India Limited', exchange: 'NSE', sector: 'FMCG & Food Products', isin: 'INE239A01024', price: 2490.00 },
  { symbol: 'HINDALCO', name: 'Hindalco Industries Limited', exchange: 'NSE', sector: 'Aluminium & Copper', isin: 'INE038A01020', price: 670.00 },
  { symbol: 'IOC', name: 'Indian Oil Corporation Limited', exchange: 'NSE', sector: 'Refineries & Marketing', isin: 'INE242A01010', price: 168.00 },
  { symbol: 'INDUSINDBK', name: 'IndusInd Bank Limited', exchange: 'NSE', sector: 'Banking & Financials', isin: 'INE095A01012', price: 1410.00 },
  { symbol: 'CIPLA', name: 'Cipla Limited', exchange: 'NSE', sector: 'Pharmaceuticals', isin: 'INE059A01026', price: 1520.00 },
  { symbol: 'DRREDDY', name: "Dr. Reddy's Laboratories Limited", exchange: 'NSE', sector: 'Pharmaceuticals', isin: 'INE089A01023', price: 6850.00 },
  { symbol: 'EICHERMOT', name: 'Eicher Motors Limited (Royal Enfield)', exchange: 'NSE', sector: 'Automobile (2-Wheelers)', isin: 'INE066A01021', price: 4720.00 },
  { symbol: 'BPCL', name: 'Bharat Petroleum Corporation Limited', exchange: 'NSE', sector: 'Refineries & Marketing', isin: 'INE029A01011', price: 345.00 },
  { symbol: 'DIVISLAB', name: "Divi's Laboratories Limited", exchange: 'NSE', sector: 'Pharma & Active Ingredients', isin: 'INE361B01024', price: 4650.00 },
  { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals Enterprise Limited', exchange: 'NSE', sector: 'Healthcare & Hospitals', isin: 'INE437A01024', price: 6540.00 },
  { symbol: 'BRITANNIA', name: 'Britannia Industries Limited', exchange: 'NSE', sector: 'FMCG & Bakery', isin: 'INE216A01030', price: 5680.00 },
  { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp Limited', exchange: 'NSE', sector: 'Automobile (2-Wheelers)', isin: 'INE158A01026', price: 5280.00 },
  { symbol: 'TATACONSUM', name: 'Tata Consumer Products Limited', exchange: 'NSE', sector: 'FMCG & Beverages', isin: 'INE192A01025', price: 1180.00 },
  { symbol: 'SBILIFE', name: 'SBI Life Insurance Company Limited', exchange: 'NSE', sector: 'Life Insurance', isin: 'INE123W01016', price: 1720.00 },
  { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance Company Limited', exchange: 'NSE', sector: 'Life Insurance', isin: 'INE795G01014', price: 715.00 },
  { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto Limited', exchange: 'NSE', sector: 'Automobile (2 & 3 Wheelers)', isin: 'INE917I01010', price: 9800.00 },

  // ─── NIFTY NEXT 50 & MAJOR HIGH-GROWTH EQUITIES ───
  { symbol: 'ZOMATO', name: 'Zomato Limited', exchange: 'NSE', sector: 'Food Delivery & Quick Commerce', isin: 'INE758T01015', price: 260.00 },
  { symbol: 'JIOFIN', name: 'Jio Financial Services Limited', exchange: 'NSE', sector: 'Financial Services & Fintech', isin: 'INE758E01017', price: 325.00 },
  { symbol: 'TRENT', name: 'Trent Limited (Westside & Zudio)', exchange: 'NSE', sector: 'Retail & Fashion', isin: 'INE849A01020', price: 6850.00 },
  { symbol: 'BEL', name: 'Bharat Electronics Limited', exchange: 'NSE', sector: 'Defence & Aerospace Electronics', isin: 'INE263A01024', price: 295.00 },
  { symbol: 'HAL', name: 'Hindustan Aeronautics Limited', exchange: 'NSE', sector: 'Defence & Aircraft Manufacturing', isin: 'INE866I01012', price: 4720.00 },
  { symbol: 'VBL', name: 'Varun Beverages Limited (PepsiCo Bottler)', exchange: 'NSE', sector: 'Beverages & FMCG', isin: 'INE200M01021', price: 1540.00 },
  { symbol: 'DLF', name: 'DLF Limited', exchange: 'NSE', sector: 'Real Estate & Development', isin: 'INE271C01023', price: 840.00 },
  { symbol: 'TATAPOWER', name: 'Tata Power Company Limited', exchange: 'NSE', sector: 'Power Generation & Renewables', isin: 'INE245A01021', price: 420.00 },
  { symbol: 'SIEMENS', name: 'Siemens Limited', exchange: 'NSE', sector: 'Industrial Automation & Power', isin: 'INE003A01024', price: 6720.00 },
  { symbol: 'ABB', name: 'ABB India Limited', exchange: 'NSE', sector: 'Robotics, Automation & Power', isin: 'INE117A01022', price: 7950.00 },
  { symbol: 'PFC', name: 'Power Finance Corporation Limited', exchange: 'NSE', sector: 'Power Sector Financing', isin: 'INE134E01011', price: 520.00 },
  { symbol: 'REC', name: 'REC Limited', exchange: 'NSE', sector: 'Infrastructure & Power Finance', isin: 'INE020B01018', price: 580.00 },
  { symbol: 'IRFC', name: 'Indian Railway Finance Corporation Ltd', exchange: 'NSE', sector: 'Railway Infrastructure Finance', isin: 'INE053F01010', price: 175.00 },
  { symbol: 'RVNL', name: 'Rail Vikas Nigam Limited', exchange: 'NSE', sector: 'Railway Construction & Infra', isin: 'INE415G01027', price: 560.00 },
  { symbol: 'IRCTC', name: 'Indian Railway Catering & Tourism Corp Ltd', exchange: 'NSE', sector: 'Tourism, Ticketing & Catering', isin: 'INE335Y01020', price: 920.00 },
  { symbol: 'POLYCAB', name: 'Polycab India Limited', exchange: 'NSE', sector: 'Wires, Cables & Fast Moving Elec', isin: 'INE455K01017', price: 6580.00 },
  { symbol: 'CHOLAFIN', name: 'Cholamandalam Investment and Finance Co Ltd', exchange: 'NSE', sector: 'Vehicle & Home Finance', isin: 'INE121A01024', price: 1420.00 },
  { symbol: 'SHRIRAMFIN', name: 'Shriram Finance Limited', exchange: 'NSE', sector: 'Commercial Vehicle Financing', isin: 'INE721A01013', price: 3150.00 },
  { symbol: 'VEDL', name: 'Vedanta Limited', exchange: 'NSE', sector: 'Metals & Natural Resources', isin: 'INE205A01025', price: 440.00 },
  { symbol: 'PIDILITIND', name: 'Pidilite Industries Limited (Fevicol)', exchange: 'NSE', sector: 'Adhesives & Specialty Chemicals', isin: 'INE318A01026', price: 3120.00 },
  { symbol: 'HAVELLS', name: 'Havells India Limited', exchange: 'NSE', sector: 'Consumer Electricals & FMEG', isin: 'INE176B01034', price: 1840.00 },
  { symbol: 'GAIL', name: 'GAIL (India) Limited', exchange: 'NSE', sector: 'Natural Gas Transmission', isin: 'INE129A01019', price: 230.00 },
  { symbol: 'DMART', name: 'Avenue Supermarts Limited (DMart)', exchange: 'NSE', sector: 'Retail Supermarket Chain', isin: 'INE192R01011', price: 4850.00 },
  { symbol: 'GODREJCP', name: 'Godrej Consumer Products Limited', exchange: 'NSE', sector: 'FMCG & Household Care', isin: 'INE102D01028', price: 1450.00 },
  { symbol: 'DABUR', name: 'Dabur India Limited', exchange: 'NSE', sector: 'Ayurvedic & FMCG Products', isin: 'INE016A01026', price: 620.00 },
  { symbol: 'MARICO', name: 'Marico Limited (Parachute & Saffola)', exchange: 'NSE', sector: 'FMCG & Edible Oils', isin: 'INE196A01026', price: 660.00 },
  { symbol: 'COLPAL', name: 'Colgate-Palmolive (India) Limited', exchange: 'NSE', sector: 'Oral & Personal Care', isin: 'INE259A01022', price: 3350.00 },
  { symbol: 'BERGEPAINT', name: 'Berger Paints India Limited', exchange: 'NSE', sector: 'Paints & Coatings', isin: 'INE463A01038', price: 580.00 },
  { symbol: 'MOTHERSON', name: 'Samvardhana Motherson International Ltd', exchange: 'NSE', sector: 'Auto Components & Wiring', isin: 'INE775A01035', price: 195.00 },
  { symbol: 'TVSMOTOR', name: 'TVS Motor Company Limited', exchange: 'NSE', sector: 'Automobile (2 & 3 Wheelers)', isin: 'INE494B01023', price: 2680.00 },
  { symbol: 'BOSCHLTD', name: 'Bosch Limited', exchange: 'NSE', sector: 'Auto Ancillaries & Technology', isin: 'INE323A01026', price: 32400.00 },
  { symbol: 'ASHOKLEY', name: 'Ashok Leyland Limited', exchange: 'NSE', sector: 'Commercial Vehicles & Trucks', isin: 'INE214T01019', price: 245.00 },
  { symbol: 'AMBUJACEM', name: 'Ambuja Cements Limited', exchange: 'NSE', sector: 'Cement & Building Materials', isin: 'INE079A01024', price: 630.00 },
  { symbol: 'ACC', name: 'ACC Limited', exchange: 'NSE', sector: 'Cement & Building Materials', isin: 'INE012A01025', price: 2480.00 },
  { symbol: 'SHREECEM', name: 'Shree Cement Limited', exchange: 'NSE', sector: 'Cement & Building Materials', isin: 'INE070A01015', price: 25400.00 },
  { symbol: 'DALBHARAT', name: 'Dalmia Bharat Limited', exchange: 'NSE', sector: 'Cement & Building Materials', isin: 'INE00R701025', price: 1850.00 },
  { symbol: 'LTIM', name: 'LTIMindtree Limited', exchange: 'NSE', sector: 'Information Technology', isin: 'INE214X01020', price: 5650.00 },
  { symbol: 'PERSISTENT', name: 'Persistent Systems Limited', exchange: 'NSE', sector: 'IT Services & Digital Engineering', isin: 'INE262H01013', price: 5120.00 },
  { symbol: 'COFORGE', name: 'Coforge Limited', exchange: 'NSE', sector: 'Information Technology', isin: 'INE591G01017', price: 6800.00 },
  { symbol: 'MPHASIS', name: 'MphasiS Limited', exchange: 'NSE', sector: 'Information Technology', isin: 'INE356A01018', price: 2890.00 },
  { symbol: 'TATAELXSI', name: 'Tata Elxsi Limited', exchange: 'NSE', sector: 'Design & Digital Technology', isin: 'INE670A01012', price: 7450.00 },
  { symbol: 'KPITTECH', name: 'KPIT Technologies Limited', exchange: 'NSE', sector: 'Automotive Software & Mobility', isin: 'INE04I401011', price: 1680.00 },
  { symbol: 'TATATECH', name: 'Tata Technologies Limited', exchange: 'NSE', sector: 'Engineering & R&D Services', isin: 'INE142M01025', price: 980.00 },
  { symbol: 'CYIENT', name: 'Cyient Limited', exchange: 'NSE', sector: 'Engineering & Technology Solutions', isin: 'INE136B01020', price: 1950.00 },
  { symbol: 'SONATSOFTW', name: 'Sonata Software Limited', exchange: 'NSE', sector: 'IT Solutions & Cloud Services', isin: 'INE269A01021', price: 620.00 },

  // ─── DEFENCE, RAILWAYS, INFRASTRUCTURE & PSU ───
  { symbol: 'MAZDOCK', name: 'Mazagon Dock Shipbuilders Limited', exchange: 'NSE', sector: 'Defence Shipbuilding & Submarines', isin: 'INE249Z01012', price: 4420.00 },
  { symbol: 'COCHINSHIP', name: 'Cochin Shipyard Limited', exchange: 'NSE', sector: 'Shipbuilding & Marine Engineering', isin: 'INE704P01017', price: 2150.00 },
  { symbol: 'GRSE', name: 'Garden Reach Shipbuilders & Engineers Ltd', exchange: 'NSE', sector: 'Defence Warship Construction', isin: 'INE382Z01011', price: 2380.00 },
  { symbol: 'BDL', name: 'Bharat Dynamics Limited', exchange: 'NSE', sector: 'Missile Systems & Defence Equipment', isin: 'INE171Z01018', price: 1280.00 },
  { symbol: 'SOLARINDS', name: 'Solar Industries India Limited', exchange: 'NSE', sector: 'Industrial Explosives & Defence Ammo', isin: 'INE343H01029', price: 10450.00 },
  { symbol: 'DATAPATTNS', name: 'Data Patterns (India) Limited', exchange: 'NSE', sector: 'Defence Electronics & Radars', isin: 'INE610M01014', price: 2850.00 },
  { symbol: 'PARAS', name: 'Paras Defence and Space Tech Ltd', exchange: 'NSE', sector: 'Optics & Defence Electronics', isin: 'INE045601015', price: 1120.00 },
  { symbol: 'BHEL', name: 'Bharat Heavy Electricals Limited', exchange: 'NSE', sector: 'Heavy Engineering & Power Equipment', isin: 'INE257A01026', price: 295.00 },
  { symbol: 'SAIL', name: 'Steel Authority of India Limited', exchange: 'NSE', sector: 'Steel Manufacturing (PSU)', isin: 'INE114A01011', price: 135.00 },
  { symbol: 'NMDC', name: 'NMDC Limited', exchange: 'NSE', sector: 'Iron Ore Mining (PSU)', isin: 'INE584A01023', price: 220.00 },
  { symbol: 'NATIONALUM', name: 'National Aluminium Company Limited', exchange: 'NSE', sector: 'Aluminium Mining & Smelting', isin: 'INE139A01034', price: 180.00 },
  { symbol: 'HINDZINC', name: 'Hindustan Zinc Limited', exchange: 'NSE', sector: 'Zinc, Lead & Silver Mining', isin: 'INE267A01025', price: 490.00 },
  { symbol: 'NHPC', name: 'NHPC Limited', exchange: 'NSE', sector: 'Hydroelectric Power Generation', isin: 'INE848E01016', price: 98.00 },
  { symbol: 'SJVN', name: 'SJVN Limited', exchange: 'NSE', sector: 'Hydro & Renewable Power', isin: 'INE002L01015', price: 135.00 },
  { symbol: 'IREDA', name: 'Indian Renewable Energy Development Agency', exchange: 'NSE', sector: 'Green Energy Financing (PSU)', isin: 'INE202E01016', price: 235.00 },
  { symbol: 'RITES', name: 'RITES Limited', exchange: 'NSE', sector: 'Rail Transport Consultancy', isin: 'INE320J01015', price: 340.00 },
  { symbol: 'RAILTEL', name: 'RailTel Corporation of India Limited', exchange: 'NSE', sector: 'Telecom & Broadband for Railways', isin: 'INE731L01019', price: 480.00 },
  { symbol: 'IRCON', name: 'Ircon International Limited', exchange: 'NSE', sector: 'Railway Infrastructure Projects', isin: 'INE962Y01021', price: 245.00 },
  { symbol: 'TITAGARH', name: 'Titagarh Rail Systems Limited', exchange: 'NSE', sector: 'Passenger & Freight Wagons', isin: 'INE615H01020', price: 1420.00 },
  { symbol: 'JWL', name: 'Jupiter Wagons Limited', exchange: 'NSE', sector: 'Railway Wagons & Brake Systems', isin: 'INE209L01016', price: 540.00 },
  { symbol: 'SUZLON', name: 'Suzlon Energy Limited', exchange: 'NSE', sector: 'Wind Turbine & Green Energy', isin: 'INE040H01021', price: 78.00 },
  { symbol: 'INFRATEL', name: 'Indus Towers Limited', exchange: 'NSE', sector: 'Telecom Towers Infrastructure', isin: 'INE121J01017', price: 410.00 },
  { symbol: 'GMRINFRA', name: 'GMR Airports Infrastructure Limited', exchange: 'NSE', sector: 'Airport Operations & Infra', isin: 'INE776C01039', price: 92.00 },

  // ─── BANKING, NBFC, WEALTH & EXCHANGES ───
  { symbol: 'PNB', name: 'Punjab National Bank', exchange: 'NSE', sector: 'Public Sector Banking', isin: 'INE160A01022', price: 118.00 },
  { symbol: 'BANKBARODA', name: 'Bank of Baroda', exchange: 'NSE', sector: 'Public Sector Banking', isin: 'INE028A01039', price: 250.00 },
  { symbol: 'CANBK', name: 'Canara Bank', exchange: 'NSE', sector: 'Public Sector Banking', isin: 'INE476A01022', price: 110.00 },
  { symbol: 'UNIONBANK', name: 'Union Bank of India', exchange: 'NSE', sector: 'Public Sector Banking', isin: 'INE692A01016', price: 125.00 },
  { symbol: 'INDIANB', name: 'Indian Bank', exchange: 'NSE', sector: 'Public Sector Banking', isin: 'INE562A01011', price: 530.00 },
  { symbol: 'IOB', name: 'Indian Overseas Bank', exchange: 'NSE', sector: 'Public Sector Banking', isin: 'INE565A01014', price: 62.00 },
  { symbol: 'FEDERALBNK', name: 'The Federal Bank Limited', exchange: 'NSE', sector: 'Private Sector Banking', isin: 'INE171A01029', price: 195.00 },
  { symbol: 'IDFCFIRSTB', name: 'IDFC First Bank Limited', exchange: 'NSE', sector: 'Private Sector Banking', isin: 'INE092T01019', price: 73.00 },
  { symbol: 'AUBANK', name: 'AU Small Finance Bank Limited', exchange: 'NSE', sector: 'Small Finance Banking', isin: 'INE949L01017', price: 640.00 },
  { symbol: 'BANDHANBNK', name: 'Bandhan Bank Limited', exchange: 'NSE', sector: 'Microfinance & Private Banking', isin: 'INE545U01014', price: 190.00 },
  { symbol: 'YESBANK', name: 'Yes Bank Limited', exchange: 'NSE', sector: 'Private Sector Banking', isin: 'INE528G01035', price: 22.50 },
  { symbol: 'BSE', name: 'BSE Limited (Bombay Stock Exchange)', exchange: 'NSE', sector: 'Financial Markets & Exchanges', isin: 'INE118H01025', price: 3450.00 },
  { symbol: 'CDSL', name: 'Central Depository Services (India) Ltd', exchange: 'NSE', sector: 'Securities Depository Services', isin: 'INE736A01011', price: 1580.00 },
  { symbol: 'MCX', name: 'Multi Commodity Exchange of India Ltd', exchange: 'NSE', sector: 'Commodities Exchange & Derivatives', isin: 'INE745G01035', price: 6200.00 },
  { symbol: 'ANGELONE', name: 'Angel One Limited', exchange: 'NSE', sector: 'Fintech & Retail Broking', isin: 'INE732I01013', price: 2750.00 },
  { symbol: 'MOTILALOFS', name: 'Motilal Oswal Financial Services Ltd', exchange: 'NSE', sector: 'Wealth Management & Broking', isin: 'INE338I01027', price: 890.00 },
  { symbol: 'MUTHOOTFIN', name: 'Muthoot Finance Limited', exchange: 'NSE', sector: 'Gold Loans & Non-Banking Finance', isin: 'INE414G01012', price: 1920.00 },
  { symbol: 'MANAPPURAM', name: 'Manappuram Finance Limited', exchange: 'NSE', sector: 'Gold Loans & Microfinance', isin: 'INE522D01027', price: 195.00 },
  { symbol: 'POONAWALLA', name: 'Poonawalla Fincorp Limited', exchange: 'NSE', sector: 'Digital Lending & NBFC', isin: 'INE511C01022', price: 380.00 },
  { symbol: 'POLICYBZR', name: 'PB Fintech Limited (Policybazaar)', exchange: 'NSE', sector: 'Insurance Fintech Marketplace', isin: 'INE417T01026', price: 1680.00 },
  { symbol: 'PAYTM', name: 'One 97 Communications Ltd (Paytm)', exchange: 'NSE', sector: 'Digital Payments & Fintech', isin: 'INE982J01020', price: 670.00 },
  { symbol: 'NYKAA', name: 'FSN E-Commerce Ventures Ltd (Nykaa)', exchange: 'NSE', sector: 'Beauty, Personal Care & Fashion', isin: 'INE388Y01029', price: 198.00 },
  { symbol: 'DELHIVERY', name: 'Delhivery Limited', exchange: 'NSE', sector: 'E-commerce Logistics & Supply Chain', isin: 'INE148O01028', price: 395.00 },
  { symbol: 'SWIGGY', name: 'Swiggy Limited', exchange: 'NSE', sector: 'Food Delivery & Quick Commerce (Instamart)', isin: 'INE00H001014', price: 480.00 },
  { symbol: 'HYUNDAI', name: 'Hyundai Motor India Limited', exchange: 'NSE', sector: 'Automobile (Passenger Vehicles)', isin: 'INE00G001016', price: 1820.00 },
  { symbol: 'WAAREEENER', name: 'Waaree Energies Limited', exchange: 'NSE', sector: 'Solar PV Modules & Green Energy', isin: 'INE00H001022', price: 3150.00 },
  { symbol: 'PREMIERENE', name: 'Premier Energies Limited', exchange: 'NSE', sector: 'Solar Cells & Renewable Equipment', isin: 'INE00I001013', price: 1180.00 },
  { symbol: 'OLAELEC', name: 'Ola Electric Mobility Limited', exchange: 'NSE', sector: 'Electric 2-Wheelers & EV Battery', isin: 'INE00J001011', price: 82.00 },

  // ─── PHARMACEUTICALS & HEALTHCARE ───
  { symbol: 'MANKIND', name: 'Mankind Pharma Limited', exchange: 'NSE', sector: 'Domestic Pharmaceuticals & OTC', isin: 'INE634S01028', price: 2640.00 },
  { symbol: 'TORNTPHARM', name: 'Torrent Pharmaceuticals Limited', exchange: 'NSE', sector: 'Formulations & Specialty Pharma', isin: 'INE685A01028', price: 3320.00 },
  { symbol: 'LUPIN', name: 'Lupin Limited', exchange: 'NSE', sector: 'Pharmaceuticals & Generics', isin: 'INE326A01037', price: 2180.00 },
  { symbol: 'ALKEM', name: 'Alkem Laboratories Limited', exchange: 'NSE', sector: 'Pharmaceuticals & Formulations', isin: 'INE540L01014', price: 5850.00 },
  { symbol: 'AUROPHARMA', name: 'Aurobindo Pharma Limited', exchange: 'NSE', sector: 'Generics & Active Pharma Ingred.', isin: 'INE406A01037', price: 1480.00 },
  { symbol: 'BIOCON', name: 'Biocon Limited', exchange: 'NSE', sector: 'Biotechnology & Biosimilars', isin: 'INE376G01013', price: 360.00 },
  { symbol: 'GLENMARK', name: 'Glenmark Pharmaceuticals Limited', exchange: 'NSE', sector: 'Dermatology & Respiratory Pharma', isin: 'INE935A01035', price: 1720.00 },
  { symbol: 'IPCALAB', name: 'IPCA Laboratories Limited', exchange: 'NSE', sector: 'Active Ingredients & Formulations', isin: 'INE571A01038', price: 1540.00 },
  { symbol: 'MAXHEALTH', name: 'Max Healthcare Institute Limited', exchange: 'NSE', sector: 'Hospitals & Super Specialty Care', isin: 'INE027H01010', price: 960.00 },
  { symbol: 'FORTIS', name: 'Fortis Healthcare Limited', exchange: 'NSE', sector: 'Hospitals & Healthcare Facilities', isin: 'INE061F01013', price: 610.00 },
  { symbol: 'MEDANTA', name: 'Global Health Limited (Medanta)', exchange: 'NSE', sector: 'Super Specialty Hospitals', isin: 'INE474Q01031', price: 1140.00 },
  { symbol: 'NARAYANA', name: 'Narayana Hrudayalaya Limited', exchange: 'NSE', sector: 'Cardiac & Multispecialty Hospitals', isin: 'INE410P01011', price: 1290.00 },
  { symbol: 'LALPATHLAB', name: 'Dr. Lal PathLabs Limited', exchange: 'NSE', sector: 'Diagnostic & Pathology Labs', isin: 'INE600L01024', price: 3180.00 },
  { symbol: 'METROPOLIS', name: 'Metropolis Healthcare Limited', exchange: 'NSE', sector: 'Clinical Pathology & Diagnostics', isin: 'INE112L01020', price: 2150.00 },

  // ─── CHEMICALS, METALS, PIPES & CAPITAL GOODS ───
  { symbol: 'SRF', name: 'SRF Limited', exchange: 'NSE', sector: 'Fluorochemicals & Specialty Chem', isin: 'INE647A01010', price: 2280.00 },
  { symbol: 'DEEPAKNTR', name: 'Deepak Nitrite Limited', exchange: 'NSE', sector: 'Phenol, Acetone & Organic Chem', isin: 'INE288B01029', price: 2850.00 },
  { symbol: 'PIIND', name: 'PI Industries Limited', exchange: 'NSE', sector: 'Agrochemicals & Custom Synthesis', isin: 'INE603J01030', price: 4480.00 },
  { symbol: 'AARTIIND', name: 'Aarti Industries Limited', exchange: 'NSE', sector: 'Specialty Benzene Chemicals', isin: 'INE769A01020', price: 540.00 },
  { symbol: 'TATACHEM', name: 'Tata Chemicals Limited', exchange: 'NSE', sector: 'Soda Ash, Bicarb & Agrochem', isin: 'INE092A01019', price: 1080.00 },
  { symbol: 'ATUL', name: 'Atul Limited', exchange: 'NSE', sector: 'Dyes, Polymers & Aromatics', isin: 'INE100A01010', price: 7850.00 },
  { symbol: 'CLEAN', name: 'Clean Science and Technology Ltd', exchange: 'NSE', sector: 'Green Catalytic Chemicals', isin: 'INE227W01023', price: 1420.00 },
  { symbol: 'ASTRAL', name: 'Astral Limited', exchange: 'NSE', sector: 'Plumbing Pipes, Fittings & Adhesives', isin: 'INE006I01046', price: 1890.00 },
  { symbol: 'SUPREMEIND', name: 'The Supreme Industries Limited', exchange: 'NSE', sector: 'Plastic Products & Piping Systems', isin: 'INE195A01028', price: 4850.00 },
  { symbol: 'FINPIPE', name: 'Finolex Pipes Limited', exchange: 'NSE', sector: 'PVC Pipes & Fittings', isin: 'INE183A01016', price: 290.00 },
  { symbol: 'KEI', name: 'KEI Industries Limited', exchange: 'NSE', sector: 'Extra High Voltage Cables & Wires', isin: 'INE878B01027', price: 4420.00 },
  { symbol: 'APARINDS', name: 'Apar Industries Limited', exchange: 'NSE', sector: 'Conductors, Transformer Oils & Cables', isin: 'INE372A01015', price: 9800.00 },
  { symbol: 'CGPOWER', name: 'CG Power and Industrial Solutions Ltd', exchange: 'NSE', sector: 'Electrical Motors, Transformers & EV', isin: 'INE067A01029', price: 710.00 },
  { symbol: 'DIXON', name: 'Dixon Technologies (India) Limited', exchange: 'NSE', sector: 'Electronic Manufacturing (EMS)', isin: 'INE935N01020', price: 13200.00 },
  { symbol: 'KAYNES', name: 'Kaynes Technology India Limited', exchange: 'NSE', sector: 'IoT & High Precision EMS', isin: 'INE918Z01012', price: 5400.00 },
  { symbol: 'AMBER', name: 'Amber Enterprises India Limited', exchange: 'NSE', sector: 'HVAC & Air Conditioner OEM', isin: 'INE371P01015', price: 6150.00 },
  { symbol: 'VOLTAS', name: 'Voltas Limited (Tata Group)', exchange: 'NSE', sector: 'Air Conditioners & Cooling Systems', isin: 'INE226A01021', price: 1780.00 },
  { symbol: 'BLUESTARCO', name: 'Blue Star Limited', exchange: 'NSE', sector: 'Commercial Refrigeration & ACs', isin: 'INE472A01039', price: 1820.00 },
  { symbol: 'CUMMINSIND', name: 'Cummins India Limited', exchange: 'NSE', sector: 'Diesel Engines & Gensets', isin: 'INE298A01020', price: 3750.00 },
  { symbol: 'THERMAX', name: 'Thermax Limited', exchange: 'NSE', sector: 'Boilers, Green Energy & Environment', isin: 'INE152A01029', price: 4950.00 },
  { symbol: 'AIAENG', name: 'AIA Engineering Limited', exchange: 'NSE', sector: 'High Chrome Grinding Media', isin: 'INE212H01026', price: 4280.00 },
  { symbol: 'ESCORTS', name: 'Escorts Kubota Limited', exchange: 'NSE', sector: 'Tractors & Agri Machinery', isin: 'INE042A01014', price: 3820.00 },

  // ─── CONSUMER, JEWELLERY, REALTY, TEXTILES & FOOTWEAR ───
  { symbol: 'KALYANKJIL', name: 'Kalyan Jewellers India Limited', exchange: 'NSE', sector: 'Gold & Diamond Retail', isin: 'INE303R01014', price: 685.00 },
  { symbol: 'SENCO', name: 'Senco Gold Limited', exchange: 'NSE', sector: 'Jewellery & Bridal Retail', isin: 'INE602W01019', price: 1120.00 },
  { symbol: 'MANYAVAR', name: 'Vedant Fashions Limited (Manyavar)', exchange: 'NSE', sector: 'Indian Celebration Wear', isin: 'INE825V01034', price: 1080.00 },
  { symbol: 'PAGEIND', name: 'Page Industries Limited (Jockey India)', exchange: 'NSE', sector: 'Innerwear & Athleisure', isin: 'INE761H01022', price: 43200.00 },
  { symbol: 'BATAINDIA', name: 'Bata India Limited', exchange: 'NSE', sector: 'Footwear & Accessories', isin: 'INE176A01028', price: 1380.00 },
  { symbol: 'METROBRAND', name: 'Metro Brands Limited (Mochi, Crocs)', exchange: 'NSE', sector: 'Premium Footwear Retail', isin: 'INE317I01021', price: 1240.00 },
  { symbol: 'RELAXO', name: 'Relaxo Footwears Limited (Sparx)', exchange: 'NSE', sector: 'Footwear & Slippers', isin: 'INE131B01039', price: 790.00 },
  { symbol: 'JUBLFOOD', name: "Jubilant FoodWorks Ltd (Domino's Pizza)", exchange: 'NSE', sector: 'Quick Service Restaurants (QSR)', isin: 'INE797F01012', price: 590.00 },
  { symbol: 'DEVYANI', name: 'Devyani International Ltd (KFC, Pizza Hut)', exchange: 'NSE', sector: 'Quick Service Restaurants', isin: 'INE872J01023', price: 175.00 },
  { symbol: 'WESTLIFE', name: 'Westlife Foodworld Ltd (McDonalds West/South)', exchange: 'NSE', sector: 'Quick Service Restaurants', isin: 'INE274F01020', price: 780.00 },
  { symbol: 'BIKAJI', name: 'Bikaji Foods International Limited', exchange: 'NSE', sector: 'Ethnic Indian Snacks & Sweets', isin: 'INE00E101023', price: 820.00 },
  { symbol: 'GODREJPROP', name: 'Godrej Properties Limited', exchange: 'NSE', sector: 'Residential & Commercial Realty', isin: 'INE484J01027', price: 2950.00 },
  { symbol: 'OBEROIRLTY', name: 'Oberoi Realty Limited', exchange: 'NSE', sector: 'Luxury Real Estate Development', isin: 'INE093I01010', price: 1850.00 },
  { symbol: 'PHOENIXLTD', name: 'The Phoenix Mills Limited', exchange: 'NSE', sector: 'Retail Malls & Commercial Realty', isin: 'INE211B01039', price: 1780.00 },
  { symbol: 'PRESTIGE', name: 'Prestige Estates Projects Limited', exchange: 'NSE', sector: 'South India Real Estate', isin: 'INE811K01011', price: 1650.00 },
  { symbol: 'BRIGADE', name: 'Brigade Enterprises Limited', exchange: 'NSE', sector: 'Residential & Commercial Realty', isin: 'INE791I01019', price: 1220.00 },
  { symbol: 'SOBHA', name: 'Sobha Limited', exchange: 'NSE', sector: 'Contractual Construction & Realty', isin: 'INE671H01015', price: 1750.00 },
  { symbol: 'PVRINOX', name: 'PVR INOX Limited', exchange: 'NSE', sector: 'Multiplex Cinema Exhibition', isin: 'INE191H01014', price: 1490.00 },
  { symbol: 'NAUKRI', name: 'Info Edge (India) Limited (Naukri/99acres)', exchange: 'NSE', sector: 'Internet Classifieds & Recruitment', isin: 'INE663F01024', price: 7800.00 },
  { symbol: 'MAPMYINDIA', name: 'C.E. Info Systems Ltd (MapmyIndia)', exchange: 'NSE', sector: 'Geospatial Software & Navigation', isin: 'INE0BV301023', price: 1980.00 },
  { symbol: 'REDINGTON', name: 'Redington Limited', exchange: 'NSE', sector: 'IT Hardware & Telecom Distribution', isin: 'INE891D01026', price: 210.00 },
  { symbol: 'TATACOMM', name: 'Tata Communications Limited', exchange: 'NSE', sector: 'Global Cloud & Network Connectivity', isin: 'INE151A01013', price: 1940.00 },
];

export const INDIAN_ETFS = [
  // ─── EQUITY BENCHMARK & INDEX ETFS ───
  { symbol: 'NIFTYBEES', name: 'Nippon India ETF Nifty 50 BeES', exchange: 'NSE', assetClass: 'EQUITY', sector: 'Nifty 50 Large Cap Index', isin: 'INF204KB14I2', price: 272.50 },
  { symbol: 'BANKBEES', name: 'Nippon India ETF Nifty Bank BeES', exchange: 'NSE', assetClass: 'EQUITY', sector: 'Banking Sector Index', isin: 'INF204KB14J0', price: 518.00 },
  { symbol: 'JUNIORBEES', name: 'Nippon India ETF Nifty Next 50 Junior BeES', exchange: 'NSE', assetClass: 'EQUITY', sector: 'Nifty Next 50 Large Cap', isin: 'INF204KB14K8', price: 795.00 },
  { symbol: 'MID150BEES', name: 'Nippon India ETF Nifty Midcap 150', exchange: 'NSE', assetClass: 'EQUITY', sector: 'Midcap 150 Index', isin: 'INF204KB16H9', price: 23.40 },
  { symbol: 'HDFCSML250', name: 'HDFC Nifty Smallcap 250 ETF', exchange: 'NSE', assetClass: 'EQUITY', sector: 'Smallcap 250 Index', isin: 'INF179KC1CY6', price: 154.00 },
  { symbol: 'SETFNIF50', name: 'SBI Nifty 50 ETF', exchange: 'NSE', assetClass: 'EQUITY', sector: 'Nifty 50 Benchmark', isin: 'INF200KA1UT1', price: 274.00 },
  { symbol: 'SETFNIFBK', name: 'SBI Nifty Bank ETF', exchange: 'NSE', assetClass: 'EQUITY', sector: 'Nifty Bank Benchmark', isin: 'INF200KA1UV7', price: 516.50 },
  { symbol: 'ICICINIFTY', name: 'ICICI Prudential Nifty 50 ETF', exchange: 'NSE', assetClass: 'EQUITY', sector: 'Nifty 50 Benchmark', isin: 'INF109K011R0', price: 273.20 },
  { symbol: 'ICICINF100', name: 'ICICI Prudential Nifty 100 ETF', exchange: 'NSE', assetClass: 'EQUITY', sector: 'Top 100 Large Cap', isin: 'INF109K012T4', price: 280.00 },
  { symbol: 'HDFCNIF100', name: 'HDFC Nifty 100 ETF', exchange: 'NSE', assetClass: 'EQUITY', sector: 'Nifty 100 Large Cap', isin: 'INF179KC1BZ5', price: 278.00 },
  { symbol: 'KOTAKNIFTY', name: 'Kotak Nifty 50 ETF', exchange: 'NSE', assetClass: 'EQUITY', sector: 'Nifty 50 Benchmark', isin: 'INF174K011E4', price: 272.80 },
  { symbol: 'KOTAKBKETF', name: 'Kotak Nifty Bank ETF', exchange: 'NSE', assetClass: 'EQUITY', sector: 'Nifty Bank Index', isin: 'INF174K012E2', price: 517.20 },
  { symbol: 'AXISNIFTY', name: 'Axis Nifty 50 ETF', exchange: 'NSE', assetClass: 'EQUITY', sector: 'Nifty 50 Benchmark', isin: 'INF846K01W69', price: 273.00 },
  { symbol: 'UTINIFTETF', name: 'UTI Nifty 50 ETF', exchange: 'NSE', assetClass: 'EQUITY', sector: 'Nifty 50 Benchmark', isin: 'INF789FB1X58', price: 272.90 },
  { symbol: 'UTISXN50', name: 'UTI Nifty Next 50 ETF', exchange: 'NSE', assetClass: 'EQUITY', sector: 'Nifty Next 50', isin: 'INF789FB1X66', price: 792.00 },
  { symbol: 'MOM50', name: 'Motilal Oswal Nifty 200 Momentum 30 ETF', exchange: 'NSE', assetClass: 'EQUITY', sector: 'Smart Beta Momentum', isin: 'INF247L01AH4', price: 74.50 },
  { symbol: 'NV20BEES', name: 'Nippon India ETF Nifty 50 Value 20 BeES', exchange: 'NSE', assetClass: 'EQUITY', sector: 'Smart Beta Value', isin: 'INF204KB18H5', price: 142.00 },
  { symbol: 'ALPL30', name: 'ABSL Nifty Alpha Low Volatility 30 ETF', exchange: 'NSE', assetClass: 'EQUITY', sector: 'Smart Beta Low Volatility', isin: 'INF209KB11K5', price: 48.20 },
  { symbol: 'LOWVOLIETF', name: 'ICICI Prudential Nifty 100 Low Vol 30 ETF', exchange: 'NSE', assetClass: 'EQUITY', sector: 'Low Volatility Smart Beta', isin: 'INF109K016T5', price: 21.80 },

  // ─── SECTORAL & THEMATIC ETFS ───
  { symbol: 'ITBEES', name: 'Nippon India ETF Nifty IT BeES', exchange: 'NSE', assetClass: 'EQUITY', sector: 'Information Technology', isin: 'INF204KB19I1', price: 43.10 },
  { symbol: 'AUTOBEES', name: 'Nippon India ETF Nifty Auto BeES', exchange: 'NSE', assetClass: 'EQUITY', sector: 'Automobile Sector', isin: 'INF204KB14Q5', price: 264.00 },
  { symbol: 'PHARMABEES', name: 'Nippon India ETF Nifty Pharma BeES', exchange: 'NSE', assetClass: 'EQUITY', sector: 'Pharmaceuticals & Healthcare', isin: 'INF204KB15Q2', price: 22.80 },
  { symbol: 'FMCGBEES', name: 'Nippon India ETF Nifty FMCG', exchange: 'NSE', assetClass: 'EQUITY', sector: 'Fast Moving Consumer Goods', isin: 'INF204KB16Q0', price: 58.50 },
  { symbol: 'CPSEETF', name: 'CPSE ETF (Central Public Sector Enterprises)', exchange: 'NSE', assetClass: 'EQUITY', sector: 'PSU Navratna Equities', isin: 'INF583R01083', price: 96.20 },
  { symbol: 'BHARAT22', name: 'ICICI Prudential Bharat 22 ETF', exchange: 'NSE', assetClass: 'EQUITY', sector: 'Government 22 Bluechips', isin: 'INF109K015Y7', price: 108.50 },
  { symbol: 'PSUBNKBEES', name: 'Nippon India ETF Nifty PSU Bank BeES', exchange: 'NSE', assetClass: 'EQUITY', sector: 'Public Sector Banking', isin: 'INF204KB14M4', price: 78.40 },
  { symbol: 'PVTBANIETF', name: 'ICICI Prudential Nifty Private Bank ETF', exchange: 'NSE', assetClass: 'EQUITY', sector: 'Private Sector Banking', isin: 'INF109KB1942', price: 28.50 },
  { symbol: 'INFRABEES', name: 'Nippon India ETF Nifty Infrastructure BeES', exchange: 'NSE', assetClass: 'EQUITY', sector: 'Infrastructure & Capital Goods', isin: 'INF204KB13M6', price: 895.00 },
  { symbol: 'CONSUMBEES', name: 'Nippon India ETF Nifty India Consumption', exchange: 'NSE', assetClass: 'EQUITY', sector: 'Consumption & Retail Themes', isin: 'INF204KB17H7', price: 114.00 },
  { symbol: 'HDFCBSEDEF', name: 'HDFC Nifty India Defence ETF', exchange: 'NSE', assetClass: 'EQUITY', sector: 'Defence & Aerospace', isin: 'INF179KC1EB8', price: 112.00 },
  { symbol: 'MOTILALDEF', name: 'Motilal Oswal Nifty India Defence Index ETF', exchange: 'NSE', assetClass: 'EQUITY', sector: 'Defence & Security Manufacturing', isin: 'INF247L01BU8', price: 98.50 },
  { symbol: 'COMMOIETF', name: 'ICICI Prudential Nifty Commodities ETF', exchange: 'NSE', assetClass: 'EQUITY', sector: 'Metals & Commodities', isin: 'INF109KB1504', price: 42.10 },
  { symbol: 'ENERGYBEES', name: 'Nippon India ETF Nifty Energy', exchange: 'NSE', assetClass: 'EQUITY', sector: 'Oil, Gas & Power Utilities', isin: 'INF204KB18Q6', price: 412.00 },

  // ─── COMMODITY ETFS (GOLD & SILVER) ───
  { symbol: 'GOLDBEES', name: 'Nippon India ETF Gold BeES', exchange: 'NSE', assetClass: 'COMMODITIES', sector: 'Physical Gold Bullion (99.5%)', isin: 'INF204KB17I5', price: 66.80 },
  { symbol: 'SILVERBEES', name: 'Nippon India ETF Silver BeES', exchange: 'NSE', assetClass: 'COMMODITIES', sector: 'Physical Silver Bullion (99.9%)', isin: 'INF204KB17J3', price: 91.20 },
  { symbol: 'HDFCGOLD', name: 'HDFC Gold ETF', exchange: 'NSE', assetClass: 'COMMODITIES', sector: 'Physical Gold Bullion', isin: 'INF179K01CN1', price: 66.50 },
  { symbol: 'HDFCSILVER', name: 'HDFC Silver ETF', exchange: 'NSE', assetClass: 'COMMODITIES', sector: 'Physical Silver Bullion', isin: 'INF179KC1CT6', price: 90.80 },
  { symbol: 'ICICIGOLD', name: 'ICICI Prudential Gold ETF', exchange: 'NSE', assetClass: 'COMMODITIES', sector: 'Physical Gold Bullion', isin: 'INF109K012X6', price: 66.70 },
  { symbol: 'ICICISILV', name: 'ICICI Prudential Silver ETF', exchange: 'NSE', assetClass: 'COMMODITIES', sector: 'Physical Silver Bullion', isin: 'INF109KB1231', price: 91.00 },
  { symbol: 'SETFGOLD', name: 'SBI Gold ETF', exchange: 'NSE', assetClass: 'COMMODITIES', sector: 'Physical Gold Bullion', isin: 'INF200K01075', price: 66.60 },
  { symbol: 'AXISGOLD', name: 'Axis Gold ETF', exchange: 'NSE', assetClass: 'COMMODITIES', sector: 'Physical Gold Bullion', isin: 'INF846K01347', price: 66.55 },
  { symbol: 'KOTAKGOLD', name: 'Kotak Gold ETF', exchange: 'NSE', assetClass: 'COMMODITIES', sector: 'Physical Gold Bullion', isin: 'INF174K011F1', price: 66.75 },
  { symbol: 'NIPPONSILV', name: 'Nippon India Silver ETF', exchange: 'NSE', assetClass: 'COMMODITIES', sector: 'Physical Silver Bullion', isin: 'INF204KB18I3', price: 91.10 },

  // ─── GLOBAL & INTERNATIONAL ETFS ───
  { symbol: 'MON100', name: 'Motilal Oswal Nasdaq 100 ETF', exchange: 'NSE', assetClass: 'EQUITY', sector: 'US Tech (Nasdaq 100 Index)', isin: 'INF247L01031', price: 168.50 },
  { symbol: 'MAFANG', name: 'Mirae Asset NYSE FANG+ ETF', exchange: 'NSE', assetClass: 'EQUITY', sector: 'Mega Tech (Apple, Nvidia, Google)', isin: 'INF769K01HR4', price: 104.00 },
  { symbol: 'MASPTOP50', name: 'Mirae Asset S&P 500 Top 50 ETF', exchange: 'NSE', assetClass: 'EQUITY', sector: 'US S&P 500 Bluechips', isin: 'INF769K01HT0', price: 46.50 },
  { symbol: 'HDFCNASDAQ', name: 'HDFC Developed World & US Tech ETF', exchange: 'NSE', assetClass: 'EQUITY', sector: 'Global Developed Markets', isin: 'INF179KC1DR8', price: 34.00 },

  // ─── CASH, LIQUID & G-SEC DEBT ETFS ───
  { symbol: 'LIQUIDBEES', name: 'Nippon India ETF Liquid BeES (Daily Dividend)', exchange: 'NSE', assetClass: 'CASH', sector: 'Overnight Collateralized Cash', isin: 'INF204KB14L6', price: 1000.00 },
  { symbol: 'LIQUIDCASE', name: 'Zerodha Nifty 1D Rate Liquid ETF', exchange: 'NSE', assetClass: 'CASH', sector: 'Overnight Liquid Rate Growth', isin: 'INF0Q5H01018', price: 108.50 },
  { symbol: 'ICICILIQ', name: 'ICICI Prudential Liquid ETF', exchange: 'NSE', assetClass: 'CASH', sector: 'Money Market Overnight Cash', isin: 'INF109KB1421', price: 1000.00 },
  { symbol: 'GSEC10YEAR', name: 'Nippon India ETF Nifty 8-13 yr G-Sec', exchange: 'NSE', assetClass: 'DEBT', sector: 'Government of India Sovereign Bonds', isin: 'INF204KB15I9', price: 104.50 },
  { symbol: 'GSEC5YEAR', name: 'Nippon India ETF Nifty 5 yr Benchmark G-Sec', exchange: 'NSE', assetClass: 'DEBT', sector: '5 Year Sovereign G-Sec', isin: 'INF204KB16I7', price: 54.20 },
  { symbol: 'SETF10GILT', name: 'SBI ETF 10 Year Gilt', exchange: 'NSE', assetClass: 'DEBT', sector: '10 Year Sovereign Benchmark', isin: 'INF200KA1VC7', price: 105.80 },
  { symbol: 'BHARATB30', name: 'Edelweiss Bharat Bond ETF - April 2030', exchange: 'NSE', assetClass: 'DEBT', sector: 'AAA PSU Corporate Bond Yield', isin: 'INF754K01EN3', price: 1280.00 },
  { symbol: 'BHARATB31', name: 'Edelweiss Bharat Bond ETF - April 2031', exchange: 'NSE', assetClass: 'DEBT', sector: 'AAA PSU Sovereign Yield Target', isin: 'INF754K01ES2', price: 1220.00 },
  { symbol: 'BHARATB32', name: 'Edelweiss Bharat Bond ETF - April 2032', exchange: 'NSE', assetClass: 'DEBT', sector: 'AAA PSU Sovereign Yield Target', isin: 'INF754K01EX2', price: 1160.00 },
];

export const INDIAN_MUTUAL_FUNDS = [
  // ─── INDEX FUNDS ───
  { symbol: 'UTINIFTY50', name: 'UTI Nifty 50 Index Fund', exchange: 'NSE', plan: 'Direct · Growth', sector: 'Index Large Cap', isin: 'INF789F01AU6', nav: 168.45 },
  { symbol: 'ICICINIFTY', name: 'ICICI Prudential Nifty 50 Index Fund', exchange: 'NSE', plan: 'Direct · Growth', sector: 'Index Large Cap', isin: 'INF109K01P57', nav: 245.10 },
  { symbol: 'HDFCNIF50', name: 'HDFC Index Fund - Nifty 50 Plan', exchange: 'NSE', plan: 'Direct · Growth', sector: 'Index Large Cap', isin: 'INF179K01VP1', nav: 228.40 },
  { symbol: 'NAVINIFTY50', name: 'Navi Nifty 50 Index Fund', exchange: 'NSE', plan: 'Direct · Growth', sector: 'Ultra Low Expense Index', isin: 'INF955L01GW1', nav: 16.80 },
  { symbol: 'UTINN50', name: 'UTI Nifty Next 50 Index Fund', exchange: 'NSE', plan: 'Direct · Growth', sector: 'Next 50 Large Cap Index', isin: 'INF789FB1U44', nav: 74.20 },
  { symbol: 'MOTNIFMID150', name: 'Motilal Oswal Nifty Midcap 150 Index Fund', exchange: 'NSE', plan: 'Direct · Growth', sector: 'Index Midcap 150', isin: 'INF247L01896', nav: 28.50 },

  // ─── FLEXI CAP & MULTI CAP FUNDS ───
  { symbol: 'PPFAS', name: 'Parag Parikh Flexi Cap Fund', exchange: 'NSE', plan: 'Direct · Growth', sector: 'Flexi Cap (Indian + Global)', isin: 'INF879O01019', nav: 75.82 },
  { symbol: 'HDFCFLEXI', name: 'HDFC Flexi Cap Fund', exchange: 'NSE', plan: 'Direct · Growth', sector: 'Flexi Cap Equity', isin: 'INF179K01BE2', nav: 1860.20 },
  { symbol: 'QUANTFLEXI', name: 'Quant Flexi Cap Fund', exchange: 'NSE', plan: 'Direct · Growth', sector: 'Dynamic Active Momentum', isin: 'INF966L01BE3', nav: 104.50 },
  { symbol: 'KOTAKFLEXI', name: 'Kotak Flexicap Fund', exchange: 'NSE', plan: 'Direct · Growth', sector: 'Flexi Cap Equity', isin: 'INF174K01LS2', nav: 88.40 },
  { symbol: 'JM_FLEXICAP', name: 'JM Flexicap Fund', exchange: 'NSE', plan: 'Direct · Growth', sector: 'High Alpha Flexi Cap', isin: 'INF192K01CY6', nav: 125.60 },

  // ─── SMALL CAP & MID CAP FUNDS ───
  { symbol: 'QUANTSMALL', name: 'Quant Small Cap Fund', exchange: 'NSE', plan: 'Direct · Growth', sector: 'Active Small Cap', isin: 'INF966L01AA3', nav: 268.40 },
  { symbol: 'NIPPONSMALL', name: 'Nippon India Small Cap Fund', exchange: 'NSE', plan: 'Direct · Growth', sector: 'Small Cap Equity', isin: 'INF204K01T83', nav: 174.80 },
  { symbol: 'AXISSMALL', name: 'Axis Small Cap Fund', exchange: 'NSE', plan: 'Direct · Growth', sector: 'Quality Small Cap', isin: 'INF846K01CV7', nav: 106.20 },
  { symbol: 'TATASMALL', name: 'Tata Small Cap Fund', exchange: 'NSE', plan: 'Direct · Growth', sector: 'Emerging Small Cap', isin: 'INF277K01777', nav: 42.80 },
  { symbol: 'HDFCMIDCAP', name: 'HDFC Mid-Cap Opportunities Fund', exchange: 'NSE', plan: 'Direct · Growth', sector: 'Mid Cap Equity', isin: 'INF179K01BF9', nav: 198.50 },
  { symbol: 'MOTILALMID', name: 'Motilal Oswal Midcap Fund', exchange: 'NSE', plan: 'Direct · Growth', sector: 'Mid Cap High Growth', isin: 'INF247L01288', nav: 98.40 },
  { symbol: 'KOTAKEMERG', name: 'Kotak Emerging Equity Fund', exchange: 'NSE', plan: 'Direct · Growth', sector: 'Mid Cap Equity', isin: 'INF174K01334', nav: 124.60 },

  // ─── LARGE CAP & ELSS TAX SAVER FUNDS ───
  { symbol: 'MIRAEELSS', name: 'Mirae Asset Large Cap Fund', exchange: 'NSE', plan: 'Direct · Growth', sector: 'Large Cap Bluechips', isin: 'INF769K01029', nav: 114.20 },
  { symbol: 'SBIBLUE', name: 'SBI Bluechip Fund', exchange: 'NSE', plan: 'Direct · Growth', sector: 'Large Cap Bluechips', isin: 'INF200K01372', nav: 99.80 },
  { symbol: 'MIRAE_ELSS', name: 'Mirae Asset ELSS Tax Saver Fund', exchange: 'NSE', plan: 'Direct · Growth', sector: 'ELSS Tax Saver (80C)', isin: 'INF769K01409', nav: 52.60 },
  { symbol: 'QUANT_ELSS', name: 'Quant ELSS Tax Saver Fund', exchange: 'NSE', plan: 'Direct · Growth', sector: 'ELSS Tax Saver (80C)', isin: 'INF966L01AB1', nav: 395.00 },
  { symbol: 'BANDHANELSS', name: 'Bandhan ELSS Tax Saver Fund', exchange: 'NSE', plan: 'Direct · Growth', sector: 'ELSS Tax Saver (80C)', isin: 'INF194K01584', nav: 142.10 },
];

const _STOCKS_POOL = INDIAN_STOCKS.map((s) => ({ ...s, type: 'STOCK', subCategory: 'STOCKS', _searchString: `${s.symbol} ${s.name} ${s.sector}`.toLowerCase() }));
const _ETFS_POOL = INDIAN_ETFS.map((e) => ({ ...e, type: 'ETF', subCategory: 'ETFS', _searchString: `${e.symbol} ${e.name} ${e.sector}`.toLowerCase() }));
const _MFS_POOL = INDIAN_MUTUAL_FUNDS.map((m) => ({ ...m, type: 'MUTUAL_FUND', subCategory: 'MUTUAL_FUNDS', _searchString: `${m.symbol} ${m.name} ${m.sector}`.toLowerCase() }));
const _ALL_POOL = [..._STOCKS_POOL, ..._ETFS_POOL, ..._MFS_POOL];

/**
 * Fast search utility for stocks, ETFs, and mutual funds
 */
export const searchCatalog = (query = '', type = 'ALL') => {
  const cleanQ = query.trim().toLowerCase();

  let pool = _ALL_POOL;
  if (type === 'STOCK' || type === 'STOCKS') {
    pool = _STOCKS_POOL;
  } else if (type === 'ETF' || type === 'ETFS') {
    pool = _ETFS_POOL;
  } else if (type === 'MUTUAL_FUND' || type === 'MUTUAL_FUNDS') {
    pool = _MFS_POOL;
  }

  if (!cleanQ) {
    return pool.slice(0, 50);
  }

  // Fast single-pass filter with scoring
  const results = [];
  for (let i = 0; i < pool.length; i++) {
    const item = pool[i];
    const symLower = item.symbol.toLowerCase();
    
    let score = 0;
    if (symLower === cleanQ) score = 100;
    else if (symLower.startsWith(cleanQ)) score = 50;
    else if (item.name.toLowerCase().includes(cleanQ)) score = 25;
    else if (item.sector && item.sector.toLowerCase().includes(cleanQ)) score = 10;
    
    if (score > 0) {
      results.push({ item, score });
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 60)
    .map(r => r.item);
};
