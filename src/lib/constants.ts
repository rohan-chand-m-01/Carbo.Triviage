// Production constants - all values configurable via environment variables

export const CURRENCY = {
  DEFAULT: process.env.DEFAULT_CURRENCY || 'EUR',
  SYMBOLS: {
    EUR: 'EUR',
    USD: 'USD',
    GBP: 'GBP'
  }
} as const

export const CBAM = {
  DEFAULT_HS_CODE: process.env.CBAM_DEFAULT_HS_CODE || '000000',
  CARBON_PRICE_THRESHOLDS: {
    HIGH_EMISSIONS: parseInt(process.env.CBAM_HIGH_EMISSIONS_THRESHOLD || '10000'),
    DEFAULT_PRICE: parseFloat(process.env.CBAM_DEFAULT_CARBON_PRICE || '5'),
    HIGH_EMISSIONS_PRICE: parseFloat(process.env.CBAM_HIGH_EMISSIONS_PRICE || '25')
  },
  QUANTITY_DEFAULT: parseInt(process.env.CBAM_DEFAULT_QUANTITY || '1'),
  UNIT: process.env.CBAM_UNIT || 'tCO2e'
} as const

export const EMISSIONS = {
  UNITS: {
    TCO2E: 'tCO2e',
    KTC02E: 'ktCO2e',
    GCO2_KWH: 'gCO2/kWh'
  },
  SCOPES: {
    SCOPE_1: 1,
    SCOPE_2: 2,
    SCOPE_3: 3
  },
  CATEGORIES: {
    PURCHASED_GOODS: 'purchased_goods',
    IMPORTED_GOODS: 'imported_goods',
    TRANSPORT: 'transport'
  }
} as const

export const AI = {
  MODELS: {
    GEMINI_FLASH: process.env.GEMINI_FLASH_MODEL || 'gemini-1.5-flash-latest',
    EMBEDDING: process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004'
  },
  LIMITS: {
    MAX_TOKENS: parseInt(process.env.AI_MAX_TOKENS || '1000'),
    TEMPERATURE: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
    CHUNK_SIZE: parseInt(process.env.AI_CHUNK_SIZE || '800'),
    CHUNK_OVERLAP: parseInt(process.env.AI_CHUNK_OVERLAP || '150')
  },
  RATE_LIMITS: {
    FREE_TIER: parseInt(process.env.AI_FREE_TIER_LIMIT || '50'),
    PRO_TIER: parseInt(process.env.AI_PRO_TIER_LIMIT || '500'),
    ENTERPRISE_TIER: parseInt(process.env.AI_ENTERPRISE_TIER_LIMIT || '999999')
  }
} as const

export const API = {
  RATE_LIMITS: {
    GLOBAL: parseInt(process.env.API_GLOBAL_RATE_LIMIT || '1000'),
    PER_ORG: parseInt(process.env.API_PER_ORG_RATE_LIMIT || '100')
  },
  CACHE_TTL: {
    SHORT: parseInt(process.env.CACHE_SHORT_TTL || '300'), // 5 minutes
    MEDIUM: parseInt(process.env.CACHE_MEDIUM_TTL || '3600'), // 1 hour
    LONG: parseInt(process.env.CACHE_LONG_TTL || '86400') // 24 hours
  },
  SEEN_ALERT_DAYS: parseInt(process.env.SEEN_ALERT_DAYS || '30')
} as const

export const EXTERNAL_APIS = {
  ELECTRICITY_MAPS: {
    BASE_URL: process.env.ELECTRICITY_MAPS_API_BASE || 'https://api.electricitymap.org/v3',
    API_KEY: process.env.ELECTRICITY_MAPS_API_KEY || '',
    RATE_LIMIT: parseInt(process.env.ELECTRICITY_MAPS_RATE_LIMIT || '10000') // 10,000 calls/month
  },
  ENTSO_E: {
    BASE_URL: process.env.ENTSOE_API_BASE || 'https://web-api.tp.entsoe.eu/api',
    API_KEY: process.env.ENTSOE_API_KEY || '',
    RATE_LIMIT: parseInt(process.env.ENTSOE_RATE_LIMIT || '1000') // 1,000 calls/hour
  },
  EIA: {
    BASE_URL: process.env.EIA_API_BASE || 'https://api.eia.gov/v2',
    API_KEY: process.env.EIA_API_KEY || '',
    RATE_LIMIT: parseInt(process.env.EIA_RATE_LIMIT || '1000') // 1,000 calls/hour
  },
  UN_COMTRADE: {
    BASE_URL: process.env.UN_COMTRADE_API_BASE || 'https://comtradeapi.un.org/public/v1/getMBS',
    API_KEY: process.env.UN_COMTRADE_API_KEY || '',
    RATE_LIMIT: parseInt(process.env.UN_COMTRADE_RATE_LIMIT || '10000') // 10,000 queries/month
  },
  WORLD_BANK: {
    BASE_URL: process.env.WORLD_BANK_API_BASE || 'https://api.worldbank.org/v2',
    RATE_LIMIT: parseInt(process.env.WORLD_BANK_RATE_LIMIT || '1000') // 1,000 calls/hour
  },
  EMBER: {
    BASE_URL: process.env.EMBER_API_BASE || 'https://ember-climate.org/data',
    API_KEY: process.env.EMBER_API_KEY || '',
    RATE_LIMIT: parseInt(process.env.EMBER_RATE_LIMIT || '1000') // 1,000 calls/hour
  }
} as const

export const SUBSCRIPTION = {
  TIERS: {
    FREE: 'FREE',
    PRO: 'PRO',
    ENTERPRISE: 'ENTERPRISE',
    AUDITOR: 'AUDITOR'
  },
  FEATURES: {
    AI_QUERIES: {
      FREE: 50,
      PRO: 500,
      ENTERPRISE: 999999
    },
    API_CALLS: {
      FREE: 1000,
      PRO: 10000,
      ENTERPRISE: 100000
    }
  }
} as const

export const REGULATIONS = {
  CBAM_PHASES: {
    TRANSITIONAL_START: new Date(process.env.CBAM_TRANSITIONAL_START || '2023-10-01'),
    TRANSITIONAL_END: new Date(process.env.CBAM_TRANSITIONAL_END || '2025-12-31'),
    DEFINITIVE_START: new Date(process.env.CBAM_DEFINITIVE_START || '2026-01-01')
  },
  SECTORS: {
    IRON_STEEL: process.env.CBAM_SECTOR_IRON_STEEL || 'iron_and_steel',
    ALUMINUM: process.env.CBAM_SECTOR_ALUMINUM || 'aluminum',
    CEMENT: process.env.CBAM_SECTOR_CEMENT || 'cement',
    FERTILIZERS: process.env.CBAM_SECTOR_FERTILIZERS || 'fertilizers',
    ELECTRICITY: process.env.CBAM_SECTOR_ELECTRICITY || 'electricity',
    HYDROGEN: process.env.CBAM_SECTOR_HYDROGEN || 'hydrogen',
    CHEMICALS: process.env.CBAM_SECTOR_CHEMICALS || 'chemicals'
  }
} as const

export const VALIDATION = {
  HS_CODE_LENGTH: parseInt(process.env.VALIDATION_HS_CODE_LENGTH || '6'),
  ISO_COUNTRY_LENGTH: parseInt(process.env.VALIDATION_ISO_COUNTRY_LENGTH || '2'),
  MAX_PERIOD_LENGTH: parseInt(process.env.VALIDATION_MAX_PERIOD_LENGTH || '10')
} as const

export const CONVERSION_FACTORS = {
  GCO2_TO_TCO2: parseFloat(process.env.GCO2_TO_TCO2_CONVERSION || '0.001'),
  KILOTONNES_TO_TONNES: parseFloat(process.env.KILOTONNES_TO_TONNES || '0.001'),
  INDUSTRY_AVERAGE_EMISSION_FACTOR: parseFloat(process.env.INDUSTRY_AVERAGE_EMISSION_FACTOR || '0.5')
} as const

export const DATA_FRESHNESS = {
  DAYS: parseInt(process.env.DATA_FRESHNESS_DAYS || '30'),
  HOURS: parseInt(process.env.DATA_FRESHNESS_HOURS || '24')
} as const

export const BUSINESS_RULES = {
  MIN_TRADE_VOLUME_KG: parseFloat(process.env.MIN_TRADE_VOLUME_KG || '0'),
  MAX_SUPPLIERS_PER_PAGE: parseInt(process.env.MAX_SUPPLIERS_PER_PAGE || '100'),
  MAX_EMISSIONS_PER_PAGE: parseInt(process.env.MAX_EMISSIONS_PER_PAGE || '100'),
  PRIVACY_THRESHOLD: parseInt(process.env.MARKETPLACE_PRIVACY_THRESHOLD || '5')
} as const
