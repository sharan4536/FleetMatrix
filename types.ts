
export enum VehicleStatus {
  Available = 'Available',
  InUse = 'In Use',
  Maintenance = 'Under Maintenance',
}

export interface Vehicle {
  id: string;
  name: string;
  type: 'Truck' | 'Van' | 'Pickup';
  capacity: number; // in tons
  costPerKm: number;
  fuelEfficiency: number; // km/litre
  status: VehicleStatus;
}

export interface ClientRequest {
  id: string;
  clientName: string;
  pickupLocation: string;
  dropLocation: string;
  weight: number; // in tons
  priority: 'High' | 'Medium' | 'Low';
}

export interface Assignment {
  vehicleId: string;
  vehicleName: string;
  requestId: string;
  clientName: string;
  route: string;
  distance: number;
  cost: number;
  pickupCoords: { lat: number; lon: number };
  dropCoords: { lat: number; lon: number };
}

export interface OptimizationResult {
  assignments: Assignment[];
  totalCost: number;
  baselineCost: number;
  totalDistance: number;
  fleetUtilization: number;
  unassignedRequests: string[];
  idleVehicles: string[];
}
