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

  const handleOpenDropdown = () => {
    setIsDropdownVisible(true);
  };

  const handleCloseDropdown = () => {
    setIsDropdownVisible(false);
  };

  return (
    <div className="dropdown-wrapper">
      {/* Toggle Button - only show when dropdown is hidden */}
      {!isDropdownVisible && (
        <Button
          className="toggle-dropdown-button"
          onClick={handleOpenDropdown}
        >
          Customize
        </Button>
      )}

      {/* Dropdown Section */}
      {isDropdownVisible && (
        <div className="dropdown-container">
         <h2>&nbsp;</h2> 
          <Button
            className="close-button"
            onClick={handleCloseDropdown}
          >
            Close
          </Button>
          
          {/* Only show the 10 question dropdowns */}
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="dropdown-item">
              <ExpandCollapse
                className="expand-collapse"
                title={`Question ${index + 1}`}
              >
                <div className="question-content">
                  {/* Custom text field with label */}
                  <label className="field-label">Enter custom text</label>
                  <TextField
                    className="dropdown-textfield"
                    value={customText}
                    onChange={handleTextChange}
                    placeholder="Enter custom text"
                  />

                  {/* Before dropdown with label */}
                  <label className="field-label">Before</label>
                  <Dropdown
                    className="dropdown-select"
                    clearable
                    options={data.map((item) => ({
                      label: item.name,
                      value: item.name,
                    }))}
                    placeholder="Select before column"
                    onChange={(selected) => handleBeforeDropdownChange(selected, index)}
                  />

                  {/* After dropdown with label */}
                  <label className="field-label">After</label>
                  <Dropdown
                    className="dropdown-select"
                    clearable
                    options={data.map((item) => ({
                      label: item.name,
                      value: item.name,
                    }))}
                    placeholder="Select after column"
                    onChange={(selected) => handleAfterDropdownChange(selected, index)}
                  />

                  {/* Apply Button */}
                  <Button
                    className="apply-button"
                    onClick={() => handleApplySelection(index)}
                  >
                    Apply
                  </Button>
                </div>
              </ExpandCollapse>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyDropDown;


