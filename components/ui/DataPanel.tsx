import React from 'react';
import { PlusCircleIcon } from './Icons';

interface DataPanelProps {
  title: string;
  onAdd: () => void;
  children: React.ReactNode;
}

const DataPanel: React.FC<DataPanelProps> = ({ title, onAdd, children }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      <button 
        onClick={onAdd} 
        className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium text-sm"
      >
        <PlusCircleIcon className="w-5 h-5" />
        <span>Add New</span>
      </button>
    </div>
    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
      {children}
    </div>
  </div>
);

export default DataPanel;