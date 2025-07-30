'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Header } from "../layout/Header";
import { Footer } from "../layout/Footer";
import { useLocalStorage } from "../../hooks/useLocalStorage";

export const CreateCreatorProfile = () => {
  const router = useRouter();
  const [formData, setFormData] = useLocalStorage("creator-profile", {
    title: "",
    category: "",
    subcategory: "",
    searchTags: [] as string[],
    keywords: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Update handleSubmit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/pricing");
  };

  // Update back button navigation
  <button
    type="button"
    onClick={() => router.back()}
    className="px-6 py-2 text-gray-600 hover:text-gray-900"
  >
    Back
  </button>
  const handleSave = () => {
    // Save current form data
    localStorage.setItem("creator-profile", JSON.stringify(formData));

    // Show success message
    alert("Progress saved successfully!");
  };

  const handleSaveAndPreview = () => {
    // First save the data
    localStorage.setItem("creator-profile", JSON.stringify(formData));

    // Create preview URL with current data
    const previewUrl = `/preview?data=${encodeURIComponent(
      JSON.stringify(formData)
    )}`;

    // Open preview in new tab
    window.open(previewUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Progress Bar */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-20">
            <div className="flex items-center space-x-8 flex-1">
              {[
                { label: "Overview", step: 1, status: "current" },
                { label: "Pricing", step: 2, status: "upcoming" },
                { label: "Description", step: 3, status: "upcoming" },
                { label: "Requirements", step: 4, status: "upcoming" },
                { label: "Gallery", step: 5, status: "upcoming" },
                { label: "Linking", step: 6, status: "upcoming" },
                { label: "Publish", step: 7, status: "upcoming" },
              ].map((step) => (
                <div key={step.label} className="flex items-center space-x-2">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-sm
                    ${
                      step.status === "completed"
                        ? "bg-[#1dbf73] text-white"
                        : step.status === "current"
                        ? "bg-[#1dbf73] text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {step.status === "completed" ? "✓" : step.step}
                  </div>
                  <span
                    className={
                      step.status === "current"
                        ? "text-gray-900 font-medium"
                        : step.status === "completed"
                        ? "text-gray-600"
                        : "text-gray-400"
                    }
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
            {/* Save Options */}
            <div className="flex items-center gap-6 flex-shrink-0">
              <button
                onClick={handleSave}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors rounded-md hover:bg-gray-50"
                type="button"
              >
                Save
              </button>
              <div className="w-px h-6 bg-gray-200"></div>
              <button
                onClick={handleSaveAndPreview}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors rounded-md hover:bg-gray-50 whitespace-nowrap"
                type="button"
              >
                Save & Preview
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">
            Start Defining Your Creator Profile
          </h1>
          <p className="text-gray-600 mb-8">
            Tell us a bit about what you do. This information will appear on
            your public profile.
          </p>

          {/* Steps Section */}
          <div className="flex flex-wrap gap-4 mb-12">
            {[
              { label: "Overview", step: 1, status: "current" },
              { label: "Pricing", step: 2, status: "upcoming" },
              { label: "Description", step: 3, status: "upcoming" },
              { label: "Requirements", step: 4, status: "upcoming" },
              { label: "Gallery", step: 5, status: "upcoming" },
              { label: "Linking", step: 6, status: "upcoming" },
              { label: "Publish", step: 7, status: "upcoming" },
            ].map((step) => (
              <div
                key={step.label}
                className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                  step.status === "current"
                    ? "bg-[#1dbf73] bg-opacity-10 text-[#1dbf73]"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <span className="text-sm font-medium">{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Creator Title*
            </label>
            <input
              type="text"
              placeholder="I will do something I'm really good at"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              maxLength={80}
            />
            <div className="mt-1 text-sm text-gray-500 flex justify-end">
              {formData.title.length}/80 max
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category*
            </label>
            <div className="grid grid-cols-2 gap-4">
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">SELECT A CATEGORY</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="fashion">Fashion & Beauty</option>
                <option value="tech">Technology</option>
                <option value="food">Food & Cooking</option>
                <option value="fitness">Fitness & Health</option>
              </select>
              <select
                value={formData.subcategory}
                onChange={(e) =>
                  setFormData({ ...formData, subcategory: e.target.value })
                }
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">SELECT A SUBCATEGORY</option>
                <option value="vlog">Vlogging</option>
                <option value="review">Product Reviews</option>
                <option value="howto">How-to & Tutorials</option>
                <option value="entertainment">Entertainment</option>
              </select>
            </div>
          </div>

          {/* Search Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Tags*
            </label>
            <input
              type="text"
              placeholder="Enter search terms you feel your buyers will use when looking for your service"
              value={formData.keywords}
              onChange={(e) =>
                setFormData({ ...formData, keywords: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              5 tags maximum. Use letters and numbers only.
            </p>
          </div>

          {/* Tips Section */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Tips for getting started:</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Create a catchy title that fits your niche</li>
              <li>• Choose a category that best represents your content</li>
              <li>• Add relevant tags to help buyers find your profile</li>
              <li>• Be specific about what makes your content unique</li>
            </ul>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 text-gray-600 hover:text-gray-900"
            >
              Back
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-[#1dbf73] text-white rounded-md font-medium hover:bg-[#19a463] transition-colors"
            >
              Save & Continue
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};
