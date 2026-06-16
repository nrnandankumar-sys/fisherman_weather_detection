// API Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

// Alert Types
const ALERT_TYPES = {
    CYCLONE: 'cyclone',
    HEAVY_RAIN: 'heavy_rain',
    STRONG_WIND: 'strong_wind',
    UNSAFE_SEA: 'unsafe_sea'
};

// Alert Severities
const ALERT_SEVERITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
};

// Emergency Types
const EMERGENCY_TYPES = {
    ACCIDENT: 'accident',
    INJURY: 'injury',
    ENGINE_FAILURE: 'engine_failure',
    SINKING: 'sinking',
    OTHER: 'other'
};

// Sea Conditions
const SEA_CONDITIONS = {
    CALM: 'calm',
    SLIGHT: 'slight',
    MODERATE: 'moderate',
    ROUGH: 'rough',
    VERY_ROUGH: 'very_rough',
    HIGH: 'high',
    VERY_HIGH: 'very_high'
};

// Message Broadcast Types
const BROADCAST_TYPES = {
    WEATHER: 'weather',
    ALERT: 'alert',
    ANNOUNCEMENT: 'announcement'
};

// Priority Levels
const PRIORITY_LEVELS = {
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high',
    URGENT: 'urgent'
};

// App Settings
const APP_SETTINGS = {
    AUTO_REFRESH_INTERVAL: 30000, // 30 seconds
    GPS_UPDATE_INTERVAL: 10000,   // 10 seconds
    NOTIFICATION_TIMEOUT: 5000,   // 5 seconds
    MAX_RETRIES: 3
};
