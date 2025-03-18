import { useState, useEffect } from "react";
import "./App.css";
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
} from "recharts";

import DropDown from "./components/MyDropDown";

const monday = mondaySdk();

const App = () => {
  const [columns, setColumns] = useState([]);
  const [attributeNames, setAttributeNames] = useState([]);
  const [selectedQuestion, setSelectedQuestions] = useState(
    Array(10).fill(null)
  );
  const [context, setContext] = useState();
  const [formatedData, setFormatedData] = useState([]);
  const [userText, setUserText] = useState("");

  const handleTextUpdate = (text, index) => {
    setSelectedQuestions((prev) => {
      const updatedQuestions = [...prev];
      if (updatedQuestions[index]) {
        updatedQuestions[index] = { ...updatedQuestions[index], customText: text };
      }
      return updatedQuestions;
    });
  };

  useEffect(() => {
    console.log(selectedQuestion, "selectedQuestions");
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

  const colors = [
    "#fdab3d", // Blue
    "#df2f4a", // Orange
    "#df2f4a", // Red
    "#007eb5", // Teal
    "#fdab3d", // Green
    "#fdab3d", // Yellow
    "#df2f4a", // Purple
    "#00c875", // Soft Pink
    "#007eb5", // Brown
    "#007eb5", // Gray
    "#00c875", // Magenta
    "#00c875", // Light Green
  ];

  const CustomXAxisTick = (props) => {
    const { x, y, payload } = props;
  
    // Find the matching question from selectedQuestions
    const matchedQuestion = selectedQuestion.find((q) => q.name === payload.value);
  
    return (
      <g transform={`translate(${x},${y})`}>
        {/* Display custom user-entered text below the bar (if available) */}
        {matchedQuestion?.customText && (
          <text
            x={0}
            y={20} // Position the text slightly below the X-axis
            dy={15}
            textAnchor="middle"
            fontSize={12}
            fill="red"
          >
            {matchedQuestion.customText}
          </text>
        )}
      </g>
    );
  };
  
  console.log("coulum data", columns);

  // Function to handle question change
  const handleChange = (selectedQuestion) => {
    console.log(selectedQuestion);

    setFormatedData((prev) => {
      const item = columns.filter((c) => c.name === selectedQuestion)[0];
      return [...prev, item];
    });
  };

  return (
    <div className="App">
      <div className="container">
        <BarChart
          width={window.innerWidth}
          height={window.innerHeight}
          data={selectedQuestion}
          barSize={50}
          margin={{ bottom: 50 }}
        >
          <CartesianGrid
            stroke={context?.theme === "light" ? "black" : "white"}
          />
          <XAxis dataKey="name" tick={<CustomXAxisTick />} interval={0} />
          <YAxis
            tick={{ fill: context?.theme === "light" ? "black" : "white" }}
            axisLine={{
              stroke: context?.theme === "light" ? "black" : "white",
            }}
          />
          <Tooltip />
          <Legend
            layout="horizontal"
            align="center"
            verticalAlign="top"
            wrapperStyle={{
              maxWidth: window.innerWidth,
              padding: "20px",
              marginLeft: "10px",
            }}
            formatter={(value) => (
              <span style={{ marginRight: "10px" }}>{value}</span>
            )}
          />
          {attributeNames &&
            attributeNames.map((attribute, index) => (
              <Bar
                key={attribute}
                dataKey={attribute}
                stackId="a"
                fill={colors[index]}
              />
            ))}
        </BarChart>
      </div>
      <DropDown
        onChange={handleChange}
        onTextChange={handleTextUpdate}
        data={columns}
        setSelectedQuestions={setSelectedQuestions}
      />
    </div>
  );
};

export default App;
