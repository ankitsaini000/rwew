import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Sparkles } from 'lucide-react';
import { getCategories, getMarketingCampaignTypes } from '../../services/api';

interface BrandSignupPopupProps {
  isOpen: boolean;
  onClose: () => void;
  isSignedIn: boolean;
  onSubmit: (data: any) => void;
}

const industries = [
  'Fashion', 'Tech', 'Food', 'Travel', 'Fitness', 'Beauty', 'Education', 'Finance', 'Other',
];
const categories = [
  'Influencer Marketing', 'Content Creation', 'Product Review', 'Event Collaboration', 'Other',
];
const marketingInterests = [
  'Brand Awareness', 'Lead Generation', 'Sales', 'Engagement', 'App Downloads', 'Other',
];
const platforms = [
  'Instagram', 'YouTube', 'TikTok', 'Facebook', 'Twitter', 'LinkedIn', 'Other',
];

export const BrandSignupPopup: React.FC<BrandSignupPopupProps> = ({ isOpen, onClose, isSignedIn, onSubmit }) => {
  const [signupData, setSignupData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formData, setFormData] = useState({
    category: '',
    marketingCampaignType: '',
    brandValues: '',
    marketingInterests: [] as string[],
    physicalAppearance: '', // 'yes' or 'no'
    campaignRequirements: '',
    targetAudience: '',
    targetAgeRanges: [] as string[],
    targetGenders: [] as string[],
    socialMediaPreferences: [] as string[],
    budgetMin: '',
    budgetMax: '',
  });
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<{ name: string; subcategories?: { name: string }[] }[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [marketingCampaignTypes, setMarketingCampaignTypes] = useState<{ name: string }[]>([]);
  const [marketingCampaignTypesLoading, setMarketingCampaignTypesLoading] = useState(true);
  const [marketingCampaignTypesError, setMarketingCampaignTypesError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked
          ? [...(prev as any)[name], value]
          : (prev as any)[name].filter((v: string) => v !== value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!isSignedIn) {
      if (!signupData.fullName || !signupData.companyName || !signupData.email || !signupData.password || !signupData.confirmPassword) {
        setError('Please fill all signup fields.');
        return;
      }
      if (signupData.password !== signupData.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }
    onSubmit({ ...signupData, ...formData });
  };

  // Progress calculation
  const totalFields = 9 + (isSignedIn ? 0 : 5);
  const filledFields = [
    formData.category,
    formData.marketingCampaignType,
    formData.brandValues,
    formData.physicalAppearance,
    formData.campaignRequirements,
    formData.targetAudience,
    formData.budgetMin,
    formData.budgetMax,
    ...(formData.marketingInterests.length ? ['x'] : []),
    ...(formData.socialMediaPreferences.length ? ['x'] : []),
    ...(!isSignedIn ? [signupData.fullName, signupData.companyName, signupData.email, signupData.password, signupData.confirmPassword] : []),
  ].filter(Boolean).length;
  const progress = Math.round((filledFields / totalFields) * 100);

  useEffect(() => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    getCategories()
      .then((cats) => setCategories(cats))
      .catch(() => setCategoriesError('Failed to load categories'))
      .finally(() => setCategoriesLoading(false));

    setMarketingCampaignTypesLoading(true);
    setMarketingCampaignTypesError(null);
    getMarketingCampaignTypes()
      .then((types) => setMarketingCampaignTypes(types))
      .catch(() => setMarketingCampaignTypesError('Failed to load marketing campaign types'))
      .finally(() => setMarketingCampaignTypesLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-900/80 via-purple-700/80 to-pink-500/80 p-2 sm:p-4">
      <div className="w-full max-w-xl h-[95vh] overflow-y-auto relative animate-fadeIn rounded-2xl shadow-2xl border border-purple-100 bg-white">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-t-2xl overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-purple-400 hover:text-purple-700 p-2 rounded-full hover:bg-purple-100 transition-colors text-2xl z-10">&times;</button>
        <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 px-8 py-3 rounded-t-2xl flex flex-col items-center text-center">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg text-purple-600 text-2xl mb-2 border-4 border-purple-200">
            <Sparkles className="w-7 h-7 text-purple-400" />
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2 drop-shadow-lg mb-1">
            Help Us Find Your Best Match!
          </h2>
          <p className="text-purple-100 text-sm mt-1 font-medium drop-shadow max-w-xs">
            Tell us about your brand and campaign needs so we can recommend the best creators for you.
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-8 py-3 space-y-4">
            {/* Brand Info Section */}
            {!isSignedIn && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2 text-base">Brand Info</h3>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" name="fullName" value={signupData.fullName} onChange={handleSignupChange} required />
                  </div>
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input id="companyName" name="companyName" value={signupData.companyName} onChange={handleSignupChange} required />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" value={signupData.email} onChange={handleSignupChange} required />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" value={signupData.password} onChange={handleSignupChange} required />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" value={signupData.confirmPassword} onChange={handleSignupChange} required />
                  </div>
                </div>
                <div className="my-4 border-t border-gray-200" />
              </div>
            )}
            {/* Campaign Details Section */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2 text-base">Campaign Details</h3>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="marketingCampaignType">Marketing Campaign Type</Label>
                  {marketingCampaignTypesLoading ? (
                    <div className="text-gray-500 text-sm py-2">Loading campaign types...</div>
                  ) : marketingCampaignTypesError ? (
                    <div className="text-red-500 text-sm py-2">{marketingCampaignTypesError}</div>
                  ) : (
                    <select
                      id="marketingCampaignType"
                      name="marketingCampaignType"
                      value={formData.marketingCampaignType || ''}
                      onChange={handleFormChange}
                      className="w-full border rounded-md p-2"
                    >
                      <option value="">Select Marketing Campaign Type</option>
                      {marketingCampaignTypes.map((type) => (
                        <option key={type.name} value={type.name}>{type.name}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  {categoriesLoading ? (
                    <div className="text-gray-500 text-sm py-2">Loading categories...</div>
                  ) : categoriesError ? (
                    <div className="text-red-500 text-sm py-2">{categoriesError}</div>
                  ) : (
                    <select id="category" name="category" value={formData.category} onChange={handleFormChange} className="w-full border rounded-md p-2">
                      <option value="">Select Category</option>
                      {categories.map((cat) => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
                    </select>
                  )}
                </div>
                <div>
                  <Label htmlFor="brandValues">Brand Values</Label>
                  <Input id="brandValues" name="brandValues" value={formData.brandValues} onChange={handleFormChange} placeholder="e.g. Sustainability, Innovation" />
                </div>
                <div>
                  <Label>Marketing Interests</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {marketingInterests.map((interest) => (
                      <label key={interest} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          name="marketingInterests"
                          value={interest}
                          checked={formData.marketingInterests.includes(interest)}
                          onChange={handleFormChange}
                          className="accent-purple-600"
                        />
                        {interest}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Do you require physical appearance?</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="physicalAppearance"
                        value="yes"
                        checked={formData.physicalAppearance === 'yes'}
                        onChange={handleFormChange}
                        required
                        className="accent-purple-600"
                      />
                      Yes
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="physicalAppearance"
                        value="no"
                        checked={formData.physicalAppearance === 'no'}
                        onChange={handleFormChange}
                        required
                        className="accent-purple-600"
                      />
                      No
                    </label>
                  </div>
                </div>
                <div>
                  <Label htmlFor="campaignRequirements">Campaign Requirements</Label>
                  <textarea id="campaignRequirements" name="campaignRequirements" value={formData.campaignRequirements} onChange={handleFormChange} className="w-full border rounded-md p-2" rows={2} placeholder="Describe your campaign needs, deliverables, etc." />
                </div>
                <div>
                  <Label>Target Audience Age Range</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {['13-17', '18-24', '25-34', '35-44', '45-54', '55+'].map((age) => (
                      <label key={age} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          name="targetAgeRanges"
                          value={age}
                          checked={formData.targetAgeRanges.includes(age)}
                          onChange={handleFormChange}
                          className="accent-purple-600"
                        />
                        {age}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Target Audience Gender</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {['Male', 'Female', 'Other'].map((gender) => (
                      <label key={gender} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          name="targetGenders"
                          value={gender}
                          checked={formData.targetGenders.includes(gender)}
                          onChange={handleFormChange}
                          className="accent-purple-600"
                        />
                        {gender}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Social Media Preferences</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {platforms.map((platform) => (
                      <label key={platform} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          name="socialMediaPreferences"
                          value={platform}
                          checked={formData.socialMediaPreferences.includes(platform)}
                          onChange={handleFormChange}
                          className="accent-purple-600"
                        />
                        {platform}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="budgetMin">Budget Min (₹)</Label>
                    <Input id="budgetMin" name="budgetMin" type="number" value={formData.budgetMin} onChange={handleFormChange} placeholder="₹ Min" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="budgetMax">Budget Max (₹)</Label>
                    <Input id="budgetMax" name="budgetMax" type="number" value={formData.budgetMax} onChange={handleFormChange} placeholder="₹ Max" />
                  </div>
                </div>
              </div>
            </div>
            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
            <div className="flex justify-end gap-4 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="min-w-[100px]">Cancel</Button>
              <Button type="submit" className="min-w-[120px] bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold shadow-lg hover:from-purple-700 hover:to-pink-600 transition-all text-base py-2">Submit</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}; 