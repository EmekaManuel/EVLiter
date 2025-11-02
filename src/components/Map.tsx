import { GoogleMap, Marker } from "@react-google-maps/api";
import { useCallback } from "react";

interface MapComponentProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    id: string;
    position: { lat: number; lng: number };
    title: string;
    icon?: string;
    onClick?: () => void;
  }>;
  onMapLoad?: (map: google.maps.Map) => void;
  className?: string;
  mapContainerStyle?: React.CSSProperties;
  options?: google.maps.MapOptions;
}

const defaultMapContainerStyle = {
  width: "100%",
  height: "100%",
};

const defaultOptions: google.maps.MapOptions = {
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
};

export default function MapComponent({
  center,
  zoom = 12,
  markers = [],
  onMapLoad,
  className = "h-96 w-full rounded-lg border border-gray-200",
  mapContainerStyle = defaultMapContainerStyle,
  options = {},
}: MapComponentProps) {
  const handleLoad = useCallback(
    (map: google.maps.Map) => {
      if (onMapLoad) {
        onMapLoad(map);
      }
    },
    [onMapLoad]
  );

  const mergedOptions = { ...defaultOptions, ...options };

  return (
    <div className={className}>
      <GoogleMap
        center={center}
        zoom={zoom}
        mapContainerStyle={mapContainerStyle}
        options={mergedOptions}
        onLoad={handleLoad}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            title={marker.title}
            icon={
              marker.icon
                ? {
                    url: marker.icon,
                    scaledSize: new google.maps.Size(30, 30),
                  }
                : undefined
            }
            onClick={marker.onClick}
          />
        ))}
      </GoogleMap>
    </div>
  );
}
