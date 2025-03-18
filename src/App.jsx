import React, { useMemo } from "react";
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
} from "recharts";
import MyDropDown from "./components/MyDropDown";

// import MyDropDown from "./components/MyDropDown";
 

const monday = mondaySdk();

const App = () => {
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [attributeNames, setAttributeNames] = useState([]);
  const [context, setContext] = useState();
  //const [selectedQuestions, setSelectedQuestions] = useState([]);


  const columnNames = useMemo(
    () => ({
      // single_select0__1:
      //   "Please rate how effectively you were able to articulate and communicate your business's vision and goals BEFORE SQ1 Bootcamp",
      // color__1:
      //   " Please rate how effectively you were able to articulate and communicate your business's vision and goals AFTER SQ1 Bootcamp",
      // single_select8__1:
      //   "How much did you know about planning and managing business operations BEFORE SQ1 Bootcamp",
      // color1__1:
      //   "How much do you know about planning and managing business operations AFTER SQ1 Bootcamp",
      // color2__1:
      //   "How much did you know about how to market your business BEFORE SQ1 Bootcamp",
      // color5__1:
      //   "How much do you know about how to market your business AFTER SQ1 Bootcamp",
      // color0__1:
      //   "How much did you know about sales strategies BEFORE SQ1 Bootcamp",
      // color19__1:
      //   "How much do you know about sales strategies AFTER SQ1 Bootcamp",
      // color9__1:
      //   "How much did you know about planning and managing your business finances BEFORE SQ1 Bootcamp",
      // color18__1:
      //   "How much do you know about planning and managing your business finances AFTER SQ1 Bootcamp",
      // color6__1:
      //   "Please rate how familiar you were with the resources in the St. Louis entrepreneurial ecosystem BEFORE SQ1 Bootcamp",
      // color04__1:
      //   "Please rate how familiar you are with the resources in the St. Louis entrepreneurial ecosystem AFTER SQ1 Bootcamp",
      // single_select1__1:
      //   "Please rate how effectively you could establish and maintain meaningful connections within the entrepreneurial ecosystem BEFORE SQ1 Bootcamp",
      // color61__1:
      //   "Please rate how effectively you can establish and maintain meaningful connections within the entrepreneurial ecosystem AFTER SQ1 Bootcamp",
      // color4__1:
      //   "Please rate how effectively you could identify resources and reach out to them for guidance or help BEFORE SQ1 Bootcamp",
      // color3__1:
      //   "Please rate how effectively you can identify resources and reach out to them for guidance or help AFTER SQ1 Bootcamp",
    }),
    [],
  );

  useEffect(() => {
    monday.listen("context", (res) => {
      setContext(res.data);
    });

    monday.setToken(
      "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ3MzA5MjIzNCwiYWFpIjoxMSwidWlkIjo3MTY2ODg2NywiaWFkIjoiMjAyNS0wMi0xNVQxOTowOTozMS4yNDNaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTkyMjg0MTEsInJnbiI6InVzZTEifQ.1iMN8yDETWijCvnAMVp838-LdA8r2J3LSKqKUNQUHJA",
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
}`,
      )
      .then((res) => {
        console.log("Data", res)
        const items = res.data.boards[0].items_page.items;
        const columns = res.data.boards[0].columns;
        let columnNames = {}
        columns.forEach(c => {
          columnNames[c.id] = c.title
        });


        console.log("Columns", columnNames)

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
                    {},
                  ),
                },
              ];
            } else if (index === 0) {
              return [
                {
                  name: "",
                  ...Object.keys(values).reduce(
                    (acc, key) => ({ ...acc, [key]: null }),
                    {},
                  ),
                },
                formattedEntry,
              ];
            }

            return [formattedEntry];
          },
        );

        formattedData = formattedData?.filter(f => f?.name?.trim()?.length !== 0)

       console.log("Formatteed data", formattedData)
       console.log("Attributes", allAttributes)
        setColumns(formattedData);
        setAttributeNames([...allAttributes]); // Convert Set to Array
      });
  }, [columnNames]);

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
    const phrases = [
      "business's vision",
      "business operations",
      "market your business",
      "sales strategies",
      "business finances",
      "St. Louis",
      "meaningful connections",
      "guidance or help",
    ]; // 🔹 Customize with phrases

    // Check if any phrase is included in the text
    const matchedPhrases = phrases.filter((phrase) =>
      payload.value.toLowerCase().includes(phrase.toLowerCase()),
    );

    return (
      <g transform={`translate(${x},${y})`}>
        {matchedPhrases.length > 0 ? (
          matchedPhrases.map((phrase) =>
            phrase.split(" ").map((word, index) => (
              <text
                key={index}
                x={0}
                y={index * 15}
                dy={15}
                textAnchor="middle"
                fontSize={10}
                fill={context?.theme === "light" ? "#333" : "white"}
              >
                {word}
              </text>
            )),
          )
        ) : (
          <text
            x={0}
            y={15}
            textAnchor="middle"
            fontSize={10}
            fill="transparent"
          >
            {/* Empty space if no match */}
          </text>
        )}
      </g>
    );
  };
console.log("coulum data", columns)
  return (
    <>
    <div className="App">
      <BarChart
        width={1500}
        height={window.innerHeight}
        data={columns}
        barSize={50}
        margin={{ bottom: 50 }}
      >
        <CartesianGrid
          stroke={context?.theme === "light" ? "black" : "white"}
        />
        <XAxis dataKey="name" tick={<CustomXAxisTick />} interval={0} />

        <YAxis
          tick={{ fill: context?.theme === "light" ? "black" : "white" }}
          axisLine={{ stroke: context?.theme === "light" ? "black" : "white" }}
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
        {attributeNames
          ? attributeNames.map((attribute, index) => {
              return (
                <Bar dataKey={attribute} stackId="a" fill={colors[index]} />
              );
            })
          : null}
      </BarChart>{" "}
      <MyDropDown data={columns} onChange={onchange}/>   
    </div>
     
    </>
  );
};

export default App;