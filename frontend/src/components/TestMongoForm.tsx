'use client';

import { useState } from 'react';
import axios from 'axios';

export default function TestMongoForm() {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    bio: '',
    rating: 4.5
  });
  const [status, setStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [dbResponse, setDbResponse] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    setDbResponse(null);

    try {
      // Fix: Use port 5001 instead of 5000
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      
      console.log('Submitting test data to:', `${API_URL}/creators/test`);
      console.log('Data being sent:', formData);
      
      // Fix: Remove the duplicate axios call and fix the endpoint
      const response = await axios.post(`${API_URL}/creators/test`, formData);
      console.log('Response received:', response.data);
      
      setDbResponse(response.data);
      setStatus({
        success: true,
        message: 'Data successfully stored in MongoDB!'
      });
      
      // Clear form
      setFormData({
        name: '',
        category: '',
        subcategory: '',
        bio: '',
        rating: 4.5
      });
    } catch (error: any) {
      console.error('Error storing data:', error);
      setStatus({
        success: false,
        message: error.response?.data?.message || 'Failed to store data in MongoDB'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Test MongoDB Connection</h2>
      
      {status && (
        <div 
          className={`p-4 mb-4 text-sm rounded-lg ${
            status.success 
              ? 'bg-green-100 text-green-700 border border-green-400' 
              : 'bg-red-100 text-red-700 border border-red-400'
          }`}
        >
          {status.message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Creator Name/Title
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="">Select Category</option>
            <option value="Fashion">Fashion</option>
            <option value="Technology">Technology</option>
            <option value="Travel">Travel</option>
            <option value="Food">Food</option>
            <option value="Fitness">Fitness</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="subcategory">
            Subcategory
          </label>
          <input
            type="text"
            id="subcategory"
            name="subcategory"
            value={formData.subcategory}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="E.g., Web Development"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bio">
            Description
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows={3}
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="rating">
            Rating (0-5)
          </label>
          <input
            type="number"
            id="rating"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            min="0"
            max="5"
            step="0.1"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-blue-300"
          >
            {loading ? 'Saving...' : 'Save to MongoDB'}
          </button>
        </div>
      </form>
      
      {dbResponse && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Database Response:</h3>
          <div className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
            <pre className="text-xs">{JSON.stringify(dbResponse, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}