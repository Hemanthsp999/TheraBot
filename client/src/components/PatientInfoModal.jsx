import React, { useState, useEffect } from "react";
import axios from "axios";

const PatientInfoModal = ({ isOpen, onClose, onSubmit, userId }) => {
  const [formData, setFormData] = useState({
    health_history: "",
    curr_medications: "",
    family_history: "",
    present_health_issue: "",
  });

  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setErrors({});
      setApiError(null);
      calculateProgress();
    }
  }, [isOpen]);

  // Calculate completion progress
  const calculateProgress = () => {
    const fields = Object.keys(formData);
    const filledFields = fields.filter(
      (field) => formData[field].trim() !== "",
    );
    const percentage = (filledFields.length / fields.length) * 100;
    setProgress(percentage);
  };

  useEffect(() => {
    calculateProgress();
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateField = (name, value) => {
    if (value.trim() === "") {
      setErrors((prev) => ({ ...prev, [name]: "This field is required" }));
      return false;
    }
    return true;
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    Object.keys(formData).forEach((field) => {
      if (field === getFieldNameForStep(step)) {
        if (!validateField(field, formData[field])) {
          isValid = false;
          newErrors[field] = "This field is required";
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const getFieldNameForStep = (stepNumber) => {
    const fields = [
      "health_history",
      "curr_medications",
      "family_history",
      "present_health_issue",
    ];
    return fields[stepNumber - 1];
  };

  const getFieldLabelForStep = (stepNumber) => {
    const labels = [
      "Health History",
      "Current Medications",
      "Family History",
      "Present Health Issues",
    ];
    return labels[stepNumber - 1];
  };

  const handleNext = () => {
    if (validateForm()) {
      setStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFormSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      // Get token from localStorage
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setApiError("Authentication token not found. Please log in again.");
        setIsSubmitting(false);
        return;
      }

      const response = await axios.post(
        `http://127.0.0.1:8000/api/post_health_history?user_id=${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("API Response:", response.data);
      //onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setApiError(
          `Error: ${error.response.data.error || error.response.statusText || "Server error"}`,
        );
      } else if (error.request) {
        // The request was made but no response was received
        setApiError(
          "No response received from server. Please check your connection.",
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        setApiError(`Error: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentField = () => {
    const fieldName = getFieldNameForStep(step);
    const fieldLabel = getFieldLabelForStep(step);

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {fieldLabel}
        </label>
        <textarea
          name={fieldName}
          rows="5"
          placeholder={`Please enter your ${fieldLabel.toLowerCase()}...`}
          className={`w-full border ${errors[fieldName] ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          value={formData[fieldName]}
          onChange={handleChange}
          onBlur={(e) => validateField(e.target.name, e.target.value)}
        />
        {errors[fieldName] && (
          <p className="text-red-500 text-xs mt-1">{errors[fieldName]}</p>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Patient Health Information
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* API Error message */}
        {apiError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
            {apiError}
          </div>
        )}

        {/* Steps indicator */}
        <div className="flex justify-between mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex items-center justify-center w-8 h-8 rounded-full cursor-pointer transition-colors ${
                s === step
                  ? "bg-blue-600 text-white"
                  : s < step
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-600"
              }`}
              onClick={() => setStep(s)}
            >
              {s < step ? "✓" : s}
            </div>
          ))}
        </div>

        {/* Current field */}
        <div className="mb-6 text-black">{getCurrentField()}</div>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          <button
            className={`px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors ${
              step === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handlePrevious}
            disabled={step === 1 || isSubmitting}
          >
            Previous
          </button>

          <div className="flex space-x-3">
            <button
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            {step < 4 ? (
              <button
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                onClick={handleNext}
                disabled={isSubmitting}
              >
                Next
              </button>
            ) : (
              <button
                className={`px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center ${
                  isSubmitting ? "opacity-75 cursor-wait" : ""
                }`}
                onClick={handleFormSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientInfoModal;
