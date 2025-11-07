import React from 'react';
import { ClientRequest } from '../../types';
import Modal from '../ui/Modal';
import FormInput from '../forms/FormInput';
import FormSelect from '../forms/FormSelect';

interface AddRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (request: Omit<ClientRequest, 'id'>) => void;
}

const AddRequestModal: React.FC<AddRequestModalProps> = ({ isOpen, onClose, onAdd }) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newRequest = {
      clientName: formData.get('clientName') as string,
      pickupLocation: formData.get('pickupLocation') as string,
      dropLocation: formData.get('dropLocation') as string,
      weight: parseFloat(formData.get('weight') as string),
      priority: formData.get('priority') as 'High' | 'Medium' | 'Low',
    };
    onAdd(newRequest);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Client Request">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput 
          name="clientName" 
          label="Client Name" 
          placeholder="e.g., Global Imports" 
          required 
        />
        <FormInput 
          name="pickupLocation" 
          label="Pickup Location" 
          placeholder="e.g., Port of Mumbai" 
          required 
        />
        <FormInput 
          name="dropLocation" 
          label="Drop Location" 
          placeholder="e.g., Pune" 
          required 
        />
        <div className="grid grid-cols-2 gap-4">
          <FormInput 
            name="weight" 
            label="Weight (tons)" 
            type="number" 
            step="0.1" 
            required 
          />
          <FormSelect 
            name="priority" 
            label="Priority" 
            options={['High', 'Medium', 'Low']} 
            required 
          />
        </div>
        <div className="flex justify-end pt-2">
          <button 
            type="submit" 
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Add Request
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddRequestModal;