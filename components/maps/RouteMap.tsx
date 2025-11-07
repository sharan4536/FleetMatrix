
import React from 'react';
import { Assignment, Vehicle } from '../../types';
import { TruckIcon, VanIcon, PickupIcon } from '../ui/Icons';

interface RouteMapProps {
  assignments: Assignment[];
  vehicles: Vehicle[];
}

// Helper to get vehicle icon based on type
const VehicleTypeIcon: React.FC<{type: Vehicle['type'], className?: string}> = ({ type, className = "w-6 h-6" }) => {
    switch(type) {
        case 'Truck': return <TruckIcon className={className} />;
        case 'Van': return <VanIcon className={className} />;
        case 'Pickup': return <PickupIcon className={className} />;
        default: return <TruckIcon className={className} />;
    }
}

// Function to normalize a value within a range
const normalize = (value: number, min: number, max: number) => {
    if (max - min === 0) return 0.5; // Avoid division by zero
    return (value - min) / (max - min);
}

// Function to get color from a gradient based on a value
const getColorForCost = (normalizedCost: number) => {
    // Simple gradient: green -> yellow -> red
    const r = Math.round(255 * Math.min(2 * normalizedCost, 1));
    const g = Math.round(255 * (1 - Math.abs(normalizedCost - 0.5) * 2));
    const b = Math.round(255 * Math.max(1 - 2 * normalizedCost, 0));
    return `rgb(${r},${g},${b})`;
};

const RouteMap: React.FC<RouteMapProps> = ({ assignments, vehicles }) => {
    if (!assignments || assignments.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-full flex items-center justify-center">
                <p className="text-gray-500">No routes to display.</p>
            </div>
        );
    }
    
    // 1. Find the bounding box of all coordinates
    const allCoords = assignments.flatMap(a => [a.pickupCoords, a.dropCoords]);
    const minLat = Math.min(...allCoords.map(c => c.lat));
    const maxLat = Math.max(...allCoords.map(c => c.lat));
    const minLon = Math.min(...allCoords.map(c => c.lon));
    const maxLon = Math.max(...allCoords.map(c => c.lon));

    const allCosts = assignments.map(a => a.cost);
    const minCost = Math.min(...allCosts);
    const maxCost = Math.max(...allCosts);

    // 2. Define SVG canvas dimensions and padding
    const width = 500;
    const height = 350;
    const padding = 40;

    // 3. Create a scaling function to map geo-coords to SVG coords
    const mapCoordsToSvgPoint = (lat: number, lon: number) => {
        const latRange = maxLat - minLat;
        const lonRange = maxLon - minLon;
        
        // Handle case where all points are the same
        if (latRange === 0 && lonRange === 0) {
            return { x: width / 2, y: height / 2 };
        }
        
        const scaleX = (width - 2 * padding) / (lonRange || 1);
        const scaleY = (height - 2 * padding) / (latRange || 1);
        
        const x = padding + (lon - minLon) * scaleX;
        const y = padding + (maxLat - lat) * scaleY; // Invert Y-axis for screen coordinates

        return { x, y };
    };

    // Helper function to get vehicle type for an assignment
    const getVehicleType = (vehicleId: string): Vehicle['type'] => {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        return vehicle?.type || 'Truck';
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Interactive Route Map</h3>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto bg-gray-100 dark:bg-gray-700 rounded-md">
                {assignments.map((assignment, index) => {
                    const p1 = mapCoordsToSvgPoint(assignment.pickupCoords.lat, assignment.pickupCoords.lon);
                    const p2 = mapCoordsToSvgPoint(assignment.dropCoords.lat, assignment.dropCoords.lon);
                    const normalizedCost = normalize(assignment.cost, minCost, maxCost);
                    const routeColor = getColorForCost(normalizedCost);
                    const vehicleType = getVehicleType(assignment.vehicleId);

                    // Calculate midpoint for vehicle icon placement
                    const midX = (p1.x + p2.x) / 2;
                    const midY = (p1.y + p2.y) / 2;

                    return (
                        <g key={index} className="route-group">
                            <line
                                x1={p1.x}
                                y1={p1.y}
                                x2={p2.x}
                                y2={p2.y}
                                stroke={routeColor}
                                strokeWidth="2"
                                markerEnd="url(#arrowhead)"
                            />
                            {/* Pickup point */}
                            <circle cx={p1.x} cy={p1.y} r="4" fill="#3B82F6" className="stroke-white dark:stroke-gray-800" strokeWidth="1.5">
                                <title>Pickup: {assignment.route.split('->')[0].trim()}</title>
                            </circle>
                            {/* Drop point */}
                            <circle cx={p2.x} cy={p2.y} r="4" fill="#10B981" className="stroke-white dark:stroke-gray-800" strokeWidth="1.5">
                                <title>
                                    Drop: {assignment.route.split('->')[1].trim()}{'\n'}
                                    Vehicle: {assignment.vehicleName}{'\n'}
                                    Client: {assignment.clientName}{'\n'}
                                    Cost: ₹{assignment.cost.toFixed(2)}
                                </title>
                            </circle>
                            {/* Vehicle icon at midpoint */}
                            <foreignObject x={midX - 8} y={midY - 8} width="16" height="16">
                                <div className="flex items-center justify-center w-4 h-4 bg-white dark:bg-gray-800 rounded-full border border-gray-300 dark:border-gray-600 shadow-sm">
                                    <VehicleTypeIcon type={vehicleType} className="w-3 h-3 text-gray-700 dark:text-gray-300" />
                                </div>
                            </foreignObject>
                            {/* Invisible line for easier hover */}
                            <line
                                x1={p1.x}
                                y1={p1.y}
                                x2={p2.x}
                                y2={p2.y}
                                stroke="transparent"
                                strokeWidth="10"
                            >
                               <title>
                                    Route: {assignment.route}{'\n'}
                                    Vehicle: {assignment.vehicleName} ({vehicleType}){'\n'}
                                    Client: {assignment.clientName}{'\n'}
                                    Cost: ₹{assignment.cost.toFixed(2)}
                                </title>
                            </line>
                        </g>
                    );
                })}
                <defs>
                    <marker id="arrowhead" markerWidth="5" markerHeight="3.5" refX="5" refY="1.75" orient="auto">
                        <polygon points="0 0, 5 1.75, 0 3.5" fill="#6B7280" />
                    </marker>
                </defs>
            </svg>
            <div className="flex justify-between items-center mt-3 text-xs text-gray-500 dark:text-gray-400">
                <span>Low Cost</span>
                <div className="w-full h-2 mx-2 rounded-full" style={{background: 'linear-gradient(to right, rgb(0,255,0), rgb(255,255,0), rgb(255,0,0))'}}></div>
                <span>High Cost</span>
            </div>
            {/* Legend for vehicle types */}
            <div className="flex items-center justify-center mt-4 space-x-6 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                    <TruckIcon className="w-4 h-4" />
                    <span>Truck</span>
                </div>
                <div className="flex items-center space-x-1">
                    <VanIcon className="w-4 h-4" />
                    <span>Van</span>
                </div>
                <div className="flex items-center space-x-1">
                    <PickupIcon className="w-4 h-4" />
                    <span>Pickup</span>
                </div>
            </div>
        </div>
    );
};

export default RouteMap;
