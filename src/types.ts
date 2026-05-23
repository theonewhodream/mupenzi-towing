export enum IncidentType {
  EngineFailure = "Engine Failure / Non-Starting Vehicle",
  FlatTire = "Flat Tire / Blowout",
  Electrical = "Electrical / Dead Battery",
  OutOfFuel = "Out of Fuel",
  Mechanical = "Mechanical Breakdown (Brakes, Transmission, etc.)",
  OtherDamage = "Other Damage / Accident"
}

export enum DispatchHub {
  Kigali = "Kigali Central Hub",
  Musanze = "Musanze North Hub",
  Rubavu = "Rubavu West Hub",
  Akagera = "Akagera East Hub"
}

export enum IncidentStatus {
  Reported = "Emergency Reported",
  Dispatched = "Rescue Crew Dispatched",
  EnRoute = "Rescue En Route",
  Arrived = "Crew On Site",
  Resolved = "Incident Resolved"
}

export interface IncidentRecord {
  id: string;
  driverName: string;
  phone: string;
  vehicleModel: string;
  vehiclePlate: string;
  locationName: string;
  latitude: number;
  longitude: number;
  incidentType: IncidentType;
  isActiveAccident: boolean;
  priorityLevel: 1 | 2; // Priority 1 is active accident, Priority 2 is standard
  hub: DispatchHub;
  etaMinutes: number;
  distanceKm: number;
  priceRwf: number;
  status: IncidentStatus;
  timestamp: string;
}

export interface DiagnosticAdvice {
  checklists: string[];
  safetyFirst: string[];
  aiCommentary: string;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  price: string;
  billing: string;
  features: string[];
  color: string;
}
