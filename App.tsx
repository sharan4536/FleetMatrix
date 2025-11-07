
import React, { useState, useCallback, useMemo } from 'react';
import { Vehicle, ClientRequest, OptimizationResult, VehicleStatus, Assignment } from './types';
import { runFleetOptimization } from './services/geminiService';
import { initialVehicles, initialRequests } from './data/mockData';
import KpiCard from './components/ui/KpiCard';
import { TruckIcon, PackageIcon, ZapIcon, TrashIcon, VanIcon, PickupIcon, MapPinIcon, PiggyBankIcon } from './components/ui/Icons';
import RouteMap from './components/maps/RouteMap';
import CostComparisonChart from './components/charts/CostComparisonChart';
import DataPanel from './components/ui/DataPanel';
import InfoList from './components/ui/InfoList';
import AddVehicleModal from './components/modals/AddVehicleModal';
import AddRequestModal from './components/modals/AddRequestModal';



// Helper to get status color
const getStatusColor = (status: VehicleStatus) => {
  switch (status) {
    case VehicleStatus.Available: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case VehicleStatus.InUse: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case VehicleStatus.Maintenance: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

// Helper to get vehicle icon
const VehicleTypeIcon: React.FC<{type: Vehicle['type'], className?: string}> = ({ type, className = "w-6 h-6" }) => {
    switch(type) {
        case 'Truck': return <TruckIcon className={className} />;
        case 'Van': return <VanIcon className={className} />;
        case 'Pickup': return <PickupIcon className={className} />;
        default: return <TruckIcon className={className} />;
    }
}

export default function App() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [requests, setRequests] = useState<ClientRequest[]>(initialRequests);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const handleOptimization = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setOptimizationResult(null);

    const availableVehicles = vehicles.filter(v => v.status === VehicleStatus.Available);

    try {
      const result = await runFleetOptimization(availableVehicles, requests);
      setOptimizationResult(result);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [vehicles, requests]);

  const addVehicle = (vehicle: Omit<Vehicle, 'id' | 'status'>) => {
    setVehicles(prev => [...prev, { ...vehicle, id: `V${(prev.length + 1).toString().padStart(3, '0')}`, status: VehicleStatus.Available }]);
  };
  
  const addRequest = (request: Omit<ClientRequest, 'id'>) => {
    setRequests(prev => [...prev, { ...request, id: `R${(prev.length + 1).toString().padStart(3, '0')}` }]);
  };

  const deleteVehicle = (id: string) => {
    setVehicles(vehicles.filter(v => v.id !== id));
  }

  const deleteRequest = (id: string) => {
    setRequests(requests.filter(r => r.id !== id));
  }

  // Extract savings calculations for reuse
  const savings = optimizationResult ? optimizationResult.baselineCost - optimizationResult.totalCost : 0;
  const savingsPercentage = optimizationResult && optimizationResult.baselineCost > 0 ? (savings / optimizationResult.baselineCost) * 100 : 0;

  const kpiData = useMemo(() => {
    return [
      { title: "Total Optimized Cost", value: optimizationResult ? `₹${optimizationResult.totalCost.toFixed(2)}` : 'N/A', icon: <span className="text-green-500 w-6 h-6 font-bold">₹</span>, color: 'bg-green-100' },
      { title: "Savings", value: optimizationResult ? `₹${savings.toFixed(2)} (${savingsPercentage.toFixed(1)}%)` : 'N/A', icon: <PiggyBankIcon className="text-teal-500 w-6 h-6"/>, color: 'bg-teal-100' },
      { title: "Fleet Utilization", value: optimizationResult ? `${optimizationResult.fleetUtilization.toFixed(1)}%` : 'N/A', icon: <TruckIcon className="text-blue-500 w-6 h-6"/>, color: 'bg-blue-100' },
      { title: "Total Distance", value: optimizationResult ? `${optimizationResult.totalDistance.toFixed(0)} km` : 'N/A', icon: <MapPinIcon className="text-purple-500 w-6 h-6"/>, color: 'bg-purple-100' },
    ];
  }, [optimizationResult, savings, savingsPercentage]);


  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <TruckIcon className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FleetMatrix</h1>
          </div>
          <button
            onClick={handleOptimization}
            disabled={isLoading}
            className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : <ZapIcon className="w-5 h-5"/>}
            <span>{isLoading ? 'Optimizing...' : 'Run Optimization'}</span>
          </button>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Vehicles & Requests */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <DataPanel title="Vehicle Fleet" onAdd={() => setIsVehicleModalOpen(true)}>
                {vehicles.map(v => (
                    <div key={v.id} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex items-start space-x-3 relative group">
                        <VehicleTypeIcon type={v.type} className="w-10 h-10 text-indigo-500 mt-1"/>
                        <div className="flex-1">
                            <p className="font-bold text-gray-800 dark:text-gray-100">{v.name} <span className="text-sm font-normal text-gray-500">({v.id})</span></p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{v.type} - {v.capacity} tons</p>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(v.status)}`}>{v.status}</span>
                        </div>
                        <button onClick={() => deleteVehicle(v.id)} className="absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </DataPanel>
            <DataPanel title="Client Requests" onAdd={() => setIsRequestModalOpen(true)}>
                {requests.map(r => (
                    <div key={r.id} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex items-start space-x-3 relative group">
                        <PackageIcon className="w-10 h-10 text-indigo-500 mt-1"/>
                        <div className="flex-1">
                            <p className="font-bold text-gray-800 dark:text-gray-100">{r.clientName} <span className="text-sm font-normal text-gray-500">({r.id})</span></p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{r.pickupLocation} to {r.dropLocation}</p>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{r.weight} tons - {r.priority} Priority</p>
                        </div>
                        <button onClick={() => deleteRequest(r.id)} className="absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </DataPanel>
          </div>

          {/* Right Column: Dashboard */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpiData.map(kpi => <KpiCard key={kpi.title} {...kpi} />)}
            </div>

            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert"><p>{error}</p></div>}
            
            {/* Cost Comparison Section */}
            {optimizationResult && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Cost Analysis & Savings Breakdown</h3>
                
                {/* Main Cost Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">₹{optimizationResult.baselineCost.toFixed(2)}</div>
                    <div className="text-sm text-red-700 dark:text-red-300 font-medium">Without Optimization</div>
                    <div className="text-xs text-red-600 dark:text-red-400 mt-1">Traditional Approach</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">₹{optimizationResult.totalCost.toFixed(2)}</div>
                    <div className="text-sm text-green-700 dark:text-green-300 font-medium">With Optimization</div>
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">AI-Optimized Routes</div>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹{savings.toFixed(2)}</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">Total Savings</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">{savingsPercentage.toFixed(1)}% Reduction</div>
                  </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cost Efficiency</span>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{savingsPercentage.toFixed(1)}% Savings</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${Math.min(savingsPercentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>0% Savings</span>
                    <span>Maximum Efficiency</span>
                  </div>
                </div>

                {/* Detailed Breakdown Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th scope="col" className="px-4 py-3">Metric</th>
                        <th scope="col" className="px-4 py-3 text-right">Without Optimization</th>
                        <th scope="col" className="px-4 py-3 text-right">With Optimization</th>
                        <th scope="col" className="px-4 py-3 text-right">Difference</th>
                        <th scope="col" className="px-4 py-3 text-right">Improvement</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Total Cost</td>
                        <td className="px-4 py-3 text-right text-red-600 dark:text-red-400 font-semibold">₹{optimizationResult.baselineCost.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-green-600 dark:text-green-400 font-semibold">₹{optimizationResult.totalCost.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-blue-600 dark:text-blue-400 font-semibold">₹{savings.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs font-medium px-2.5 py-0.5 rounded">
                            {savingsPercentage.toFixed(1)}% ↓
                          </span>
                        </td>
                      </tr>
                      <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Cost per KM</td>
                        <td className="px-4 py-3 text-right">₹{(optimizationResult.baselineCost / optimizationResult.totalDistance).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right">₹{(optimizationResult.totalCost / optimizationResult.totalDistance).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-blue-600 dark:text-blue-400">₹{((optimizationResult.baselineCost - optimizationResult.totalCost) / optimizationResult.totalDistance).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded">
                            {savingsPercentage.toFixed(1)}% ↓
                          </span>
                        </td>
                      </tr>
                      <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Fleet Utilization</td>
                        <td className="px-4 py-3 text-right">~{(optimizationResult.fleetUtilization * 0.7).toFixed(1)}%</td>
                        <td className="px-4 py-3 text-right">{optimizationResult.fleetUtilization.toFixed(1)}%</td>
                        <td className="px-4 py-3 text-right text-green-600 dark:text-green-400">+{(optimizationResult.fleetUtilization * 0.3).toFixed(1)}%</td>
                        <td className="px-4 py-3 text-right">
                          <span className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs font-medium px-2.5 py-0.5 rounded">
                            {((optimizationResult.fleetUtilization * 0.3) / (optimizationResult.fleetUtilization * 0.7) * 100).toFixed(1)}% ↑
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Key Benefits */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">₹{(savings / 30).toFixed(0)}</div>
                    <div className="text-xs text-green-700 dark:text-green-300">Daily Savings</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">₹{(savings * 12).toFixed(0)}</div>
                    <div className="text-xs text-blue-700 dark:text-blue-300">Annual Savings</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{optimizationResult.assignments.length}</div>
                    <div className="text-xs text-purple-700 dark:text-purple-300">Optimized Routes</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg">
                    <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{optimizationResult.totalDistance.toFixed(0)}</div>
                    <div className="text-xs text-orange-700 dark:text-orange-300">Total KM</div>
                  </div>
                </div>
              </div>
            )}

            {/* Visual Cost Comparison Chart */}
            {optimizationResult && (
              <CostComparisonChart
                baselineCost={optimizationResult.baselineCost}
                optimizedCost={optimizationResult.totalCost}
                savings={savings}
                savingsPercentage={savingsPercentage}
              />
            )}
            
            {isLoading && <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center py-8">Loading results...</div>}
            {!isLoading && !optimizationResult && <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center py-8 text-gray-500">Run optimization to see results.</div>}

            {optimizationResult && (
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md xl:col-span-3">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Optimized Assignments</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                    <th scope="col" className="px-6 py-3">Vehicle</th>
                                    <th scope="col" className="px-6 py-3">Client Request</th>
                                    <th scope="col" className="px-6 py-3">Route</th>
                                    <th scope="col" className="px-6 py-3 text-right">Distance (km)</th>
                                    <th scope="col" className="px-6 py-3 text-right">Cost (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {optimizationResult.assignments.map((a, i) => (
                                    <tr key={i} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{a.vehicleName}</td>
                                        <td className="px-6 py-4">{a.clientName}</td>
                                        <td className="px-6 py-4">{a.route}</td>
                                        <td className="px-6 py-4 text-right">{a.distance.toFixed(0)}</td>
                                        <td className="px-6 py-4 text-right font-semibold">₹{a.cost.toFixed(2)}</td>
                                    </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="xl:col-span-2 flex flex-col gap-6">
                        <RouteMap assignments={optimizationResult.assignments} vehicles={vehicles} />
                        <InfoList title="Idle Vehicles" items={optimizationResult.idleVehicles} />
                        <InfoList title="Unassigned Requests" items={optimizationResult.unassignedRequests} />
                    </div>
                </div>
            )}
          </div>
        </div>
      </main>

      <AddVehicleModal 
        isOpen={isVehicleModalOpen} 
        onClose={() => setIsVehicleModalOpen(false)}
        onAdd={addVehicle}
      />
      <AddRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onAdd={addRequest}
      />
    </div>
  );
}


