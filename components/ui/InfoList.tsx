import React from 'react';

interface InfoListProps {
  title: string;
  items: string[];
}

const InfoList: React.FC<InfoListProps> = ({ title, items }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
      {title}
    </h3>
    {items.length > 0 ? (
      <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
        {items.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-500">None</p>
    )}
  </div>
);

export default InfoList;