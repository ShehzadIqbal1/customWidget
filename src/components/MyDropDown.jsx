import React, { useState } from "react";
import { TextField, ExpandCollapse, Dropdown, Button } from "@vibe/core";
import "./MyDropDown.css";

function MyDropDown({ onTextChange, onChange, data, setSelectedQuestions }) {
  const [customText, setCustomText] = useState(""); // Store user-entered text
  const [tempBeforeSelections, setTempBeforeSelections] = useState(Array(10).fill(null)); // Before selections
  const [tempAfterSelections, setTempAfterSelections] = useState(Array(10).fill(null)); // After selections
  const [isDropdownVisible, setIsDropdownVisible] = useState(false); // Toggle dropdown visibility

  const handleBeforeDropdownChange = (selected, index) => {
    setTempBeforeSelections((prev) => {
      const newTempSelections = [...prev];
      newTempSelections[index] = selected
        ? { ...data.find((item) => item.name === selected.value) }
        : null;
      return newTempSelections;
    });
  };

  const handleAfterDropdownChange = (selected, index) => {
    setTempAfterSelections((prev) => {
      const newTempSelections = [...prev];
      newTempSelections[index] = selected
        ? { ...data.find((item) => item.name === selected.value) }
        : null;
      return newTempSelections;
    });
  };

  const handleApplySelection = (index) => {
    setSelectedQuestions((prev) => {
      const newQuestions = [...prev];
      // Instead of a single selection, store both before and after
      newQuestions[index] = {
        before: tempBeforeSelections[index],
        after: tempAfterSelections[index],
        index: index
      };
      return newQuestions;
    });

    // Call onChange with both selections
    onChange({
      before: tempBeforeSelections[index] ? tempBeforeSelections[index].name : null,
      after: tempAfterSelections[index] ? tempAfterSelections[index].name : null,
      index: index
    });
  };

  const handleTextChange = (event) => {
    setCustomText(event.target.value);
    onTextChange(event.target.value);
  };

  return (
    <div className="dropdown-wrapper">
      {/* Toggle Button */}
      <Button
        className="toggle-dropdown-button"
        onClick={() => setIsDropdownVisible(!isDropdownVisible)}
      >
        {isDropdownVisible ? "Hide Options" : "Customize"}
      </Button>

      {/* Dropdown Section (Hidden until button is clicked) */}
      {isDropdownVisible && (
        <div className="dropdown-container">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="dropdown-item">
              <ExpandCollapse
                className="expand-collapse"
                title={`Question ${index + 1}`}
              >
                <TextField
                  className="dropdown-textfield"
                  value={customText}
                  onChange={handleTextChange}
                  placeholder="Enter custom text"
                />

                <Dropdown
                  className="dropdown-select"
                  clearable
                  options={data.map((item) => ({
                    label: item.name,
                    value: item.name,
                  }))}
                  placeholder="Before"
                  onChange={(selected) => handleBeforeDropdownChange(selected, index)}
                />

                <Dropdown
                  className="dropdown-select"
                  clearable
                  options={data.map((item) => ({
                    label: item.name,
                    value: item.name,
                  }))}
                  placeholder="After"
                  onChange={(selected) => handleAfterDropdownChange(selected, index)}
                />

                {/* Apply Button */}
                <Button
                  className="apply-button"
                  onClick={() => handleApplySelection(index)}
                >
                  Apply
                </Button>
              </ExpandCollapse>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyDropDown;