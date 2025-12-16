
import React, { useState, useRef } from 'react';
import { 
  Image as ImageIcon, UploadCloud, Loader2, ChevronLeft, Check, 
  Briefcase, Car, Shirt, Smartphone, Hammer, Home as HomeIcon, 
  Heart, CheckCircle, MapPin, DollarSign, Eye, Calendar, ArrowRight, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { User } from '../types';
import { requestCreateSchema } from '../lib/schemas';
import { useRequestImageUpload } from '../hooks/useRequestImageUpload';

interface PostRequestProps {
  currentUser: User;
  onPostSuccess: () => void;
}

const CATEGORIES = [
  { name: 'Business & Office', icon: Briefcase, color: '#2563EB' },
  { name: 'Vehicles & Transport', icon: Car, color: '#EA580C' },
  { name: 'Fashion & Accessories', icon: Shirt, color: '#DB2777' },
  { name: 'Electronics & Gadgets', icon: Smartphone, color: '#06B6D4' },
  { name: 'Tools & Hardware', icon: Hammer, color: '#6B7280' },
  { name: 'Home & Living', icon: HomeIcon, color: '#16A34A' },
  { name: 'Health & Medicine', icon: Heart, color: '#DC2626' },
  { name: 'Professional Services', icon: CheckCircle, color: '#7C3AED' },
];

export const PostRequest: React.FC<PostRequestProps> = ({ currentUser, onPostSuccess }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const fileUploadRef = useRef<HTMLInputElement>(null);
  const { uploadImage, deleteImage, isUploading, uploadError } = useRequestImageUpload(currentUser?.id || null);

  // Comprehensive Form State
  const [formData, setFormData] = useState({
    // Step 1
    category: '',
    // Step 2
    title: '',
    description: '',
    condition: 'New', // New, Like New, Used, Doesn't Matter
    urgency: 'Standard', // Today, 2-3 days, Not urgent
    images: [] as string[], // For mock, we'll store dummy URLs or base64
    // Step 3 (Specs - Dynamic)
    brand: '',
    model: '',
    color: '',
    storage: '',
    accessories: '',
    additionalNotes: '',
    // Step 4
    budgetType: 'range', // 'range' or 'fixed'
    budgetMin: '',
    budgetMax: '',
    budgetFixed: '',
    isNegotiable: false,
    isOpenToOffers: true,
    // Step 5
    locationType: 'manual',
    location: '',
    deliveryPreference: 'delivery', // delivery, pickup, both
    // Step 6
    visibility: 'everyone', // everyone, top-rated, nearby
  });

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const nextStep = () => {
    if (step === 1 && !formData.category) return alert("Please select a category.");
    if (step === 2 && !formData.title) return alert("Please enter a title.");
    if (step === 2 && !formData.description) return alert("Please enter a description.");
    
    setStep(step + 1);
    scrollToTop();
  };

  const prevStep = () => {
    setStep(step - 1);
    scrollToTop();
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAutoDetectLocation = () => {
    // Simulate geolocation API
    updateField('location', 'Locating...');
    setTimeout(() => {
      updateField('location', 'Kampala, Uganda (Current Location)');
      updateField('locationType', 'auto');
    }, 1000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const result = await uploadImage(file);
      if (result) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, result.url]
        }));
      } else if (uploadError) {
        alert(uploadError);
      }
    }
  };

  const removeImage = (index: number) => {
      setFormData(prev => ({
          ...prev,
          images: prev.images.filter((_, i) => i !== index)
      }));
  }

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
        // Map complex form data to the simple API structure
        const budgetMin = formData.budgetType === 'fixed' ? Number(formData.budgetFixed) : Number(formData.budgetMin);
        const budgetMax = formData.budgetType === 'fixed' ? Number(formData.budgetFixed) : Number(formData.budgetMax);
        
        // Calculate deadline based on urgency
        const today = new Date();
        let deadlineDate = new Date();
        if (formData.urgency === 'Today') deadlineDate.setDate(today.getDate() + 1);
        else if (formData.urgency === '2-3 Days') deadlineDate.setDate(today.getDate() + 3);
        else deadlineDate.setDate(today.getDate() + 14); // Standard

        // Combine specs into description for the simple backend
        let fullDescription = `${formData.description}\n\nCondition: ${formData.condition}\nUrgency: ${formData.urgency}`;
        if (formData.category === 'Electronics & Gadgets') {
            fullDescription += `\n\nSpecs:\nBrand: ${formData.brand}\nModel: ${formData.model}\nColor: ${formData.color}\nStorage: ${formData.storage}`;
        }
        if (formData.additionalNotes) fullDescription += `\nNotes: ${formData.additionalNotes}`;

        const requestData = {
            title: formData.title,
            category: formData.category,
            description: fullDescription,
            budgetMin: budgetMin || 0,
            budgetMax: budgetMax || 0,
            deadline: deadlineDate.toISOString().split('T')[0],
            location: formData.location,
            imageUrl: formData.images.length > 0 ? formData.images[0] : undefined
        };

        // Validate using zod schema
        const validation = requestCreateSchema.safeParse(requestData);
        if (!validation.success) {
            alert(validation.error.issues[0]?.message || 'Invalid input');
            setIsSubmitting(false);
            return;
        }

        await api.requests.create(requestData, currentUser);
        
        onPostSuccess();
        setStep(8); // Success Step
        scrollToTop();
    } catch (error) {
        console.error("Failed to post", error);
        alert("Failed to post request");
    } finally {
        setIsSubmitting(false);
    }
  };

  // --- RENDER STEPS ---

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-deepBlue text-center">What do you want us to find for you?</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            onClick={() => {
              updateField('category', cat.name);
              // Small timeout to visualize selection then move next
              setTimeout(() => {
                setStep(2);
                scrollToTop();
              }, 200);
            }}
            className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
              formData.category === cat.name 
              ? 'border-softTeal bg-blue-50 shadow-md' 
              : 'border-gray-100 bg-white hover:border-softTeal hover:shadow-sm'
            }`}
          >
            <cat.icon 
              className="h-8 w-8 mb-3" 
              style={{ color: formData.category === cat.name ? '#3A7CA5' : cat.color }} 
            />
            <span className={`font-medium text-center text-sm ${formData.category === cat.name ? 'text-deepBlue font-bold' : 'text-gray-600'}`}>
              {cat.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-deepBlue">Item Details</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
        <input 
          type="text" 
          value={formData.title}
          onChange={e => updateField('title', e.target.value)}
          className="w-full border-gray-300 border rounded-lg px-4 py-3 focus:ring-2 focus:ring-softTeal focus:outline-none bg-[#F3F4F6]" 
          placeholder="e.g. iPhone 13 Pro – Blue – 128GB" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
        <textarea 
          rows={4} 
          value={formData.description}
          onChange={e => updateField('description', e.target.value)}
          className="w-full border-gray-300 border rounded-lg px-4 py-3 focus:ring-2 focus:ring-softTeal focus:outline-none bg-[#F3F4F6]" 
          placeholder="Describe exactly what you need. Include features, year, specific requirements..."
        ></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
           <select 
             value={formData.condition}
             onChange={e => updateField('condition', e.target.value)}
             className="w-full border-gray-300 border rounded-lg px-4 py-3 focus:ring-2 focus:ring-softTeal focus:outline-none bg-[#F3F4F6]"
           >
             <option>New</option>
             <option>Like New</option>
             <option>Used (Good)</option>
             <option>Used (Fair)</option>
             <option>Doesn't Matter</option>
           </select>
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Urgency Level</label>
           <select 
             value={formData.urgency}
             onChange={e => updateField('urgency', e.target.value)}
             className="w-full border-gray-300 border rounded-lg px-4 py-3 focus:ring-2 focus:ring-softTeal focus:outline-none bg-[#F3F4F6]"
           >
             <option value="Today">Need it today</option>
             <option value="2-3 Days">Need it in 2-3 days</option>
             <option value="Standard">Standard (Not urgent)</option>
           </select>
        </div>
      </div>

      <div>
         <label className="block text-sm font-medium text-gray-700 mb-1">Photos (Optional)</label>
         <div 
            onClick={() => !isUploading && fileUploadRef.current?.click()}
            className={`border-2 border-dashed border-gray-300 rounded-xl p-8 text-center transition-colors bg-[#F3F4F6] ${isUploading ? 'opacity-50 cursor-wait' : 'hover:bg-gray-50 cursor-pointer'}`}
         >
           {isUploading ? (
             <>
               <Loader2 className="h-10 w-10 text-softTeal mx-auto mb-3 animate-spin" />
               <p className="text-gray-600">Uploading image...</p>
             </>
           ) : (
             <>
               <UploadCloud className="h-10 w-10 text-gray-400 mx-auto mb-3" />
               <p className="text-gray-600">Drag and drop images here, or <span className="text-softTeal font-semibold">browse</span></p>
               <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
             </>
           )}
           <input 
              type="file" 
              ref={fileUploadRef}
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload} 
            />
         </div>
         {formData.images.length > 0 && (
            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-4">
                {formData.images.map((img, idx) => (
                    <div key={idx} className="relative h-24 w-24 rounded-lg overflow-hidden border border-gray-200 group">
                        <img src={img} alt="Upload" className="h-full w-full object-cover" />
                        <button 
                            onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                            className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                ))}
            </div>
         )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-deepBlue">Specifications</h2>
      <p className="text-gray-500 text-sm">Add specific details for {formData.category}</p>

      {formData.category === 'Electronics & Gadgets' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <input type="text" value={formData.brand} onChange={e => updateField('brand', e.target.value)} placeholder="e.g. Apple, Sony" className="w-full border-gray-300 border rounded-lg px-4 py-3 focus:ring-2 focus:ring-softTeal focus:outline-none bg-[#F3F4F6]" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <input type="text" value={formData.model} onChange={e => updateField('model', e.target.value)} placeholder="e.g. iPhone 13 Pro" className="w-full border-gray-300 border rounded-lg px-4 py-3 focus:ring-2 focus:ring-softTeal focus:outline-none bg-[#F3F4F6]" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input type="text" value={formData.color} onChange={e => updateField('color', e.target.value)} placeholder="e.g. Sierra Blue" className="w-full border-gray-300 border rounded-lg px-4 py-3 focus:ring-2 focus:ring-softTeal focus:outline-none bg-[#F3F4F6]" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Storage / Size</label>
                <input type="text" value={formData.storage} onChange={e => updateField('storage', e.target.value)} placeholder="e.g. 128GB" className="w-full border-gray-300 border rounded-lg px-4 py-3 focus:ring-2 focus:ring-softTeal focus:outline-none bg-[#F3F4F6]" />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Accessories Needed</label>
                <input type="text" value={formData.accessories} onChange={e => updateField('accessories', e.target.value)} placeholder="e.g. Charger, Original Box" className="w-full border-gray-300 border rounded-lg px-4 py-3 focus:ring-2 focus:ring-softTeal focus:outline-none bg-[#F3F4F6]" />
            </div>
        </div>
      ) : (
        <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Additional Specifications</label>
             <textarea 
                rows={5} 
                value={formData.additionalNotes} 
                onChange={e => updateField('additionalNotes', e.target.value)} 
                className="w-full border-gray-300 border rounded-lg px-4 py-3 focus:ring-2 focus:ring-softTeal focus:outline-none bg-[#F3F4F6]" 
                placeholder={`Enter any specific details regarding the ${formData.category} item you are looking for...`}
             ></textarea>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-8">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-deepBlue">Budget</h2>
      
      <div className="flex space-x-4 bg-[#F3F4F6] p-1 rounded-lg w-fit">
          <button 
            type="button"
            onClick={() => updateField('budgetType', 'range')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${formData.budgetType === 'range' ? 'bg-white text-deepBlue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Budget Range
          </button>
          <button 
            type="button"
            onClick={() => updateField('budgetType', 'fixed')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${formData.budgetType === 'fixed' ? 'bg-white text-deepBlue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Fixed Price
          </button>
      </div>

      {formData.budgetType === 'range' ? (
        <div className="grid grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum (UGX)</label>
                <input type="number" value={formData.budgetMin} onChange={e => updateField('budgetMin', e.target.value)} className="w-full border-gray-300 border rounded-lg px-4 py-3 focus:ring-2 focus:ring-softTeal focus:outline-none bg-[#F3F4F6]" placeholder="e.g. 100,000" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maximum (UGX)</label>
                <input type="number" value={formData.budgetMax} onChange={e => updateField('budgetMax', e.target.value)} className="w-full border-gray-300 border rounded-lg px-4 py-3 focus:ring-2 focus:ring-softTeal focus:outline-none bg-[#F3F4F6]" placeholder="e.g. 500,000" />
            </div>
        </div>
      ) : (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Budget (UGX)</label>
            <input type="number" value={formData.budgetFixed} onChange={e => updateField('budgetFixed', e.target.value)} className="w-full border-gray-300 border rounded-lg px-4 py-3 focus:ring-2 focus:ring-softTeal focus:outline-none bg-[#F3F4F6]" placeholder="e.g. 250,000" />
        </div>
      )}

      <div className="space-y-3">
          <label className="flex items-center cursor-pointer">
              <input type="checkbox" checked={formData.isNegotiable} onChange={e => updateField('isNegotiable', e.target.checked)} className="h-4 w-4 text-softTeal focus:ring-softTeal rounded border-gray-300 accent-softTeal" />
              <span className="ml-2 text-gray-700">Price is negotiable</span>
          </label>
          <label className="flex items-center cursor-pointer">
              <input type="checkbox" checked={formData.isOpenToOffers} onChange={e => updateField('isOpenToOffers', e.target.checked)} className="h-4 w-4 text-softTeal focus:ring-softTeal rounded border-gray-300 accent-softTeal" />
              <span className="ml-2 text-gray-700">Open to offers outside this range</span>
          </label>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-deepBlue">Location & Delivery</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Where should the item be found or delivered?</label>
        <div className="flex gap-2">
               <input 
                type="text" 
                value={formData.location} 
                onChange={e => updateField('location', e.target.value)} 
                placeholder="Enter City, District, or Area (e.g. Kampala, Wakiso)" 
                className="flex-1 border-gray-300 border rounded-lg px-4 py-3 focus:ring-2 focus:ring-softTeal focus:outline-none bg-[#F3F4F6]" 
              />
             <button 
               type="button"
               onClick={handleAutoDetectLocation}
               className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center whitespace-nowrap"
             >
               <MapPin className="h-4 w-4 mr-2" /> Auto-detect
             </button>
        </div>
      </div>

      <div>
         <label className="block text-sm font-medium text-gray-700 mb-3">Preferences</label>
         <div className="space-y-3">
             {['delivery', 'pickup', 'both'].map(opt => (
                 <label key={opt} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 bg-white">
                     <input 
                       type="radio" 
                       name="deliveryPref"
                       checked={formData.deliveryPreference === opt}
                       onChange={() => updateField('deliveryPreference', opt)}
                       className="h-4 w-4 text-softTeal focus:ring-softTeal accent-softTeal"
                     />
                     <span className="ml-3 capitalize text-gray-700">
                        {opt === 'both' ? 'Open to both Delivery and Pickup' : 
                         opt === 'pickup' ? 'Local Pickup Only' : 'Delivery Only'}
                     </span>
                 </label>
             ))}
         </div>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-deepBlue">Visibility Options</h2>
      <p className="text-gray-600">Who should see your request?</p>

      <div className="space-y-4">
         <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.visibility === 'everyone' ? 'border-softTeal bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
             <div className="mr-4 bg-blue-100 p-2 rounded-full text-softTeal"><Eye className="h-6 w-6" /></div>
             <div className="flex-1">
                 <div className="flex justify-between">
                    <h3 className="font-bold text-gray-900">Everyone (Recommended)</h3>
                    <input type="radio" name="vis" checked={formData.visibility === 'everyone'} onChange={() => updateField('visibility', 'everyone')} className="h-5 w-5 accent-softTeal" />
                 </div>
                 <p className="text-sm text-gray-600 mt-1">Visible to all finders in the network. Get the most offers.</p>
             </div>
         </label>

         <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.visibility === 'top-rated' ? 'border-softTeal bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
             <div className="mr-4 bg-yellow-100 p-2 rounded-full text-yellow-600"><CheckCircle className="h-6 w-6" /></div>
             <div className="flex-1">
                 <div className="flex justify-between">
                    <h3 className="font-bold text-gray-900">Top-Rated Finders First</h3>
                    <input type="radio" name="vis" checked={formData.visibility === 'top-rated'} onChange={() => updateField('visibility', 'top-rated')} className="h-5 w-5 accent-softTeal" />
                 </div>
                 <p className="text-sm text-gray-600 mt-1">Exclusive access to 5-star finders for the first 24 hours.</p>
             </div>
         </label>

         <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.visibility === 'nearby' ? 'border-softTeal bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
             <div className="mr-4 bg-green-100 p-2 rounded-full text-green-600"><MapPin className="h-6 w-6" /></div>
             <div className="flex-1">
                 <div className="flex justify-between">
                    <h3 className="font-bold text-gray-900">Nearby Finders Only</h3>
                    <input type="radio" name="vis" checked={formData.visibility === 'nearby'} onChange={() => updateField('visibility', 'nearby')} className="h-5 w-5 accent-softTeal" />
                 </div>
                 <p className="text-sm text-gray-600 mt-1">Restrict visibility to finders within 50 miles of your location.</p>
             </div>
         </label>
      </div>
    </div>
  );

  const renderStep7 = () => (
    <div className="space-y-8">
        <h2 className="text-2xl font-bold text-deepBlue border-b border-gray-200 pb-4">Review Request</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="col-span-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Title</h3>
                <p className="text-xl font-bold text-gray-900">{formData.title}</p>
            </div>
            <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Category</h3>
                <p className="text-gray-900 bg-blue-50 inline-block px-2 py-1 rounded text-sm">{formData.category}</p>
            </div>
            <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Condition & Urgency</h3>
                <p className="text-gray-900">{formData.condition} • {formData.urgency}</p>
            </div>
            <div className="col-span-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Description</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-line">{formData.description}</p>
            </div>
            {formData.images.length > 0 && (
                <div className="col-span-2">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Images</h3>
                    <div className="flex gap-4 overflow-x-auto">
                        {formData.images.map((img, idx) => (
                            <img key={idx} src={img} alt="Request" className="h-24 w-24 object-cover rounded-lg border border-gray-200" />
                        ))}
                    </div>
                </div>
            )}
            
            {/* Specs Review */}
            <div className="col-span-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Specifications</h3>
                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
                    {formData.category === 'Electronics & Gadgets' ? (
                        <div className="grid grid-cols-2 gap-2">
                            <p><span className="font-semibold">Brand:</span> {formData.brand || 'N/A'}</p>
                            <p><span className="font-semibold">Model:</span> {formData.model || 'N/A'}</p>
                            <p><span className="font-semibold">Color:</span> {formData.color || 'N/A'}</p>
                            <p><span className="font-semibold">Storage:</span> {formData.storage || 'N/A'}</p>
                            <p className="col-span-2"><span className="font-semibold">Accessories:</span> {formData.accessories || 'None'}</p>
                        </div>
                    ) : (
                        <p>{formData.additionalNotes || 'No specific notes.'}</p>
                    )}
                </div>
            </div>

            <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Budget</h3>
                <p className="text-gray-900 font-bold text-lg">
                    {formData.budgetType === 'fixed' ? `$${formData.budgetFixed}` : `$${formData.budgetMin} - $${formData.budgetMax}`}
                    {formData.isNegotiable && <span className="text-xs font-normal text-gray-500 ml-2">(Negotiable)</span>}
                </p>
            </div>
            <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Location</h3>
                <p className="text-gray-900 flex items-center"><MapPin className="h-3 w-3 mr-1 text-gray-400" /> {formData.location}</p>
            </div>
             <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Visibility</h3>
                <p className="text-gray-900 capitalize">{formData.visibility.replace('-', ' ')}</p>
            </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-lg flex items-start">
            <div className="p-1 bg-yellow-100 rounded-full mr-3 text-yellow-600"><Eye className="h-4 w-4" /></div>
            <div>
                <p className="text-sm text-yellow-800 font-medium">Ready to post?</p>
                <p className="text-xs text-yellow-700 mt-1">Once posted, finders will be notified immediately. You can edit this request later from your dashboard.</p>
            </div>
        </div>
    </div>
  );

  const renderStep8 = () => (
    <div className="text-center py-12">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Check className="h-12 w-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-deepBlue mb-4">Request Posted Successfully!</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
            Great! Your request for <span className="font-bold text-deepBlue">"{formData.title}"</span> is now live. Finders will start sending you suggestions soon.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="bg-deepBlue text-white px-8 py-3 rounded-lg font-bold hover:bg-opacity-90 shadow-lg">
                Go to Dashboard
            </button>
            <button onClick={() => navigate('/')} className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-bold hover:bg-gray-50">
                Return Home
            </button>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-offWhite py-8 md:py-12" ref={topRef}>
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {step < 8 && (
            <div className="bg-deepBlue px-8 py-6">
            <h1 className="text-2xl font-bold text-white">Post a New Request</h1>
            <p className="text-gray-300 text-sm mt-1">Step {step} of 7</p>
            </div>
        )}

        <div className="p-6 md:p-10">
          {/* Progress Bar */}
          {step < 8 && (
            <div className="mb-8">
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-softTeal transition-all duration-500 ease-out"
                        style={{ width: `${(step / 7) * 100}%` }}
                    ></div>
                </div>
            </div>
          )}

          {/* Step Content */}
          <div className="min-h-[400px]">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
            {step === 5 && renderStep5()}
            {step === 6 && renderStep6()}
            {step === 7 && renderStep7()}
            {step === 8 && renderStep8()}
          </div>

          {/* Navigation Buttons */}
          {step < 8 && (
            <div className="pt-8 mt-8 border-t border-gray-100 flex justify-between items-center">
                {step > 1 ? (
                    <button 
                        onClick={prevStep}
                        className="flex items-center text-gray-600 font-semibold hover:text-deepBlue px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5 mr-1" /> Back
                    </button>
                ) : (
                    <div></div> 
                )}

                {step < 7 ? (
                    <button 
                        onClick={nextStep}
                        className="bg-deepBlue text-white px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center"
                    >
                        Next Step <ArrowRight className="h-5 w-5 ml-2" />
                    </button>
                ) : (
                    <button 
                        onClick={handleFinalSubmit}
                        disabled={isSubmitting}
                        className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Check className="h-5 w-5 mr-2" />}
                        Confirm & Post
                    </button>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
