import React from 'react';
import { useNavigate } from 'react-router-dom';

const PerfumeList = ({ perfumes }) => {
  const navigate = useNavigate();

  const handleProductClick = (id) => {
    window.scrollTo(0, 0);
    navigate(`/perfume/${id}`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Perfumes</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {perfumes.map((perfume) => (
          <div 
            key={perfume._id} 
            className="bg-white p-4 rounded shadow cursor-pointer"
            onClick={() => handleProductClick(perfume._id)}
          >
            <img src={perfume.uri} alt={perfume.perfumeName} className="w-full h-48 object-cover mb-2" />
            <h2 className="text-xl font-semibold">{perfume.perfumeName}</h2>
            <p>Brand: {perfume.brand?.brandName || 'Unknown'}</p>
            <p>Volume: {perfume.volume}ml</p>
            <p>Audience: {perfume.targetAudience}</p>
            <p className="text-lg font-semibold text-blue-600">${perfume.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerfumeList;