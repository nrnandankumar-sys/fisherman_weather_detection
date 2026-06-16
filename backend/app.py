from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os
from datetime import datetime

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL',
    'mysql+pymysql://root:password@localhost:3306/fisherman_db'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize Database
db = SQLAlchemy(app)

# ==================== MODELS ====================

class Fisherman(db.Model):
    __tablename__ = 'fishermen'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True)
    registration_date = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'phone': self.phone,
            'email': self.email,
            'registration_date': self.registration_date.isoformat(),
            'is_active': self.is_active
        }


class WeatherData(db.Model):
    __tablename__ = 'weather_data'
    id = db.Column(db.Integer, primary_key=True)
    location_id = db.Column(db.Integer, nullable=False)
    temperature = db.Column(db.Float, nullable=False)
    humidity = db.Column(db.Float)
    wind_speed = db.Column(db.Float, nullable=False)
    wind_direction = db.Column(db.String(10))
    rainfall = db.Column(db.Float)
    sea_condition = db.Column(db.String(50))
    visibility = db.Column(db.Float)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    forecast_data = db.Column(db.JSON)
    
    def to_dict(self):
        return {
            'id': self.id,
            'location_id': self.location_id,
            'temperature': self.temperature,
            'humidity': self.humidity,
            'wind_speed': self.wind_speed,
            'wind_direction': self.wind_direction,
            'rainfall': self.rainfall,
            'sea_condition': self.sea_condition,
            'visibility': self.visibility,
            'timestamp': self.timestamp.isoformat(),
            'forecast_data': self.forecast_data
        }


class Alert(db.Model):
    __tablename__ = 'alerts'
    id = db.Column(db.Integer, primary_key=True)
    alert_type = db.Column(db.String(50), nullable=False)  # cyclone, heavy_rain, strong_wind, unsafe_sea
    severity = db.Column(db.String(20), nullable=False)  # low, medium, high, critical
    location_id = db.Column(db.Integer, nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_broadcast = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='active')  # active, resolved, expired
    
    def to_dict(self):
        return {
            'id': self.id,
            'alert_type': self.alert_type,
            'severity': self.severity,
            'location_id': self.location_id,
            'message': self.message,
            'is_broadcast': self.is_broadcast,
            'created_at': self.created_at.isoformat(),
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'status': self.status
        }


class GPSLocation(db.Model):
    __tablename__ = 'gps_locations'
    id = db.Column(db.Integer, primary_key=True)
    fisherman_id = db.Column(db.Integer, db.ForeignKey('fishermen.id'), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    speed = db.Column(db.Float)
    direction = db.Column(db.Float)
    altitude = db.Column(db.Float)
    accuracy = db.Column(db.Float)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'fisherman_id': self.fisherman_id,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'speed': self.speed,
            'direction': self.direction,
            'altitude': self.altitude,
            'accuracy': self.accuracy,
            'timestamp': self.timestamp.isoformat()
        }


class EmergencySOS(db.Model):
    __tablename__ = 'emergency_sos'
    id = db.Column(db.Integer, primary_key=True)
    fisherman_id = db.Column(db.Integer, db.ForeignKey('fishermen.id'), nullable=False)
    emergency_type = db.Column(db.String(50), nullable=False)  # accident, injury, engine_failure, etc
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default='active')  # active, responded, resolved
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    resolved_at = db.Column(db.DateTime)
    responder_id = db.Column(db.Integer)
    
    def to_dict(self):
        return {
            'id': self.id,
            'fisherman_id': self.fisherman_id,
            'emergency_type': self.emergency_type,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'description': self.description,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None
        }


class BroadcastMessage(db.Model):
    __tablename__ = 'broadcast_messages'
    id = db.Column(db.Integer, primary_key=True)
    message_type = db.Column(db.String(50), nullable=False)  # weather, alert, announcement
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    location_id = db.Column(db.Integer)
    priority = db.Column(db.String(20), default='normal')  # low, normal, high, urgent
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    sent_count = db.Column(db.Integer, default=0)
    
    def to_dict(self):
        return {
            'id': self.id,
            'message_type': self.message_type,
            'title': self.title,
            'content': self.content,
            'location_id': self.location_id,
            'priority': self.priority,
            'created_at': self.created_at.isoformat(),
            'sent_count': self.sent_count
        }


# ==================== ROUTES ====================

# Health Check
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat()
    }), 200


# FISHERMAN ENDPOINTS
@app.route('/api/fishermen', methods=['POST'])
def register_fisherman():
    data = request.get_json()
    
    if not data or not data.get('name') or not data.get('phone'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    try:
        fisherman = Fisherman(
            name=data['name'],
            phone=data['phone'],
            email=data.get('email')
        )
        db.session.add(fisherman)
        db.session.commit()
        
        return jsonify({
            'message': 'Fisherman registered successfully',
            'data': fisherman.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/fishermen/<int:fisherman_id>', methods=['GET'])
def get_fisherman(fisherman_id):
    fisherman = Fisherman.query.get(fisherman_id)
    if not fisherman:
        return jsonify({'error': 'Fisherman not found'}), 404
    return jsonify(fisherman.to_dict()), 200


# WEATHER ENDPOINTS
@app.route('/api/weather', methods=['POST'])
def add_weather_data():
    data = request.get_json()
    
    try:
        weather = WeatherData(
            location_id=data['location_id'],
            temperature=data['temperature'],
            humidity=data.get('humidity'),
            wind_speed=data['wind_speed'],
            wind_direction=data.get('wind_direction'),
            rainfall=data.get('rainfall'),
            sea_condition=data.get('sea_condition'),
            visibility=data.get('visibility'),
            forecast_data=data.get('forecast_data')
        )
        db.session.add(weather)
        db.session.commit()
        
        return jsonify({
            'message': 'Weather data recorded',
            'data': weather.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/weather/<int:location_id>', methods=['GET'])
def get_weather(location_id):
    weather = WeatherData.query.filter_by(location_id=location_id).order_by(WeatherData.timestamp.desc()).first()
    if not weather:
        return jsonify({'error': 'Weather data not found'}), 404
    return jsonify(weather.to_dict()), 200


# ALERT ENDPOINTS
@app.route('/api/alerts', methods=['POST'])
def create_alert():
    data = request.get_json()
    
    try:
        alert = Alert(
            alert_type=data['alert_type'],
            severity=data['severity'],
            location_id=data['location_id'],
            message=data['message'],
            is_broadcast=data.get('is_broadcast', False),
            expires_at=data.get('expires_at')
        )
        db.session.add(alert)
        db.session.commit()
        
        return jsonify({
            'message': 'Alert created successfully',
            'data': alert.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    location_id = request.args.get('location_id', type=int)
    severity = request.args.get('severity')
    
    query = Alert.query.filter_by(status='active')
    
    if location_id:
        query = query.filter_by(location_id=location_id)
    if severity:
        query = query.filter_by(severity=severity)
    
    alerts = query.order_by(Alert.created_at.desc()).all()
    return jsonify([alert.to_dict() for alert in alerts]), 200


# GPS ENDPOINTS
@app.route('/api/gps/location', methods=['POST'])
def update_gps_location():
    data = request.get_json()
    
    try:
        location = GPSLocation(
            fisherman_id=data['fisherman_id'],
            latitude=data['latitude'],
            longitude=data['longitude'],
            speed=data.get('speed'),
            direction=data.get('direction'),
            altitude=data.get('altitude'),
            accuracy=data.get('accuracy')
        )
        db.session.add(location)
        db.session.commit()
        
        return jsonify({
            'message': 'Location updated',
            'data': location.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/gps/location/<int:fisherman_id>', methods=['GET'])
def get_gps_location(fisherman_id):
    location = GPSLocation.query.filter_by(fisherman_id=fisherman_id).order_by(GPSLocation.timestamp.desc()).first()
    if not location:
        return jsonify({'error': 'Location not found'}), 404
    return jsonify(location.to_dict()), 200


# EMERGENCY SOS ENDPOINTS
@app.route('/api/sos', methods=['POST'])
def trigger_sos():
    data = request.get_json()
    
    try:
        sos = EmergencySOS(
            fisherman_id=data['fisherman_id'],
            emergency_type=data['emergency_type'],
            latitude=data['latitude'],
            longitude=data['longitude'],
            description=data.get('description')
        )
        db.session.add(sos)
        db.session.commit()
        
        return jsonify({
            'message': 'Emergency SOS triggered',
            'data': sos.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/sos/<int:sos_id>', methods=['GET'])
def get_sos(sos_id):
    sos = EmergencySOS.query.get(sos_id)
    if not sos:
        return jsonify({'error': 'SOS record not found'}), 404
    return jsonify(sos.to_dict()), 200


@app.route('/api/sos/<int:sos_id>/resolve', methods=['PATCH'])
def resolve_sos(sos_id):
    data = request.get_json()
    sos = EmergencySOS.query.get(sos_id)
    
    if not sos:
        return jsonify({'error': 'SOS record not found'}), 404
    
    try:
        sos.status = 'resolved'
        sos.resolved_at = datetime.utcnow()
        sos.responder_id = data.get('responder_id')
        db.session.commit()
        
        return jsonify({
            'message': 'SOS resolved',
            'data': sos.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# BROADCAST ENDPOINTS
@app.route('/api/broadcast', methods=['POST'])
def send_broadcast():
    data = request.get_json()
    
    try:
        message = BroadcastMessage(
            message_type=data['message_type'],
            title=data['title'],
            content=data['content'],
            location_id=data.get('location_id'),
            priority=data.get('priority', 'normal')
        )
        db.session.add(message)
        db.session.commit()
        
        return jsonify({
            'message': 'Broadcast message sent',
            'data': message.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/broadcast', methods=['GET'])
def get_broadcasts():
    messages = BroadcastMessage.query.order_by(BroadcastMessage.created_at.desc()).limit(50).all()
    return jsonify([msg.to_dict() for msg in messages]), 200


# Error Handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Resource not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)
