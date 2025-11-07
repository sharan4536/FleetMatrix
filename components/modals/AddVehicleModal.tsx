import React from 'react';
import { Vehicle } from '../../types';
import Modal from '../ui/Modal';
import FormInput from '../forms/FormInput';
import FormSelect from '../forms/FormSelect';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (vehicle: Omit<Vehicle, 'id' | 'status'>) => void;
}

const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ isOpen, onClose, onAdd }) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newVehicle = {
      name: formData.get('name') as string,
      type: formData.get('type') as 'Truck' | 'Van' | 'Pickup',
      capacity: parseFloat(formData.get('capacity') as string),
      costPerKm: parseFloat(formData.get('costPerKm') as string),
      fuelEfficiency: parseFloat(formData.get('fuelEfficiency') as string),
    };
    onAdd(newVehicle);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Vehicle">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput 
          name="name" 
          label="Vehicle Name" 
          placeholder="e.g., Hauler Prime" 
          required 
        />
        <FormSelect 
          name="type" 
          label="Vehicle Type" 
          options={['Truck', 'Van', 'Pickup']} 
          required 
        />
        <div className="grid grid-cols-2 gap-4">
          <FormInput 
            name="capacity" 
            label="Capacity (tons)" 
            type="number" 
            step="0.1" 
            required 
          />
          <FormInput 
            name="costPerKm" 
            label="Cost per Km (₹)" 
            type="number" 
            step="0.01" 
            required 
          />
        </div>
        <FormInput 
          name="fuelEfficiency" 
          label="Fuel Efficiency (km/L)" 
          type="number" 
          step="0.1" 
          required 
        />
        <div className="flex justify-end pt-2">
          <button 
            type="submit" 
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Add Vehicle
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddVehicleModal;