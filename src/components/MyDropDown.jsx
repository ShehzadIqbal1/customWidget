// import React from "react";
// import { useState } from "react";
// import { TextField, ExpandCollapse, Dropdown } from "@vibe/core";
// import "./MyDropDown.css";

// function MyDropDown({  dropdownIndex,onTextChange,onChange, data }) {
//   const [beforeQuestion, setBeforeQuestion] = useState(Array(10).fill(null));  
// const [afterQuestion, setAfterQuestion] = useState(Array(10).fill(null));  

//   const [customText, setCustomText] = useState(""); // Store user-entered text

//   // const handleBeforeChange = (selected) => {
//   //   setBeforeQuestion(selected.value); // Save Before selection
//   //   onChange(selected.value, beforeQuestion); // Pass both selections
//   // };

//   // const handleAfterChange = (selected) => {
//   //   setAfterQuestion(selected.value); // Save After selection
//   //   onChange(selected.value, afterQuestion); // Pass both selections
//   // };
//   const handleBeforeChange = (selected) => {
//     setBeforeQuestion(selected.value);
//     onChange(dropdownIndex, selected.value); // Pass dropdown index
//   };
  
//   const handleAfterChange = (selected) => {
//     setAfterQuestion(selected.value);
//     onChange(dropdownIndex, selected.value); // Pass dropdown index
//   };
//   const handleTextChange = (event) => {
//     setCustomText(event.target.value);
//     onTextChange(event.target.value); 
//   //  const value = event.target.value;
//   //   setUserText(value);
//    // onChange(value);
//   };
//   return (
//     <div>
//       {[...Array(10)].map((_, index) => (  // Ensures only 10 dropdowns render
//         <ExpandCollapse
//           key={index}
//           className="ExpandCollapse-stories-module_storybookExpandCollapse"
//           title={`Question ${index + 1}`}
//         >
//           <TextField
//             value={customText}
//             onChange={handleTextChange} 
//             placeholder="Enter custom text"
//           />
  
//           <Dropdown
//             className="dropdown-stories-styles_spacing"
//             options={data.map((item) => ({
//               label: item.name,
//               value: item.name,
//             }))}
//             placeholder="Before"
//             value={beforeQuestion[index] ? { label: beforeQuestion[index], value: beforeQuestion[index] } : null}
//             onChange={(selected) => handleBeforeChange(index, selected)}
//           />
  
//           <Dropdown
//             className="dropdown-stories-styles_spacing"
//             options={data.map((item) => ({
//               label: item.name,
//               value: item.name,
//             }))}
//             placeholder="After"
//             value={afterQuestion[index] ? { label: afterQuestion[index], value: afterQuestion[index] } : null}
//             onChange={(selected) => handleAfterChange(index, selected)}
//           />
//         </ExpandCollapse>
//       ))}
//     </div>
//   );
// }
//   export default MyDropDown;
  
// //   return (
// //     <div>
// //       {data?.map((dG, index) => (
// //         <ExpandCollapse
// //           key={index}
// //           className="ExpandCollapse-stories-module_storybookExpandCollapse"
// //           title={`Question ${index + 1}`}
// //         >
// //           <TextField
// //             value={customText}
// //             onChange={handleTextChange} 
// //             placeholder="Enter custom text"
// //           />
        

// //           <Dropdown
// //             className="dropdown-stories-styles_spacing"
// //             options={data.map((item) => ({
// //               label: item.name,
// //               value: item.name,
// //             }))}
// //             placeholder="Before"
// //             onChange={handleBeforeChange}
// //           />

// //           <Dropdown
// //             className="dropdown-stories-styles_spacing"
// //             options={data.map((item) => ({
// //               label: item.name,
// //               value: item.name,
// //             }))}
// //             placeholder="After"
// //             onChange={handleAfterChange}
// //           />
// //         </ExpandCollapse>
// //       ))}
// //     </div>
// //   );
// // }


import React, { useState } from "react";
import { TextField, ExpandCollapse, Dropdown } from "@vibe/core";
import "./MyDropDown.css";

function MyDropDown({ onTextChange, onChange, data }) {
  const [beforeQuestion, setBeforeQuestion] = useState(Array(10).fill(null));
  const [afterQuestion, setAfterQuestion] = useState(Array(10).fill(null));
  const [customText, setCustomText] = useState(Array(10).fill(""));

  // Handle Before Dropdown Selection
  const handleBeforeChange = (index, selected) => {
    const updatedBefore = [...beforeQuestion];
    updatedBefore[index] = selected.value;
    setBeforeQuestion(updatedBefore);
    onChange(index, selected.value, "before"); // Ensure correct index is passed
  };

  // Handle After Dropdown Selection
  const handleAfterChange = (index, selected) => {
    const updatedAfter = [...afterQuestion];
    updatedAfter[index] = selected.value;
    setAfterQuestion(updatedAfter);
    onChange(index, selected.value, "after");
  };

  // Handle Custom Text Change
  const handleTextChange = (index, event) => {
    const updatedText = [...customText];
    updatedText[index] = event.target.value;
    setCustomText(updatedText);
    onTextChange(index, event.target.value);
  };

  return (
    <div className="dropdown-container">
      {beforeQuestion.map((_, index) => (
        <ExpandCollapse
          key={index}
          className="expand-collapse-item"
          title={`Question ${index + 1}`}
        >
          {/* Custom Text Input */}
          <TextField
            value={customText[index]}
            onChange={(event) => handleTextChange(index, event)}
            placeholder="Enter custom text"
          />

          {/* Before Dropdown */}
          <Dropdown
            className="dropdown-item"
            options={data.map((item) => ({
              label: item.name,
              value: item.name,
            }))}
            placeholder="Before"
            value={beforeQuestion[index] ? { label: beforeQuestion[index], value: beforeQuestion[index] } : null}
            onChange={(selected) => handleBeforeChange(index, selected)}
          />

          {/* After Dropdown */}
          <Dropdown
            className="dropdown-item"
            options={data.map((item) => ({
              label: item.name,
              value: item.name,
            }))}
            placeholder="After"
            value={afterQuestion[index] ? { label: afterQuestion[index], value: afterQuestion[index] } : null}
            onChange={(selected) => handleAfterChange(index, selected)}
          />
        </ExpandCollapse>
      ))}
    </div>
  );
}

export default MyDropDown;
