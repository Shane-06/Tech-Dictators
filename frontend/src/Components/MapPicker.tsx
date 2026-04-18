import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
  iconUrl: new URL("../../node_modules/leaflet/dist/images/marker-icon.png", import.meta.url).href,
  iconRetinaUrl: new URL("../../node_modules/leaflet/dist/images/marker-icon-2x.png", import.meta.url).href,
  shadowUrl: new URL("../../node_modules/leaflet/dist/images/marker-shadow.png", import.meta.url).href,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapPickerProps {
  position: [number, number] | null;
  onSelect: (lat: number, lng: number) => void;
}

const MapPicker: React.FC<MapPickerProps> = ({ position, onSelect }) => {
  const mapElement = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapElement.current) return;

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapElement.current, {
        center: position ?? [20, 0],
        zoom: position ? 8 : 2,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstance.current);

      mapInstance.current.on("click", (event: L.LeafletMouseEvent) => {
        onSelect(event.latlng.lat, event.latlng.lng);
      });
    }
  }, [onSelect, position]);

  useEffect(() => {
    if (!mapInstance.current) return;

    if (position) {
      mapInstance.current.setView(position, 8);
      if (!markerRef.current) {
        markerRef.current = L.marker(position, { icon: markerIcon }).addTo(mapInstance.current);
      } else {
        markerRef.current.setLatLng(position);
      }
    }
  }, [position]);

  useEffect(() => {
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return <div ref={mapElement} className="h-72 w-full rounded-3xl border border-slate-800" />;
};

export default MapPicker;
