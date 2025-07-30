'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "../layout/Header";
import { Footer } from "../layout/Footer";
import { useLocalStorage } from "../../hooks/useLocalStorage";

interface Question {
  question: string;
  type: "multiple_choice";
  options: string[];
}

interface CustomQuestion {
  text: string;
  isConfirmed: boolean;
}

export const CreatorRequirements = () => {
  const router = useRouter();
  const [formData, setFormData] = useLocalStorage("creator-requirements", {
    fiverr_questions: [
      {
        question: "If you're ordering for a business, what's your industry?",
        type: "multiple_choice",
        options: ["3D design", "e-commerce", "accounting", "marketing", "etc."],
      },
      {
        question: "Is this order part of a bigger project you're working on?",
        type: "multiple_choice",
        options: [
          "Building a mobile app",
          "creating an animation",
          "developing a game",
          "etc.",
        ],
      },
    ] as Question[],
    custom_questions: [] as CustomQuestion[],
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/gallery");
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      custom_questions: [
        ...formData.custom_questions,
        { text: "", isConfirmed: false },
      ],
    });
  };

  const handleSave = () => {
    localStorage.setItem("creator-requirements", JSON.stringify(formData));
    alert("Progress saved successfully!");
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="bg-gray-50 border-b">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-20">
            <div className="flex items-center space-x-8 flex-1">
              {[
                { label: "Overview", step: 1, status: "completed" },
                { label: "Pricing", step: 2, status: "completed" },
                { label: "Description", step: 3, status: "completed" },
                { label: "Requirements", step: 4, status: "current" },
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
                onClick={() => {
                  handleSubmit({ preventDefault: () => {} } as React.FormEvent);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors rounded-md hover:bg-gray-50 whitespace-nowrap"
                type="button"
              >
                Save & Preview
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-xl font-semibold mb-2">
            Get all the information you need from buyers to get started
          </h1>
          <p className="text-gray-600 text-sm">
            Add questions to help buyers provide you with exactly what you need
            to start working on their order
          </p>
        </div>

        {/* Fiverr Questions Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-gray-700 font-medium">FIVERR QUESTIONS</h2>
            <div
              className="text-gray-400 cursor-help"
              title="These optional questions will be added for all buyers"
            >
              ⓘ
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-4">
            These optional questions will be added for all buyers.
          </p>

          {formData.fiverr_questions.map((question: Question, index: number) => (
            <div key={index} className="border rounded-lg p-4 mb-4">
              <div className="bg-gray-50 text-xs text-gray-600 px-2 py-1 rounded inline-block mb-2">
                MULTIPLE CHOICE
              </div>
              <div className="text-gray-800 mb-2">
                {index + 1}. {question.question}
              </div>
              <div className="text-gray-500 text-sm">
                {question.options.join(", ")}
              </div>
            </div>
          ))}
        </div>

        {/* Your Questions Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-gray-700 font-medium">YOUR QUESTIONS</h2>
          </div>
          <p className="text-gray-500 text-sm mb-4">
            Here's where you can request any details needed to complete the
            order. There's no need to repeat any of the general questions asked
            above by Fiverr.
          </p>

          {formData.custom_questions.map((question: CustomQuestion, index: number) => (
            <div key={index} className="border rounded-lg p-4 mb-4">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={question.text}
                    onChange={(e) => {
                      const newQuestions = [...formData.custom_questions];
                      newQuestions[index].text = e.target.value;
                      setFormData({
                        ...formData,
                        custom_questions: newQuestions,
                      });
                    }}
                    placeholder="Add a Question"
                    className="w-full border-0 border-b border-dashed focus:ring-0 px-0 text-gray-800"
                    disabled={question.isConfirmed}
                  />
                </div>
                <div className="flex items-center gap-2">
                  {!question.isConfirmed ? (
                    <button
                      onClick={() => {
                        const newQuestions = [...formData.custom_questions];
                        newQuestions[index].isConfirmed = true;
                        setFormData({
                          ...formData,
                          custom_questions: newQuestions,
                        });
                      }}
                      className="p-2 text-[#1dbf73] hover:bg-green-50 rounded-lg transition-colors"
                      title="Confirm Question"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          const newQuestions = [...formData.custom_questions];
                          newQuestions[index].isConfirmed = false;
                          setFormData({
                            ...formData,
                            custom_questions: newQuestions,
                          });
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Question"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          const newQuestions = formData.custom_questions.filter(
                            (_: CustomQuestion, i: number) => i !== index
                          );
                          setFormData({
                            ...formData,
                            custom_questions: newQuestions,
                          });
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove Question"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Add Question Button */}
          <button
            onClick={addQuestion}
            className="w-full border-2 border-dashed border-[#1dbf73] rounded-lg p-4 text-[#1dbf73] hover:bg-[#1dbf73]/5 transition-colors flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add New Question
          </button>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-[#1dbf73] text-white rounded-lg hover:bg-[#19a463]"
          >
            Save & Continue
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};
