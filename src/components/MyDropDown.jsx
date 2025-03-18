import React from "react";
import { useState } from "react";
import { TextField, ExpandCollapse, Dropdown } from "@vibe/core";
// import "./MyDropDown.css";
 
function MyDropDown({  onTextChange,onChange, data }) {
  const [beforeQuestion, setBeforeQuestion] = useState(null);
  const [afterQuestion, setAfterQuestion] = useState(null);
  const [customText, setCustomText] = useState(""); // Store user-entered text
 
  const handleBeforeChange = (selected) => {
    setBeforeQuestion(selected.value); // Save Before selection
    onChange(selected.value, beforeQuestion); // Pass both selections
  };
 
  const handleAfterChange = (selected) => {
    setAfterQuestion(selected.value); // Save After selection
    onChange(selected.value, afterQuestion); // Pass both selections
  };
  const handleTextChange = (event) => {
    setCustomText(event.target.value);
    onTextChange(event.target.value);
  };
  return (
    <div>
      {Array.from({ length: 10 }).map((dG, index) => (
        <ExpandCollapse
          key={index}
          className="ExpandCollapse-stories-module_storybookExpandCollapse"
          title={`Question ${index + 1}`}
        >
          <TextField
            value={customText}
            onChange={handleTextChange}
            placeholder="Enter custom text"
          />
       
 
          <Dropdown
            className="dropdown-stories-styles_spacing"
            options={data.map((item) => ({
              label: item.name,
              value: item.name,
            }))}
            placeholder="Before"
            onChange={handleBeforeChange}
          />
 
          <Dropdown
            className="dropdown-stories-styles_spacing"
            options={data.map((item) => ({
              label: item.name,
              value: item.name,
            }))}
            placeholder="After"
            onChange={handleAfterChange}
          />
        </ExpandCollapse>
      ))}
    </div>
  );
}
 
export default MyDropDown;