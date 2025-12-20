import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Loader2, Save, X } from 'lucide-react';
import { api } from '../lib/api';
import { Request, User } from '../types';
import { requestCreateSchema } from '../lib/schemas';

interface EditRequestProps {
  requests: Request[];
  currentUser: User | null;
  onRequestUpdated?: () => void;
}

export const EditRequest: React.FC<EditRequestProps> = ({ requests, currentUser, onRequestUpdated }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const request = requests.find(r => r.id === id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    budgetMin: '',
    budgetMax: '',
    deadline: '',
    location: '',
    imageUrl: '',
  });

  // Initialize form with existing request data
  useEffect(() => {
    if (request) {
      setFormData({
        title: request.title,
        category: request.category,
        description: request.description,
        budgetMin: request.budgetMin.toString(),
        budgetMax: request.budgetMax.toString(),
        deadline: request.deadline,
        location: request.location,
        imageUrl: request.imageUrl,
      });
    }
  }, [request]);

  if (!request) {
    return (
      <div className="min-h-screen bg-offWhite flex flex-col items-center justify-center p-4">
        <X className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Request Not Found</h2>
        <Link to="/dashboard" className="text-softTeal mt-4 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Check if current user is the request creator
  const isOwner = currentUser?.id === request.postedBy.id;

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-offWhite flex flex-col items-center justify-center p-4">
        <X className="h-16 w-16 text-red-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Access Denied</h2>
        <p className="text-gray-600 mt-2">You can only edit your own requests.</p>
        <Link to={`/request/${request.id}`} className="text-softTeal mt-4 hover:underline">
          View Request
        </Link>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!formData.title || !formData.category || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    const budgetMin = Number(formData.budgetMin);
    const budgetMax = Number(formData.budgetMax);

    if (budgetMin <= 0 || budgetMax <= 0 || budgetMin > budgetMax) {
      alert('Please enter valid budget amounts (min must be less than max)');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.requests.update(request.id, {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        budgetMin: budgetMin,
        budgetMax: budgetMax,
        deadline: formData.deadline,
        location: formData.location,
        imageUrl: formData.imageUrl,
      });

      onRequestUpdated?.();
      alert('Request updated successfully!');
      navigate(`/request/${request.id}`);
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Failed to update request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const CATEGORIES = [
    'Business & Office',
    'Vehicles & Transport',
    'Fashion & Accessories',
    'Electronics & Gadgets',
    'Tools & Hardware',
    'Home & Living',
    'Health & Medicine',
    'Professional Services',
  ];

  return (
    <div className="bg-offWhite min-h-screen pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/request/${request.id}`)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Request</h1>
              <p className="text-gray-600 mt-1">Update your request details below</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Request Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="What are you looking for?"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-softTeal focus:outline-none transition-all"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-softTeal focus:outline-none transition-all"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              placeholder="Describe what you're looking for in detail..."
              rows={6}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-softTeal focus:outline-none transition-all"
            />
          </div>

          {/* Budget */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Min Budget (UGX) *</label>
              <input
                type="number"
                name="budgetMin"
                value={formData.budgetMin}
                onChange={handleInputChange}
                required
                placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-softTeal focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Max Budget (UGX) *</label>
              <input
                type="number"
                name="budgetMax"
                value={formData.budgetMax}
                onChange={handleInputChange}
                required
                placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-softTeal focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Where do you need this?"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-softTeal focus:outline-none transition-all"
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Deadline</label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-softTeal focus:outline-none transition-all"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Image URL</label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-softTeal focus:outline-none transition-all"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(`/request/${request.id}`)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-deepBlue text-white rounded-lg font-bold hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
