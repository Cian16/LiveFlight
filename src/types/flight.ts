export interface FlightState {
  icao24: string;
  callsign: string;
  origin_country: string;
  time_position: number | null;
  last_contact: number;
  longitude: number | null;
  latitude: number | null;
  baro_altitude: number | null;
  on_ground: boolean;
  velocity: number | null;
  true_track: number | null;
  vertical_rate: number | null;
  sensors: number[] | null;
  geo_altitude: number | null;
  squawk: string | null;
  spi: boolean;
  position_source: number;
}

export interface MapBounds {
  lamin: number;
  lamin_max: number;
  lomin: number;
  lomax: number;
}

export interface AircraftMetadata {
  ModeS: string;
  Registration: string;
  Manufacturer: string;
  ICAOTypeCode: string;
  Type: string;
  RegisteredOwners: string;
  OperatorFlagCode: string;
}

export interface Airport {
  icao_code: string;
  iata_code: string;
  name: string;
  municipality: string;
  latitude: number;
  longitude: number;
}

export interface FlightRoute {
  callsign: string;
  origin: Airport;
  destination: Airport;
  airline: {
    name: string;
    icao: string;
  };
}
