import React, { useState, useEffect } from "react";
import {
  TextField,
  ExpandCollapse,
  Dropdown,
  Button,
  Heading,
  Flex,
  Divider,
  Text,  //real
} from "@vibe/core";
import "./MyDropDown.css";

function MyDropDown({ 
  onTextChange, 
  onChange, 
  data, 
  setSelectedQuestions, 
  chartData, 
  setChartData,
  columnSettings,
  selectedQuestion,
  onRemoveQuestion
}) {
  const [customTexts, setCustomTexts] = useState(Array(10).fill("")); // Store user-entered text for each question
  const [tempBeforeSelections, setTempBeforeSelections] = useState(
    Array(10).fill(null)
  ); // Before selections
  const [tempAfterSelections, setTempAfterSelections] = useState(
    Array(10).fill(null)
  ); // After selections
  const [isDropdownVisible, setIsDropdownVisible] = useState(false); // Toggle dropdown visibility

  // Initialize local state from props when component mounts or when selectedQuestion changes
  useEffect(() => {
    // Update customTexts from chartData
    const newCustomTexts = chartData.map(item => 
      item.displayName && !item.displayName.startsWith('Q') ? item.displayName : '');
    setCustomTexts(newCustomTexts);
    
    // Update tempBeforeSelections and tempAfterSelections from selectedQuestion
    if (selectedQuestion) {
      const newTempBefore = selectedQuestion.map(item => item?.before || null);
      const newTempAfter = selectedQuestion.map(item => item?.after || null);
      
      setTempBeforeSelections(newTempBefore);
      setTempAfterSelections(newTempAfter);
    }
  }, [selectedQuestion, chartData]);

  // Handle text change for a specific question - only update local state
  const handleTextChange = (value, index) => {
    // Update the customTexts state
    setCustomTexts(prev => {
      const newTexts = [...prev];
      newTexts[index] = value;
      return newTexts;
    });
    
    // Call the parent's onTextChange if needed
    if (onTextChange) {
      onTextChange(value);
    }
  };

  const handleBeforeDropdownChange = (selected, index) => {
    setTempBeforeSelections((prev) => {
      const newTempSelections = [...prev];
      newTempSelections[index] = selected
        ? { 
            ...data.find((item) => item.name === selected.value),
            columnId: selected.columnId // Store column ID for color lookup
          }
        : null;
      return newTempSelections;
    });
  };

  const handleAfterDropdownChange = (selected, index) => {
    setTempAfterSelections((prev) => {
      const newTempSelections = [...prev];
      newTempSelections[index] = selected
        ? { 
            ...data.find((item) => item.name === selected.value),
            columnId: selected.columnId // Store column ID for color lookup
          }
        : null;
      return newTempSelections;
    });
  };

  const handleApplySelection = (index) => {
    // Update chartData with the custom text
    setChartData(prev => {
      const newChartData = [...prev];
      newChartData[index] = {
        ...newChartData[index],
        displayName: customTexts[index] || `Q${index + 1}` // If empty, use default
      };
      return newChartData;
    });

    // Update selected questions
    setSelectedQuestions((prev) => {
      const newQuestions = [...prev];
      newQuestions[index] = {
        before: tempBeforeSelections[index],
        after: tempAfterSelections[index],
        index: index,
      };
      return newQuestions;
    });

    // Call onChange with both selections
    if (onChange) {
      onChange({
        before: tempBeforeSelections[index]
          ? tempBeforeSelections[index].name
          : null,
        after: tempAfterSelections[index]
          ? tempAfterSelections[index].name
          : null,
        index: index,
      });
    }
  };

  const handleClearSelection = (index) => {
    // Clear local state
    setTempBeforeSelections(prev => {
      const newSelections = [...prev];
      newSelections[index] = null;
      return newSelections;
    });
    
    setTempAfterSelections(prev => {
      const newSelections = [...prev];
      newSelections[index] = null;
      return newSelections;
    });
    
    setCustomTexts(prev => {
      const newTexts = [...prev];
      newTexts[index] = "";
      return newTexts;
    });
    
    // Call parent handler to clear the question
    if (onRemoveQuestion) {
      onRemoveQuestion(index);
    }
  };

  const handleOpenDropdown = () => {
    setIsDropdownVisible(true);
  };

  const handleCloseDropdown = () => {
    setIsDropdownVisible(false);
  };

  // Find selected option from data array based on stored selection
  const findSelectedOption = (selectionObj) => {
    if (!selectionObj || !data || data.length === 0) return null;
    
    // Get the name from the selection object
    const selectedName = selectionObj.name;
    
    // Find matching option in dropdown options
    const options = getDropdownOptions();
    return options.find(option => option.value === selectedName) || null;
  };

  // Create dropdown options with color information
  const getDropdownOptions = () => {
    if (!data || data.length === 0) return [];
    
    return data.map((item) => {
      const option = {
        label: item.name,
        value: item.name,
        columnId: item.columnId
      };
      
      // Add color styling if available
      if (item.columnId && columnSettings[item.columnId]) {
        const settings = columnSettings[item.columnId];
        // Find the color for this label if possible
        for (const labelId in settings.labels) {
          if (settings.labels[labelId] === item.name && settings.colors[labelId]) {
            option.labelStyle = {
              backgroundColor: settings.colors[labelId].color,
              color: 'white',
              padding: '2px 6px',
              borderRadius: '4px'
            };
            break;
          }
        }
      }
      
      return option;
    });
  };

  const dropdownOptions = getDropdownOptions();

  return (
    <div className="dropdown-wrapper">
      {/* Toggle Button - only show when dropdown is hidden */}
      {!isDropdownVisible && (
        <Button className="toggle-dropdown-button" onClick={handleOpenDropdown}>
          Customize
        </Button>
      )}

      {/* Dropdown Section */}
      {isDropdownVisible && (
        <div className="dropdown-container">
          <Flex
            align="center"
            justify="space-between"
            className="dropdown-header"
          >
            <Heading type="h2" weight="bold">
              Customize
            </Heading>
            <Button className="close-button" onClick={handleCloseDropdown}>
              Close
            </Button>
          </Flex>
          <Divider />

          {/* Only show the 10 question dropdowns */}
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="dropdown-item">
              <ExpandCollapse
                key={index}
                className="expand-collapse"
                title={`Question ${index + 1}`}
              >
                <div className="question-content">
                  {/* Custom text field with label */}
                  <Text type="text3" weight="bold" color="secondary" className="field-label">Enter Custom Text</Text>
                  <TextField
                    className="dropdown-textfield"
                    value={customTexts[index] || ""}
                    size="medium"
                    onChange={(value) => handleTextChange(value, index)}
                    placeholder="Enter custom text"
                  />
                  {/* Before dropdown with label */}
                  <Text type="text3" weight="bold" color="secondary" className="field-label">Before</Text>
                  <Dropdown
                    size="medium"
                    clearable
                    options={dropdownOptions}
                    placeholder="Select before column"
                    onChange={(selected) =>
                      handleBeforeDropdownChange(selected, index)
                    }
                    value={findSelectedOption(tempBeforeSelections[index])}
                  />
                  {/* After dropdown with label */}
                  <Text type="text3" weight="bold" color="secondary" className="field-label">After</Text>
                  <Dropdown
                    size="medium"
                    clearable
                    options={dropdownOptions}
                    placeholder="Select after column"
                    onChange={(selected) =>
                      handleAfterDropdownChange(selected, index)
                    }
                    value={findSelectedOption(tempAfterSelections[index])}
                  />
                  {/* Action Buttons */}
                  <Flex gap={8} className="button-container" justify="space-between" align="center">
                    <Button
                      className="apply-button"
                      onClick={() => handleApplySelection(index)}
                      disabled={!tempBeforeSelections[index] && !tempAfterSelections[index]}
                    >
                      Apply
                    </Button>
                    <Button
                      className="clear-button"
                      onClick={() => handleClearSelection(index)}
                      kind="tertiary"
                      disabled={!tempBeforeSelections[index] && !tempAfterSelections[index] && !customTexts[index]}
                    >
                      Clear
                    </Button>
                  </Flex>
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