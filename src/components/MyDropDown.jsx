
import React, { useState } from "react";
import { TextField, ExpandCollapse, Dropdown, Button } from "@vibe/core";
import "./MyDropDown.css";

function MyDropDown({ onTextChange, onChange, data, setSelectedQuestions }) {
  const [customText, setCustomText] = useState(""); // Store user-entered text
  const [tempSelections, setTempSelections] = useState(Array(10).fill(null)); // Temporary selections
  const [isDropdownVisible, setIsDropdownVisible] = useState(false); // Toggle dropdown visibility

  const handleDropdownChange = (selected, index) => {
    setTempSelections((prev) => {
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
      newQuestions[index] = {
        ...tempSelections[index],
        customText: customText || "", // Store entered text
      };
      return newQuestions;
    });
  
    onChange(tempSelections[index] ? tempSelections[index].name : null);
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
                  onChange={(selected) => handleDropdownChange(selected, index)}
                />

                <Dropdown
                  className="dropdown-select"
                  clearable
                  options={data.map((item) => ({
                    label: item.name,
                    value: item.name,
                  }))}
                  placeholder="After"
                  onChange={(selected) => handleDropdownChange(selected, index)}
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

