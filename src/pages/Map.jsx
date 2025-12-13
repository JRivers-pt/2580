import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';

// Fix for default Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const locations = [
    { name: "Estação CP Carregado", coords: [39.0335, -8.9723], type: "Transport" },
    { name: "Centro de Saúde", coords: [39.0180, -8.9750], type: "Health" },
    { name: "Padaria Carregadense (Partner)", coords: [39.0150, -8.9700], type: "Partner" },
    { name: "Campera Outlet", coords: [39.0122, -8.9805], type: "Shopping" }
];

const MapPage = () => {
    const { t } = useTranslation();

    return (
        <div style={{ height: 'calc(100vh - 80px)', width: '100%', position: 'relative' }}>
            <MapContainer
                center={[39.0167, -8.9700]}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                {/* Modern Dark/Light Mode compatible tiles (CartoDB Voyager) */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {locations.map((loc, idx) => (
                    <Marker key={idx} position={loc.coords}>
                        <Popup>
                            <strong>{loc.name}</strong><br />
                            {loc.type}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            <div style={{
                position: 'absolute', top: 10, left: 10, right: 10, zIndex: 1000,
                background: 'rgba(255,255,255,0.9)', padding: '12px', borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)', backdropFilter: 'blur(5px)'
            }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#0F766E' }}>Carregado Map</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#666' }}>Find services and partners.</p>
            </div>
        </div>
    );
};

export default MapPage;
