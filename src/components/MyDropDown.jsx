import React from 'react';
import { Text, Icon, ExpandCollapse } from "@vibe/core";

function MyDropDown({ data }) {


  return (
    <>
      {data?.map((d, index) => (
        <ExpandCollapse
          key={index}
          className="ExpandCollapse-stories-module_storybookExpandCollapse"
          title={d?.name}
          
        >
          
          <Text maxLines={2} type="text2">
            {d?.name}
          </Text>
          <Icon icon="robot" iconSize={40} iconType="svg" />
        </ExpandCollapse>
      ))}
    </>
  );
}
export default MyDropDown;





// import React from 'react';
// import { Text, Icon, ExpandCollapse } from "@vibe/core";

// function MyDropDown({ questions, data }) {
//   return (
//     <div>
//       {questions?.map((question, index) => (
//         <ExpandCollapse
//           key={index} // Unique key to avoid React warnings
//           className="ExpandCollapse-stories-module_storybookExpandCollapse"
//           title={question} // Each ExpandCollapse title is a question
//         >
//           {data?.map((d, i) => (
//             <Text key={i} maxLines={2} type="text2">
//               {d?.name}
//             </Text>
//           ))}

//           <Icon icon="robot" iconSize={40} iconType="svg" />
//         </ExpandCollapse>
//       ))}
//     </div>
//   );
// }

// export default MyDropDown;




























