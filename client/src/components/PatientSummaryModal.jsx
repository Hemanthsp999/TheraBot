import { useState, useEffect, useRef } from "react";
import {
  X,
  FileText,
  Printer,
  ChevronUp,
  ChevronDown,
  Loader,
  User,
  Calendar,
  PenLine,
} from "lucide-react";

const PatientSummaryWidget = ({
  isOpen,
  onClose,
  patientId,
  patientName,
  position = "bottom-right",
}) => {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef(null);

  // Determine position classes
  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
  };

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!isOpen || !patientId) return;

      setLoading(true);
      setError(null);

      try {
        const access_token = localStorage.getItem("accessToken");
        const response = await fetch(
          `http://127.0.0.1:8000/api/summarize/?user_id=${patientId}`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
              "Content-Type": "application/json",
            },
          },
        );

        const data = await response.json();

        if (response.ok) {
          console.log("Raw API response:", data);

          // Handle the specific response format
          if (data.status === "success" && data.summary) {
            try {
              // Find the content in the summary array
              const contentItem =
                Array.isArray(data.summary) &&
                data.summary.find(
                  (item) => Array.isArray(item) && item[0] === "content",
                );

              if (contentItem && contentItem[1]) {
                setSummary(contentItem[1]);
              } else if (typeof data.summary === "string") {
                setSummary(data.summary);
              } else {
                // If we can't extract the content in the expected way,
                // stringify the summary for display
                setSummary(JSON.stringify(data.summary, null, 2));
              }
            } catch (parseErr) {
              console.error("Error parsing summary:", parseErr);
              setSummary(JSON.stringify(data, null, 2));
            }
          } else if (data.response) {
            setSummary(data.response);
          } else {
            setSummary(JSON.stringify(data, null, 2));
          }
        } else {
          setError(data.error || "Failed to fetch summary");
        }
      } catch (err) {
        setError("An error occurred while fetching the summary");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [isOpen, patientId]);

  // Parse markdown headings and lists
  const parseMarkdown = (text) => {
    if (!text) return [];

    // Ensure text is a string
    const textStr =
      typeof text === "string"
        ? text
        : typeof text === "object"
          ? JSON.stringify(text)
          : String(text);

    // Parse sections based on markdown headings
    const sections = [];
    let currentSection = null;

    const lines = textStr.split("\n");

    lines.forEach((line) => {
      // Check for headings (# or ## or **)
      if (
        line.startsWith("# ") ||
        line.startsWith("## ") ||
        (line.includes("**") && (line.endsWith("**:") || line.endsWith(":**")))
      ) {
        // Clean up heading text
        let heading = line
          .replace(/^#+ /, "")
          .replace(/\*\*/g, "")
          .replace(/:$/, "");

        currentSection = {
          heading,
          content: [],
          listItems: [],
        };
        sections.push(currentSection);
      }
      // Check for list items
      else if (
        line.trim().startsWith("* ") ||
        line.trim().startsWith("- ") ||
        line.match(/^\d+\. /)
      ) {
        if (currentSection) {
          const listItem = line.replace(/^[*\-] /, "").replace(/^\d+\. /, "");
          currentSection.listItems.push(listItem);
        } else {
          // Create a default section if content starts with list items
          currentSection = {
            heading: "Summary",
            content: [],
            listItems: [line.replace(/^[*\-] /, "").replace(/^\d+\. /, "")],
          };
          sections.push(currentSection);
        }
      }
      // Regular content
      else if (line.trim()) {
        if (currentSection) {
          currentSection.content.push(line);
        } else {
          // Create a default section if there was no heading
          currentSection = {
            heading: "Summary",
            content: [line],
            listItems: [],
          };
          sections.push(currentSection);
        }
      }
    });

    return sections;
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");

    let formattedContent = "";

    try {
      const sections = parseMarkdown(summary);

      if (sections && sections.length > 0) {
        formattedContent = sections
          .map(
            (section) => `
          <div class="section">
            <h2>${section.heading || "Summary"}</h2>
            ${section.content.map((para) => `<p>${para}</p>`).join("")}
            ${
              section.listItems.length > 0
                ? `<ul>${section.listItems.map((item) => `<li>${item}</li>`).join("")}</ul>`
                : ""
            }
          </div>
        `,
          )
          .join("");
      } else {
        // Fallback if parsing fails
        formattedContent = `<div class="section"><p>${typeof summary === "string" ? summary : JSON.stringify(summary, null, 2)}</p></div>`;
      }
    } catch (err) {
      console.error("Error formatting summary for print:", err);
      formattedContent = `<div class="section"><p>${typeof summary === "string" ? summary : JSON.stringify(summary, null, 2)}</p></div>`;
    }

    printWindow.document.write(`
      <html>
      <head>
        <title>Patient Summary: ${patientName || "Patient"}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #2563eb; margin-bottom: 1.5rem; }
          h2 { color: #1e40af; margin-top: 1.5rem; margin-bottom: 0.75rem; font-size: 1.2rem; }
          p { margin: 0.5rem 0; line-height: 1.6; }
          ul { margin-top: 0.5rem; }
          li { margin-bottom: 0.5rem; }
          .section { margin-bottom: 1.5rem; }
          pre { white-space: pre-wrap; background: #f5f5f5; padding: 10px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>Patient Summary: ${patientName || "Patient"}</h1>
        ${formattedContent}
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (!isOpen) return null;

  // Parse summary for structured display
  const sections = parseMarkdown(summary);

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 transition-all duration-300 ${
        isAnimating ? "scale-95 opacity-0" : "scale-100 opacity-100"
      }`}
      ref={containerRef}
    >
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden w-80 flex flex-col">
        {/* Header */}
        <div
          className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 flex justify-between items-center cursor-pointer"
          onClick={toggleExpand}
        >
          <div className="flex items-center text-white">
            <FileText size={18} className="mr-2" />
            <h3 className="font-medium text-sm truncate">
              {patientName ? `${patientName}'s Summary` : "Patient Summary"}
            </h3>
          </div>
          <div className="flex items-center">
            {isExpanded ? (
              <ChevronDown size={18} className="text-white mr-2" />
            ) : (
              <ChevronUp size={18} className="text-white mr-2" />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="text-white hover:text-gray-200 focus:outline-none"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        {isExpanded && (
          <>
            <div className="p-4 max-h-80 overflow-y-auto bg-gray-50">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader className="animate-spin h-8 w-8 text-blue-500" />
                </div>
              ) : error ? (
                <div className="text-red-500 text-sm text-center py-4">
                  <p>{error}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setError(null);
                      // Retry logic could go here
                    }}
                    className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="text-gray-700 text-sm">
                  {(() => {
                    try {
                      const sections = parseMarkdown(summary);

                      if (sections && sections.length > 0) {
                        return sections.map((section, sIndex) => (
                          <div key={sIndex} className="mb-4">
                            <h4 className="font-semibold text-blue-700 flex items-center mb-1">
                              {sIndex === 0 ? (
                                <User size={14} className="mr-1.5" />
                              ) : sIndex === 1 ? (
                                <Calendar size={14} className="mr-1.5" />
                              ) : (
                                <PenLine size={14} className="mr-1.5" />
                              )}
                              {section.heading}
                            </h4>

                            {section.content.map((paragraph, pIndex) => (
                              <p key={`p-${sIndex}-${pIndex}`} className="mb-2">
                                {paragraph}
                              </p>
                            ))}

                            {section.listItems.length > 0 && (
                              <ul className="list-disc pl-5 space-y-1 text-sm">
                                {section.listItems.map((item, iIndex) => (
                                  <li
                                    key={`li-${sIndex}-${iIndex}`}
                                    className="text-gray-700"
                                  >
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ));
                      } else if (summary) {
                        // Fallback for when we have summary but parsing fails
                        return (
                          <div className="whitespace-pre-line">
                            {typeof summary === "string"
                              ? summary
                              : JSON.stringify(summary, null, 2)}
                          </div>
                        );
                      } else {
                        return (
                          <p className="text-gray-500 italic">
                            No summary available for this patient.
                          </p>
                        );
                      }
                    } catch (err) {
                      console.error("Error rendering summary:", err);
                      return (
                        <div className="whitespace-pre-line">
                          {typeof summary === "string"
                            ? summary
                            : JSON.stringify(summary, null, 2)}
                        </div>
                      );
                    }
                  })()}
                </div>
              )}
            </div>

            {/* Footer */}
            {!loading && !error && summary && (
              <div className="px-4 py-2 bg-gray-100 border-t border-gray-200">
                <button
                  onClick={handlePrint}
                  className="w-full flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white text-xs py-1.5 px-3 rounded transition-colors"
                >
                  <Printer size={14} className="mr-1" />
                  Print Summary
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PatientSummaryWidget;
