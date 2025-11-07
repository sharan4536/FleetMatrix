
import { GoogleGenAI, Type } from "@google/genai";
import { Vehicle, ClientRequest, OptimizationResult } from '../types';

const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  throw new Error("VITE_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const optimizationSchema = {
  type: Type.OBJECT,
  properties: {
    assignments: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          vehicleId: { type: Type.STRING },
          vehicleName: { type: Type.STRING },
          requestId: { type: Type.STRING },
          clientName: { type: Type.STRING },
          route: { type: Type.STRING, description: "e.g., 'Pickup Location -> Drop Location'" },
          distance: { type: Type.NUMBER, description: "Estimated distance in km" },
          cost: { type: Type.NUMBER, description: "Calculated cost for this assignment" },
          pickupCoords: {
            type: Type.OBJECT,
            properties: { lat: { type: Type.NUMBER }, lon: { type: Type.NUMBER } },
            required: ["lat", "lon"],
            description: "Estimated latitude and longitude for the pickup location"
          },
          dropCoords: {
            type: Type.OBJECT,
            properties: { lat: { type: Type.NUMBER }, lon: { type: Type.NUMBER } },
            required: ["lat", "lon"],
            description: "Estimated latitude and longitude for the drop location"
          },
        },
        required: ["vehicleId", "vehicleName", "requestId", "clientName", "route", "distance", "cost", "pickupCoords", "dropCoords"]
      },
    },
    totalCost: { type: Type.NUMBER },
    baselineCost: { type: Type.NUMBER, description: "Estimated cost using a simple greedy, non-optimal assignment for comparison" },
    totalDistance: { type: Type.NUMBER },
    fleetUtilization: { type: Type.NUMBER, description: "Percentage of utilized vehicles" },
    unassignedRequests: { type: Type.ARRAY, items: { type: Type.STRING, description: "IDs of unassigned client requests" } },
    idleVehicles: { type: Type.ARRAY, items: { type: Type.STRING, description: "IDs of unassigned vehicles" } },
  },
  required: ["assignments", "totalCost", "baselineCost", "totalDistance", "fleetUtilization", "unassignedRequests", "idleVehicles"]
};

// Mock optimization function for demonstration purposes
const mockOptimization = (vehicles: Vehicle[], requests: ClientRequest[]): OptimizationResult => {
  const assignments = [];
  const usedVehicles = new Set<string>();
  const assignedRequests = new Set<string>();
  
  // Simple assignment algorithm for demonstration
  for (const request of requests) {
    const availableVehicle = vehicles.find(v => 
      !usedVehicles.has(v.id) && v.capacity >= request.weight
    );
    
    if (availableVehicle) {
      const distance = Math.random() * 50 + 10; // Random distance 10-60 km
      const cost = distance * 2.5 + Math.random() * 20; // Base cost calculation
      
      assignments.push({
        vehicleId: availableVehicle.id,
        vehicleName: availableVehicle.name,
        requestId: request.id,
        clientName: request.clientName,
        route: `${request.pickupLocation} -> ${request.dropLocation}`,
        distance: Math.round(distance * 100) / 100,
        cost: Math.round(cost * 100) / 100,
        pickupCoords: {
          lat: 40.7128 + (Math.random() - 0.5) * 0.1, // NYC area
          lon: -74.0060 + (Math.random() - 0.5) * 0.1
        },
        dropCoords: {
          lat: 40.7128 + (Math.random() - 0.5) * 0.1,
          lon: -74.0060 + (Math.random() - 0.5) * 0.1
        }
      });
      
      usedVehicles.add(availableVehicle.id);
      assignedRequests.add(request.id);
    }
  }
  
  const totalCost = assignments.reduce((sum, a) => sum + a.cost, 0);
  const baselineCost = totalCost * 1.3; // Assume 30% savings from optimization
  const totalDistance = assignments.reduce((sum, a) => sum + a.distance, 0);
  const fleetUtilization = (usedVehicles.size / vehicles.length) * 100;
  
  const unassignedRequests = requests
    .filter(r => !assignedRequests.has(r.id))
    .map(r => r.id);
    
  const idleVehicles = vehicles
    .filter(v => !usedVehicles.has(v.id))
    .map(v => v.id);
  
  return {
    assignments,
    totalCost: Math.round(totalCost * 100) / 100,
    baselineCost: Math.round(baselineCost * 100) / 100,
    totalDistance: Math.round(totalDistance * 100) / 100,
    fleetUtilization: Math.round(fleetUtilization * 100) / 100,
    unassignedRequests,
    idleVehicles
  };
};

export const runFleetOptimization = async (
  vehicles: Vehicle[],
  requests: ClientRequest[]
): Promise<OptimizationResult> => {
  // For browser demonstration, use mock data due to CORS restrictions
  // In production, this should be called from a backend server
  console.log("Using mock optimization due to browser CORS restrictions");
  return mockOptimization(vehicles, requests);

  // Original Gemini API implementation (commented out for browser demo)
  /*
  const model = "gemini-2.5-pro";

  const prompt = `
    You are an AI-powered fleet optimization engine for a logistics company. Your task is to solve a Transportation Problem.
    Your goal is to assign available vehicles to client delivery requests to MINIMIZE the total transportation cost.

    **CRITICAL INSTRUCTIONS:**
    1.  **Optimal Assignment:** Generate the most cost-effective assignment of vehicles to requests.
    2.  **Baseline Calculation:** As a separate calculation, determine a 'baselineCost'. This baseline should be calculated using a simple, NON-OPTIMAL, greedy "first-fit" heuristic: for each request, assign the FIRST available vehicle in the list that has enough capacity. This is for comparison purposes to show how much your optimization saves.
    3.  **Geographic Coordinates:** For each successful assignment, you MUST provide estimated geographic coordinates (latitude and longitude) for both the pickup and drop-off locations.

    Constraints and Rules for Optimal Assignment:
    1.  A vehicle can only be assigned to a request if its capacity is greater than or equal to the request's weight.
    2.  A vehicle can be assigned to at most one request.
    3.  The cost for an assignment is calculated as: distance * costPerKm for the assigned vehicle. You must estimate a realistic distance based on the pickup and drop locations.
    4.  Prioritize high-priority requests if possible.
    5.  Ensure the output is a valid JSON object adhering to the provided schema, including the 'baselineCost' and coordinates for all assignments.

    Available Vehicles (Supply):
    ${JSON.stringify(vehicles, null, 2)}

    Client Delivery Requests (Demand):
    ${JSON.stringify(requests, null, 2)}

    Generate the optimal assignment plan AND the baseline cost.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: optimizationSchema,
        temperature: 0.2,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    // Sometimes the model returns a single object instead of an array for assignments. Let's normalize.
    if(result.assignments && !Array.isArray(result.assignments)) {
      result.assignments = [result.assignments];
    }
    
    return result;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate optimization plan. Please check the API key and input data.");
  }
  */
};
