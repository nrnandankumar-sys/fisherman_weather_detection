# Smart Fisherman Weather Alert System - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Currently, no authentication is required. In production, implement JWT or OAuth2.

---

## Health Check

### Check API Status
```
GET /api/health
```

**Response:**
```json
{
    "status": "healthy",
    "timestamp": "2024-06-16T10:30:00Z"
}
```

---

## Fishermen Endpoints

### Register Fisherman
```
POST /api/fishermen
```

**Request Body:**
```json
{
    "name": "Rajesh Kumar",
    "phone": "9876543210",
    "email": "rajesh@example.com"
}
```

**Response (201):**
```json
{
    "message": "Fisherman registered successfully",
    "data": {
        "id": 1,
        "name": "Rajesh Kumar",
        "phone": "9876543210",
        "email": "rajesh@example.com",
        "registration_date": "2024-06-16T10:30:00Z",
        "is_active": true
    }
}
```

### Get Fisherman
```
GET /api/fishermen/{fisherman_id}
```

**Response (200):**
```json
{
    "id": 1,
    "name": "Rajesh Kumar",
    "phone": "9876543210",
    "email": "rajesh@example.com",
    "registration_date": "2024-06-16T10:30:00Z",
    "is_active": true
}
```

---

## Weather Endpoints

### Add Weather Data
```
POST /api/weather
```

**Request Body:**
```json
{
    "location_id": 1,
    "temperature": 28.5,
    "humidity": 75,
    "wind_speed": 15,
    "wind_direction": "NE",
    "rainfall": 2.5,
    "sea_condition": "moderate",
    "visibility": 10,
    "forecast_data": [
        {
            "date": "2024-06-17",
            "temp": 29,
            "wind": 18,
            "condition": "Cloudy"
        }
    ]
}
```

**Response (201):**
```json
{
    "message": "Weather data recorded",
    "data": {
        "id": 1,
        "location_id": 1,
        "temperature": 28.5,
        "humidity": 75,
        "wind_speed": 15,
        "wind_direction": "NE",
        "rainfall": 2.5,
        "sea_condition": "moderate",
        "visibility": 10,
        "timestamp": "2024-06-16T10:30:00Z"
    }
}
```

### Get Weather
```
GET /api/weather/{location_id}
```

**Response (200):**
```json
{
    "id": 1,
    "location_id": 1,
    "temperature": 28.5,
    "humidity": 75,
    "wind_speed": 15,
    "wind_direction": "NE",
    "rainfall": 2.5,
    "sea_condition": "moderate",
    "visibility": 10,
    "timestamp": "2024-06-16T10:30:00Z"
}
```

---

## Alert Endpoints

### Create Alert
```
POST /api/alerts
```

**Request Body:**
```json
{
    "alert_type": "cyclone",
    "severity": "critical",
    "location_id": 1,
    "message": "Cyclone warning issued for coastal regions",
    "is_broadcast": true,
    "expires_at": "2024-06-16T16:30:00Z"
}
```

**Response (201):**
```json
{
    "message": "Alert created successfully",
    "data": {
        "id": 1,
        "alert_type": "cyclone",
        "severity": "critical",
        "location_id": 1,
        "message": "Cyclone warning issued for coastal regions",
        "is_broadcast": true,
        "created_at": "2024-06-16T10:30:00Z",
        "expires_at": "2024-06-16T16:30:00Z",
        "status": "active"
    }
}
```

### Get Alerts
```
GET /api/alerts?location_id=1&severity=high
```

**Query Parameters:**
- `location_id` (optional): Filter by location
- `severity` (optional): Filter by severity (low, medium, high, critical)

**Response (200):**
```json
[
    {
        "id": 1,
        "alert_type": "cyclone",
        "severity": "critical",
        "location_id": 1,
        "message": "Cyclone warning issued",
        "is_broadcast": true,
        "created_at": "2024-06-16T10:30:00Z",
        "expires_at": "2024-06-16T16:30:00Z",
        "status": "active"
    }
]
```

---

## GPS Endpoints

### Update GPS Location
```
POST /api/gps/location
```

**Request Body:**
```json
{
    "fisherman_id": 1,
    "latitude": 13.0833,
    "longitude": 80.2803,
    "speed": 25,
    "direction": 45,
    "altitude": 5,
    "accuracy": 10
}
```

**Response (201):**
```json
{
    "message": "Location updated",
    "data": {
        "id": 1,
        "fisherman_id": 1,
        "latitude": 13.0833,
        "longitude": 80.2803,
        "speed": 25,
        "direction": 45,
        "altitude": 5,
        "accuracy": 10,
        "timestamp": "2024-06-16T10:30:00Z"
    }
}
```

### Get GPS Location
```
GET /api/gps/location/{fisherman_id}
```

**Response (200):**
```json
{
    "id": 1,
    "fisherman_id": 1,
    "latitude": 13.0833,
    "longitude": 80.2803,
    "speed": 25,
    "direction": 45,
    "altitude": 5,
    "accuracy": 10,
    "timestamp": "2024-06-16T10:30:00Z"
}
```

---

## Emergency SOS Endpoints

### Trigger Emergency SOS
```
POST /api/sos
```

**Request Body:**
```json
{
    "fisherman_id": 1,
    "emergency_type": "accident",
    "latitude": 13.0833,
    "longitude": 80.2803,
    "description": "Engine failure in the middle of the sea"
}
```

**Response (201):**
```json
{
    "message": "Emergency SOS triggered",
    "data": {
        "id": 1,
        "fisherman_id": 1,
        "emergency_type": "accident",
        "latitude": 13.0833,
        "longitude": 80.2803,
        "description": "Engine failure in the middle of the sea",
        "status": "active",
        "created_at": "2024-06-16T10:30:00Z",
        "resolved_at": null
    }
}
```

### Get SOS Record
```
GET /api/sos/{sos_id}
```

**Response (200):**
```json
{
    "id": 1,
    "fisherman_id": 1,
    "emergency_type": "accident",
    "latitude": 13.0833,
    "longitude": 80.2803,
    "description": "Engine failure in the middle of the sea",
    "status": "active",
    "created_at": "2024-06-16T10:30:00Z",
    "resolved_at": null
}
```

### Resolve SOS
```
PATCH /api/sos/{sos_id}/resolve
```

**Request Body:**
```json
{
    "responder_id": 5
}
```

**Response (200):**
```json
{
    "message": "SOS resolved",
    "data": {
        "id": 1,
        "fisherman_id": 1,
        "emergency_type": "accident",
        "latitude": 13.0833,
        "longitude": 80.2803,
        "status": "resolved",
        "created_at": "2024-06-16T10:30:00Z",
        "resolved_at": "2024-06-16T10:45:00Z"
    }
}
```

---

## Broadcast Endpoints

### Send Broadcast Message
```
POST /api/broadcast
```

**Request Body:**
```json
{
    "message_type": "alert",
    "title": "Cyclone Warning",
    "content": "A cyclone is expected to hit the coast in 12 hours. All fishermen are advised to return to shore immediately.",
    "location_id": 1,
    "priority": "urgent"
}
```

**Response (201):**
```json
{
    "message": "Broadcast message sent",
    "data": {
        "id": 1,
        "message_type": "alert",
        "title": "Cyclone Warning",
        "content": "A cyclone is expected to hit the coast...",
        "location_id": 1,
        "priority": "urgent",
        "created_at": "2024-06-16T10:30:00Z",
        "sent_count": 0
    }
}
```

### Get Broadcast Messages
```
GET /api/broadcast
```

**Response (200):**
```json
[
    {
        "id": 1,
        "message_type": "alert",
        "title": "Cyclone Warning",
        "content": "A cyclone is expected to hit the coast...",
        "location_id": 1,
        "priority": "urgent",
        "created_at": "2024-06-16T10:30:00Z",
        "sent_count": 150
    }
]
```

---

## Error Responses

### 404 Not Found
```json
{
    "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
    "error": "Internal server error"
}
```

### 400 Bad Request
```json
{
    "error": "Missing required fields"
}
```

---

## Rate Limiting
Not currently implemented. Should be added in production.

## Webhook Support
Not currently implemented. Should be added for real-time notifications.

## WebSocket Support
Not currently implemented. Should be added for live updates.
