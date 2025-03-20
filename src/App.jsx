import { useState, useEffect } from "react";
import mondaySdk from "monday-sdk-js";
import "@vibe/core/tokens";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { Text, Heading } from "@vibe/core";
import MyDropDown from "./components/MyDropDown";

const monday = mondaySdk();

const App = () => {
  const [columns, setColumns] = useState([]);
  const [attributeNames, setAttributeNames] = useState([]);
  const [selectedQuestion, setSelectedQuestions] = useState(
    Array(10).fill(null)
  );
  const [context, setContext] = useState();
  const [userText, setUserText] = useState("");
  const [chartData, setChartData] = useState([]);

  // Custom colors for status divisions
  const colors = [
    "#fdab3d", // Orange
    "#df2f4a", // Red
    "#df2f4a", // Red 
    "#007eb5", // Teal
    "#fdab3d", // Orange
    "#fdab3d", // Orange
    "#df2f4a", // Red
    "#00c875", // Green
    "#007eb5", // Teal
    "#007eb5", // Teal
    "#00c875", // Green
    "#00c875", // Green
  ];

  const handleTextUpdate = (text) => {
    setUserText(text);
  };

  // Initialize chartData with default values
  useEffect(() => {
    const initialChartData = Array(10).fill().map((_, index) => ({
      displayName: getDisplayName(index),
      questionIndex: index
    }));
    setChartData(initialChartData);
  }, []);

  useEffect(() => {
    console.log(selectedQuestion, "selectedQuestions");
    console.log(chartData, "chartData");
    // Update chartData with new selectedQuestion data
    setChartData(prevChartData => {
      return prevChartData.map((item, index) => {
        const question = selectedQuestion[index];
        if (!question) return item;
        
        const newItem = { ...item };
        
        // Add individual response categories for before
        if (question.before) {
          Object.entries(question.before).forEach(([key, value]) => {
            // Only add numeric values, skip name and other properties
            if (typeof value === 'number') {
              newItem[`before_${key}`] = value;
            }
          });
          newItem.beforeName = question.before.name || '';
        }
        
        // Add individual response categories for after
        if (question.after) {
          Object.entries(question.after).forEach(([key, value]) => {
            // Only add numeric values, skip name and other properties
            if (typeof value === 'number') {
              newItem[`after_${key}`] = value;
            }
          });
          newItem.afterName = question.after.name || '';
        }
        
        return newItem;
      });
    });
  }, [selectedQuestion]);

  useEffect(() => {
    monday.listen("context", (res) => {
      setContext(res.data);
    });

    monday.setToken(
      "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ3MzA5MjIzNCwiYWFpIjoxMSwidWlkIjo3MTY2ODg2NywiaWFkIjoiMjAyNS0wMi0xNVQxOTowOTozMS4yNDNaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTkyMjg0MTEsInJnbiI6InVzZTEifQ.1iMN8yDETWijCvnAMVp838-LdA8r2J3LSKqKUNQUHJA"
    );

    monday
      .api(
        `
  query {
  boards(ids: [7868405080]) {
        columns{
        id
        title 

        }
    items_page {
      items {
        id
        name

        column_values(ids: ["single_select0__1", "color__1","single_select8__1","color1__1","color2__1","color5__1","color0__1","color19__1","color9__1","color18__1","color6__1","color04__1","single_select1__1","color61__1","color4__1","color3__1"]) {
          id
          value
          text

        }
      }
    }
  }
}`
      )
      .then((res) => {
        console.log("Data", res);
        const items = res.data.boards[0].items_page.items;
        const columns = res.data.boards[0].columns;
        let columnNames = {};
        columns.forEach((c) => {
          columnNames[c.id] = c.title;
        });

        console.log("Columns", columnNames);
        let columnData = {}; // Object to hold formatted data
        let allAttributes = new Set(); // Stores all unique response names

        items.forEach((item) => {
          item.column_values.forEach((column) => {
            const columnName = columnNames[column.id] || column.id; // Use mapped name or fallback to ID

            if (!columnData[columnName]) {
              columnData[columnName] = {}; // Initialize if not exists
            }

            let text = column.text || "N/A";

            // Initialize or increment count for this text
            columnData[columnName][text] =
              (columnData[columnName][text] || 0) + 1;
            allAttributes.add(text); // Collect unique response names
          });
        });

        // Convert object into array format like the example
        let formattedData = Object.entries(columnData).flatMap(
          ([name, values], index) => {
            const formattedEntry = { name, ...values };

            // Insert a null entry after every two rows
            if ((index + 1) % 2 === 0) {
              return [
                formattedEntry,
                {
                  name: "",
                  ...Object.keys(values).reduce(
                    (acc, key) => ({ ...acc, [key]: null }),
                    {}
                  ),
                },
              ];
            } else if (index === 0) {
              return [
                {
                  name: "",
                  ...Object.keys(values).reduce(
                    (acc, key) => ({ ...acc, [key]: null }),
                    {}
                  ),
                },
                formattedEntry,
              ];
            }

            return [formattedEntry];
          }
        );

        formattedData = formattedData?.filter(
          (f) => f?.name?.trim()?.length !== 0
        );

        console.log("Formatteed data1", formattedData);
        console.log("Attributes", allAttributes);
        setColumns(formattedData);
        setAttributeNames([...allAttributes]); // Convert Set to Array
      });
  }, []);

  console.log("column data", columns);

  // Function to handle question change
  const handleChange = (selection) => {
    console.log("Selection received:", selection);
  };

  // Helper function to create display names for X-axis
  const getDisplayName = (index) => {
    return `Q${index + 1}`;
  };

  // Custom tooltip component to show detailed response breakdown
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const itemIndex = parseInt(label.replace('Q', '')) - 1;
      const questionData = selectedQuestion[itemIndex];
      
      if (!questionData) return null;
      
      return (
        <div className="custom-tooltip" style={{
          backgroundColor: context?.theme === "dark" ? "#333" : "white",
          color: context?.theme === "dark" ? "white" : "black",
          border: "1px solid #ccc",
          borderRadius: "5px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
          maxWidth: "300px"
        }}>
          <Text type="text1" weight="bold" color="primary">Question {itemIndex + 1}</Text>
          
          {questionData.before && (
            <div>
              <Text type="text2" weight="bold" color="positive">Before: {questionData.before.name}</Text>
              {Object.entries(questionData.before)
                .filter(([key, val]) => typeof val === 'number')
                .map(([key, val]) => (
                  <Text key={`before-${key}`} type="text3" color="secondary" style={{paddingLeft: "10px"}}>
                    {key}: {val}
                  </Text>
                ))
              }
            </div>
          )}
          
          {questionData.after && (
            <div>
              <Text type="text2" weight="bold" color="warning">After: {questionData.after.name}</Text>
              {Object.entries(questionData.after)
                .filter(([key, val]) => typeof val === 'number')
                .map(([key, val]) => (
                  <Text key={`after-${key}`} type="text3" color="secondary" style={{paddingLeft: "10px"}}>
                    {key}: {val}
                  </Text>
                ))
              }
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Get all unique response keys from the data
  const getUniqueResponseCategories = () => {
    const before = new Set();
    const after = new Set();
    
    selectedQuestion.forEach(item => {
      if (!item) return;
      
      if (item.before) {
        Object.keys(item.before).forEach(key => {
          if (typeof item.before[key] === 'number') {
            before.add(key);
          }
        });
      }
      
      if (item.after) {
        Object.keys(item.after).forEach(key => {
          if (typeof item.after[key] === 'number') {
            after.add(key);
          }
        });
      }
    });
    
    return { before: Array.from(before), after: Array.from(after) };
  };

  const responseCategories = getUniqueResponseCategories();
  
  // Map response categories to colors from the colors array
  const getColorForCategory = (prefix, category, index) => {
    const colorIndex = index % colors.length;
    return colors[colorIndex];
  };

  // Get category display name for legend
  const getCategoryDisplayName = (prefix, category) => {
    return `${prefix === 'before' ? 'Before' : 'After'}: ${category}`;
  };

  return (
    <div className="App" style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column" }}>
      <div className="chart-container" style={{ 
        width: "75%", 
        height: "90vh", 
        backgroundColor: context?.theme === "dark" ? "#2c2c2c" : "#ffffff",
      }}>
        <Heading type="h1" weight="bold" size="medium" align="center">
          Before/After Survey Response Analysis
        </Heading>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart
            data={chartData}
            barSize={40}
            barGap={8}
            margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={context?.theme === "dark" ? "#555" : "#ccc"}
              vertical={false}
            />
            <XAxis 
              dataKey="displayName" 
              tick={{ 
                fill: context?.theme === "dark" ? "#ffffff" : "#333",
                fontSize: 14,
                fontWeight: "bold"
              }}
              tickLine={{ stroke: context?.theme === "dark" ? "#ffffff" : "#333" }}
              axisLine={{ stroke: context?.theme === "dark" ? "#ffffff" : "#333" }}
              interval={0}
              angle={0}
              textAnchor="middle"
              height={40}
            />
            <YAxis
              tick={{ fill: context?.theme === "dark" ? "#ffffff" : "#333" }}
              axisLine={{ stroke: context?.theme === "dark" ? "#ffffff" : "#333" }}
              tickLine={{ stroke: context?.theme === "dark" ? "#ffffff" : "#333" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              layout="horizontal"
              align="center"
              verticalAlign="top"
              wrapperStyle={{
                fontSize: "12px"
              }}
            />
            
            {/* Render each "before" response category */}
            {responseCategories.before.map((category, index) => (
              <Bar
                key={`before_${category}`}
                dataKey={`before_${category}`}
                name={getCategoryDisplayName('before', category)}
                fill={getColorForCategory('before', category, index)}
                radius={[4, 4, 0, 0]}
                stackId="before"
              >
                <LabelList 
                  dataKey={`before_${category}`} 
                  position="inside" 
                  style={{ 
                    fontSize: '12px', 
                    fill: "#fff",
                    // fontWeight: "bold"
                  }}
                  formatter={(value) => value > 0 ? value : ''}
                />
              </Bar>
            ))}
            
            {/* Render each "after" response category */}
            {responseCategories.after.map((category, index) => (
              <Bar
                key={`after_${category}`}
                dataKey={`after_${category}`}
                name={getCategoryDisplayName('after', category)}
                fill={getColorForCategory('after', category, index + responseCategories.before.length)}
                radius={[4, 4, 0, 0]}
                stackId="after"
              >
                <LabelList 
                  dataKey={`after_${category}`} 
                  position="inside" 
                  style={{ 
                    fontSize: '12px', 
                    fill: "#fff",
                    // fontWeight: "bold"
                  }}
                  formatter={(value) => value > 0 ? value : ''}
                />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ width: "100%" }}>
        <MyDropDown
          onChange={handleChange}
          onTextChange={handleTextUpdate}
          data={columns}
          setSelectedQuestions={setSelectedQuestions}
          chartData={chartData}
          setChartData={setChartData}
        />
      </div>
    </div>
  );
};

export default App;