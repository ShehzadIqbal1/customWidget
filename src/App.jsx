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
import { Loader } from "@vibe/core";

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
  const [columnSettings, setColumnSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const handleTextUpdate = (text) => {
    setUserText(text);
  };

  // Initialize chartData with default values and load saved state
  useEffect(() => {
    // Load from localStorage if available
    const savedSelectedQuestions = localStorage.getItem('selectedQuestions');
    const savedChartData = localStorage.getItem('chartData');

    let initialChartData = Array(10)
      .fill()
      .map((_, index) => ({
        displayName: getDisplayName(index),
        questionIndex: index,
      }));

    let initialSelectedQuestions = Array(10).fill(null);

    if (savedChartData) {
      try {
        initialChartData = JSON.parse(savedChartData);
      } catch (error) {
        console.error("Error parsing saved chart data:", error);
      }
    }

    if (savedSelectedQuestions) {
      try {
        initialSelectedQuestions = JSON.parse(savedSelectedQuestions);
      } catch (error) {
        console.error("Error parsing saved selected questions:", error);
      }
    }

    setChartData(initialChartData);
    setSelectedQuestions(initialSelectedQuestions);
  }, []);

  // Save to localStorage whenever selectedQuestion or chartData changes
  useEffect(() => {
    localStorage.setItem('selectedQuestions', JSON.stringify(selectedQuestion));
  }, [selectedQuestion]);

  useEffect(() => {
    localStorage.setItem('chartData', JSON.stringify(chartData));
  }, [chartData]);

  useEffect(() => {
    console.log(selectedQuestion, "selectedQuestions");
    console.log(chartData, "chartData");
    // Update chartData with new selectedQuestion data
    setChartData((prevChartData) => {
      return prevChartData.map((item, index) => {
        const question = selectedQuestion[index];
        if (!question) return item;

        const newItem = { ...item };

        // Add individual response categories for before
        if (question.before) {
          Object.entries(question.before).forEach(([key, value]) => {
            // Only add numeric values, skip name and other properties
            if (typeof value === "number") {
              newItem[`before_${key}`] = value;
            }
          });
          newItem.beforeName = question.before.name || "";
        }
        // Add individual response categories for after
        if (question.after) {
          Object.entries(question.after).forEach(([key, value]) => {
            // Only add numeric values, skip name and other properties
            if (typeof value === "number") {
              newItem[`after_${key}`] = value;
            }
          });
          newItem.afterName = question.after.name || "";
        }

        return newItem;
      });
    });
  }, [selectedQuestion]);
     
  useEffect(() => {
    setIsLoading(true);
    monday.listen("context", (res) => {
      setContext(res.data);
    });

    monday.setToken(
      "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ3MzA5MjIzNCwiYWFpIjoxMSwidWlkIjo3MTY2ODg2NywiaWFkIjoiMjAyNS0wMi0xNVQxOTowOTozMS4yNDNaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTkyMjg0MTEsInJnbiI6InVzZTEifQ.1iMN8yDETWijCvnAMVp838-LdA8r2J3LSKqKUNQUHJA"
    );

    // First query to get all columns and their types
    monday
      .api(
        `
        query {
          boards(ids: [7868405080]) {
            columns {
              id
              title
              type         
              settings_str
            }
          }
        }
        `
      )
      .then((colRes) => {
        const allColumns = colRes.data.boards[0].columns;

        // Filter only status-type columns
        const statusColumns = allColumns.filter(
          (col) => col.type === "color" || col.type === "status"
        );

        console.log("Status columns:", statusColumns);

        // Parse settings_str for each column to extract color information
        const settingsMap = {};
        statusColumns.forEach((column) => {
          try {
            if (column.settings_str) {
              const settings = JSON.parse(column.settings_str);
              if (settings.labels_colors) {
                settingsMap[column.id] = {
                  title: column.title,
                  colors: settings.labels_colors,
                  labels: settings.labels || {},
                };
              }
            }
          } catch (e) {
            console.error(`Error parsing settings for column ${column.id}:`, e);
          }
        });

        console.log("Column settings:", settingsMap);
        setColumnSettings(settingsMap);

        if (statusColumns.length > 0) {
          // Build a dynamic query with filtered column IDs
          const columnIdsArray = statusColumns.map((col) => `"${col.id}"`);
          const columnIds = columnIdsArray.join(", ");

          // Second query to get data for only status-type columns
          monday
            .api(
              `
              query {
                boards(ids: [7868405080]) {
                  columns {
                    id
                    title
                    type
                  }
                  items_page {
                    items {
                      id
                      name
                      column_values(ids: [${columnIds}]) {
                        id
                        value
                        text
                      }
                    }
                  }
                }
              }
              `
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
                    columnData[columnName] = {
                      columnId: column.id, // Store the column ID to lookup colors later
                    };
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

              console.log("Formatted data", formattedData);
              console.log("Attributes", allAttributes);
              setColumns(formattedData);
              setAttributeNames([...allAttributes]); // Convert Set to Array
              setIsLoading(false); // Set loading to false once data is loaded
            })
            .catch(error => {
              console.error("Error fetching data:", error);
              setIsLoading(false);
            });
        } else {
          setIsLoading(false);
        }
      })
      .catch(error => {
        console.error("Error fetching columns:", error);
        setIsLoading(false);
      });
  }, []);

  // Function to handle question change
  const handleChange = (selection) => {
    console.log("Selection received:", selection);
  };

  // Handle removing a question selection
  const handleRemoveQuestion = (index) => {
    // Update selectedQuestions to remove the selection at index
    setSelectedQuestions(prev => {
      const newQuestions = [...prev];
      newQuestions[index] = null;
      return newQuestions;
    });
    
    // Update chartData to remove the bars for this question
    setChartData(prev => {
      const newChartData = [...prev];
      newChartData[index] = {
        displayName: getDisplayName(index),
        questionIndex: index,
      };
      return newChartData;
    });
  };

  // Helper function to create display names for X-axis
  const getDisplayName = (index) => {
    return `Q${index + 1}`;
  };

  // Custom tooltip component to show detailed response breakdown
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const itemIndex = parseInt(label.replace("Q", "")) - 1;
      const questionData = selectedQuestion[itemIndex];

      if (!questionData) return null;

      return (
        <div
          className="custom-tooltip"
          style={{
            backgroundColor: context?.theme === "light" ? "white" : "#333",
            color: context?.theme === "light" ? "black" : "white",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
            maxWidth: "300px",
          }}
        >
          <p style={{ fontWeight: "bold", margin: "0 0 5px 0" }}>
            Question {itemIndex + 1}
          </p>

          {questionData.before && (
            <div>
              <p
                style={{
                  fontWeight: "bold",
                  margin: "5px 0",
                  color: "#00c875",
                }}
              >
                Before: {questionData.before.name}
              </p>
              {Object.entries(questionData.before)
                .filter(([key, val]) => typeof val === "number")
                .map(([key, val]) => (
                  <p key={`before-${key}`} style={{ margin: "2px 0 2px 10px" }}>
                    {key}: {val}
                  </p>
                ))}
            </div>
          )}

          {questionData.after && (
            <div>
              <p
                style={{
                  fontWeight: "bold",
                  margin: "5px 0",
                  color: "#fdab3d",
                }}
              >
                After: {questionData.after.name}
              </p>
              {Object.entries(questionData.after)
                .filter(([key, val]) => typeof val === "number")
                .map(([key, val]) => (
                  <p key={`after-${key}`} style={{ margin: "2px 0 2px 10px" }}>
                    {key}: {val}
                  </p>
                ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Get all unique response categories from the data
  const getUniqueResponseCategories = () => {
    const before = new Set();
    const after = new Set();

    selectedQuestion.forEach((item) => {
      if (!item) return;

      if (item.before) {
        Object.keys(item.before).forEach((key) => {
          if (typeof item.before[key] === "number") {
            before.add(key);
          }
        });
      }

      if (item.after) {
        Object.keys(item.after).forEach((key) => {
          if (typeof item.after[key] === "number") {
            after.add(key);
          }
        });
      }
    });

    return { before: Array.from(before), after: Array.from(after) };
  };

  const responseCategories = getUniqueResponseCategories();

  // Function to get color for a specific response value
  const getColorForCategory = (prefix, category, index) => {
    // Try to find the color from column settings
    for (const columnId in columnSettings) {
      const settings = columnSettings[columnId];

      // Find if this category exists in labels
      for (const labelId in settings.labels) {
        if (settings.labels[labelId] === category && settings.colors[labelId]) {
          return settings.colors[labelId].color;
        }
      }
    }

    // Fallback colors - return a default color (gray) if no match is found
    return "#c4c4c4";  // Default gray color
  };

  // Modified legendFormatter function that prevents duplicates
  const legendFormatter = (value, entry) => {
    // Extract the actual category name from the dataKey
    const match = entry.dataKey.match(/(before|after)_(.+)/);
    if (!match) return value;
    
    const [_, prefix, category] = match;
    return category;
  };

  // Function to create unique legend items
  const getUniqueLegendItems = () => {
    // Use a Map with category+color as the key to ensure uniqueness
    const uniqueItems = new Map();
    
    // Process before categories
    responseCategories.before.forEach((category, index) => {
      const color = getColorForCategory("before", category, index);
      const key = `${category}-${color}`;
      
      if (!uniqueItems.has(key)) {
        uniqueItems.set(key, {
          value: category,
          type: 'rect',
          id: `before_${category}`,
          color: color,
          dataKey: `before_${category}`,
          payload: { fill: color }
        });
      }
    });
    
    // Process after categories
    responseCategories.after.forEach((category, index) => {
      const color = getColorForCategory("after", category, index + responseCategories.before.length);
      const key = `${category}-${color}`;
      
      if (!uniqueItems.has(key)) {
        uniqueItems.set(key, {
          value: category,
          type: 'rect',
          id: `after_${category}`,
          color: color,
          dataKey: `after_${category}`,
          payload: { fill: color }
        });
      }
    });
    
    return Array.from(uniqueItems.values());
  };

  return (
    <div className="App">
      <div
        className="chart-container"
        style={{
          width: "80%",
          height: "70vh",
          margin: "20px 0 20px 20px",
          backgroundColor: context?.theme === "light" ? "#f5f5f5" : "#2c2c2c",
          borderRadius: "8px",
          padding: "20px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          position: "relative",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "20px",
            color: context?.theme === "light" ? "#333" : "#f5f5f5",
          }}
        >
          Before/After Survey Response Analysis
        </h2>

        {isLoading ? (
          <div 
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center"
            }}
          >
            <Loader size="medium" />
            <p 
              style={{
                marginTop: "10px",
                color: context?.theme === "light" ? "#333" : "#f5f5f5",
              }}
            >
              Loading data from Monday.com...
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="85%">
            <BarChart
              data={chartData}
              barSize={40}
              barGap={8}
              margin={{ top: 20, right: 30, left: 30, bottom: 70 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={context?.theme === "light" ? "#ccc" : "#555"}
                vertical={false}
              />
              <XAxis
                dataKey="displayName"
                tick={{
                  fill: context?.theme === "light" ? "#333" : "#f5f5f5",
                  fontSize: 12,
                  fontWeight: "bold",
                }}
                tickLine={{
                  stroke: context?.theme === "light" ? "#333" : "#f5f5f5",
                }}
                axisLine={{
                  stroke: context?.theme === "light" ? "#333" : "#f5f5f5",
                }}
                interval={0}
                angle={0}
                textAnchor="middle"
                height={70}
                label={{
                  value: "Questions",
                  position: "insideBottom",
                  offset: -10,
                  fill: context?.theme === "light" ? "#333" : "#f5f5f5",
                }}
              />
              <YAxis
                tick={{ fill: context?.theme === "light" ? "#333" : "#f5f5f5" }}
                axisLine={{
                  stroke: context?.theme === "light" ? "#333" : "#f5f5f5",
                }}
                tickLine={{
                  stroke: context?.theme === "light" ? "#333" : "#f5f5f5",
                }}
                label={{
                  value: "Number of Responses",
                  angle: -90,
                  position: "insideLeft",
                  style: { textAnchor: "middle" },
                  fill: context?.theme === "light" ? "#333" : "#f5f5f5",
                }}
              />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ 
                  fill: context?.theme === "light" ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)",
                  strokeDasharray: "3 3"
                }}
                wrapperStyle={{ zIndex: 100 }}
                allowEscapeViewBox={{ x: true, y: true }}
              />
              <Legend
                layout="horizontal"
                align="center"
                verticalAlign="top"
                wrapperStyle={{
                  paddingBottom: "15px",
                  fontSize: "12px",
                }}
                formatter={legendFormatter}
                payload={getUniqueLegendItems()}
              />

              {/* Render each "before" response category */}
              {responseCategories.before.map((category, index) => (
                <Bar
                  key={`before_${category}`}
                  dataKey={`before_${category}`}
                  name={`Before: ${category}`} // Add "Before: " prefix to make it clearer
                  fill={getColorForCategory("before", category, index)}
                  radius={[4, 4, 0, 0]}
                  stackId="before"
                  cursor="pointer"
                  isAnimationActive={true}
                >
                  <LabelList
                    dataKey={`before_${category}`}
                    position="inside"
                    style={{
                      fontSize: "10px",
                      fill: "#fff",
                      fontWeight: "bold",
                    }}
                    formatter={(value) => (value > 0 ? value : "")}
                  />
                </Bar>
              ))}

              {/* Render each "after" response category */}
              {responseCategories.after.map((category, index) => (
                <Bar
                  key={`after_${category}`}
                  dataKey={`after_${category}`}
                  name={`After: ${category}`} // Add "After: " prefix to make it clearer
                  fill={getColorForCategory(
                    "after",
                    category,
                    index + responseCategories.before.length
                  )}
                  radius={[4, 4, 0, 0]}
                  stackId="after"
                  cursor="pointer"
                  isAnimationActive={true}
                >
                  <LabelList
                    dataKey={`after_${category}`}
                    position="inside"
                    style={{
                      fontSize: "10px",
                      fill: "#fff",
                      fontWeight: "bold",
                    }}
                    formatter={(value) => (value > 0 ? value : "")}
                  />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* MyDropDown component to select questions */}
      <MyDropDown
        data={columns}
        onChange={handleChange}
        setSelectedQuestions={setSelectedQuestions}
        chartData={chartData}
        setChartData={setChartData}
        columnSettings={columnSettings}
        selectedQuestion={selectedQuestion}
        onRemoveQuestion={handleRemoveQuestion}
      />
    </div>
  );
};

export default App;