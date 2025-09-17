// import { motion } from "framer-motion";
// import { Avatar, Button } from "@mui/material";
// import { PictureAsPdf } from "@mui/icons-material";
// import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
// import React, { useEffect, useRef, useState } from "react";
// import * as htmlToImage from "html-to-image";
// import jsPDF from "jspdf";
// import { useLocation } from "react-router-dom";
// import CircularProgress from "@mui/material/CircularProgress";

// // Default data for the pie chart before the API response is loaded
// const defaultPieData = [
//   { name: "Positive", value: 1050 },
//   { name: "Neutral", value: 300 },
//   { name: "Negative", value: 150 },
// ];

// const COLORS = ["#3b82f6", "#94a3b8", "#ef4444"];

// function StatCard({ title, value, valueColor, isLoading }) {
//   return (
//     <motion.div
//       whileHover={{ y: -3 }}
//       className="p-6 rounded-lg shadow bg-white flex flex-col justify-center text-center"
//     >
//       <div className="text-sm text-gray-600 mb-1">{title}</div>
//       <div className={`text-3xl font-bold ${valueColor}`}>
//         {isLoading ? (
//           <CircularProgress size={24} color="inherit" />
//         ) : (
//           value.toLocaleString()
//         )}
//       </div>
//     </motion.div>
//   );
// }
// // A custom pie chart component using SVG.
//   const PieChart2 = ({ data, innerRadius, outerRadius, startAngle, endAngle }) => {
//     // Check for valid data to prevent errors.
//     if (!data || data.length === 0) return null;

//     const totalValue = data.reduce((sum, d) => sum + d.value, 0);
//     let currentAngle = startAngle;

//     return (
//       <svg className="w-full h-full" viewBox="-100 -100 200 200">
//         {data.map((item, index) => {
//           const start = currentAngle;
//           const end = currentAngle + (item.value / totalValue) * (startAngle - endAngle);
//           currentAngle = end;

//           const arcGenerator = d3.arc()
//             .innerRadius(innerRadius)
//             .outerRadius(outerRadius)
//             .startAngle(d3.degToRad(start))
//             .endAngle(d3.degToRad(end));

//           return (
//             <path key={index} d={arcGenerator.path()} fill={item.color} />
//           );
//         })}
//       </svg>
//     );
//   };

//   // Utility function for degrees to radians
//   const d3 = {
//     degToRad: (deg) => deg * (Math.PI / 180),
//     arc: () => {
//       let innerR, outerR, startA, endA;
//       return {
//         innerRadius: (r) => { innerR = r; return d3.arc(); },
//         outerRadius: (r) => { outerR = r; return d3.arc(); },
//         startAngle: (a) => { startA = a; return d3.arc(); },
//         endAngle: (a) => { endA = a; return d3.arc(); },
//         centroid: () => {
//           const a = (startA + endA) / 2;
//           const r = (innerR + outerR) / 2;
//           return [Math.cos(a) * r, Math.sin(a) * r];
//         },
//         path() {
//           const a0 = startA, a1 = endA;
//           const r0 = innerR, r1 = outerR;

//           const x0 = r1 * Math.sin(a0),
//             y0 = -r1 * Math.cos(a0),
//             x1 = r1 * Math.sin(a1),
//             y1 = -r1 * Math.cos(a1);
//           const x2 = r0 * Math.sin(a1),
//             y2 = -r0 * Math.cos(a1),
//             x3 = r0 * Math.sin(a0),
//             y3 = -r0 * Math.cos(a0);

//           const largeArc = a1 - a0 > Math.PI ? 1 : 0;
//           return `
//             M${x0},${y0}
//             A${r1},${r1} 0 ${largeArc} 1 ${x1},${y1}
//             L${x2},${y2}
//             A${r0},${r0} 0 ${largeArc} 0 ${x3},${y3}
//             Z
//           `;
//         }
//       };
//     }
//   };

// export default function AmendmentReport() {
//   const reportRef = useRef();
//   const location = useLocation();
//   const csvFile = location.state?.csvFile;

//   const [mlResult, setMlResult] = useState({});
//   const [reportLoading, setReportLoading] = useState(true);

//   useEffect(() => {
//     const sendCsvToML = async () => {
//       if (!csvFile) return;
//       setReportLoading(true);

//       const formData = new FormData();
//       formData.append("file", csvFile);

//       try {
//         const res = await fetch("http://localhost:5000/analyze", {
//           method: "POST",
//           body: formData,
//         });

//         const contentType = res.headers.get("content-type");
//         if (contentType && contentType.includes("application/json")) {
//           const data = await res.json();
//           setMlResult(data);
//           console.log("The ML reports are ", data);
//         } else {
//           const text = await res.text();
//           console.error("Flask server did not return JSON:", text);
//           setMlResult({ error: "Flask server did not return JSON" });
//         }
//       } catch (err) {
//         console.error("Fetch error:", err);
//         setMlResult({ error: err.message });
//       } finally {
//         setReportLoading(false);
//       }
//     };

//     sendCsvToML();
//   }, [csvFile]);

//   const positive = mlResult?.sentiment_counts?.positive || 0;
//   const negative = mlResult?.sentiment_counts?.negative || 0;
//   const neutral = mlResult?.sentiment_counts?.neutral || 0;
//   const total = positive + negative + neutral || 1500;

//   const Pp = ((positive / total) * 100).toFixed(2);
//   const Np = ((negative / total) * 100).toFixed(2);
//   const Nup = ((neutral / total) * 100).toFixed(2);

//    const pieData = [
//     { name: "Positive", value: positive, color: COLORS[0] },
//     { name: "Neutral", value: neutral, color: COLORS[1] },
//     { name: "Negative", value: negative, color: COLORS[2] },
//   ];

//   const downloadPDF = async () => {
//     if (!reportRef.current) {
//       console.error(" reportRef is null, nothing to capture");
//       return;
//     }

//     try {
//       console.log(" Capturing report...");
//       const dataUrl = await htmlToImage.toPng(reportRef.current, {
//         cacheBust: true,
//         backgroundColor: "white",
//       });

//       console.log(" Image captured, generating PDF...");

//       const pdf = new jsPDF("l", "mm", "a4");
//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const imgProps = pdf.getImageProperties(dataUrl);
//       const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

//       pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, imgHeight);
//       pdf.save("AmendmentReport.pdf");
//       console.log(" PDF saved in landscape mode!");
//     } catch (error) {
//       console.error(" PDF download failed:", error);
//     }
//   };

//   return (
//     <div className="flex flex-col min-h-screen bg-gray-50" ref={reportRef}>
//       <header className="flex items-center justify-between h-20 px-10 border-b border-gray-200 bg-white shadow-sm">
//         <h1 className="text-2xl font-bold text-gray-900">
//           Amendment 3 Analysis
//           <span className="ml-3 px-3 py-1 text-sm bg-gray-100 rounded">
//             Status: <strong className="text-green-600">Passed</strong>
//           </span>
//         </h1>
//         <div className="flex items-center gap-4">
//           <Button
//             variant="outlined"
//             startIcon={<PictureAsPdf />}
//             size="small"
//             className="normal-case !bg-gray-100 !text-gray-800 normal-case !rounded-lg hover:!bg-gray-200 shadow-sm !border-0"
//             onClick={downloadPDF}
//             disabled={reportLoading}
//           >
//             Download PDF
//           </Button>
//           <Avatar className="ml-6" src="/avatar.png" />
//         </div>
//       </header>

//       {/* Main content */}
//       <main className="flex-1 p-10">
//         <div className="max-w-6xl mx-auto space-y-8">
//          <p className="text-gray-900  ">
//   Detailed sentiment analysis for the selected amendment <span className="italic"> with a ##% accurate report</span>.
// </p>

//           {/* Sentiment + Stats */}
//           <motion.div
//             initial={{ opacity: 0, y: 8 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4 }}
//             className="grid grid-cols-12 gap-8"
//           >
//             {/* Pie chart */}
//             <div className="col-span-12 lg:col-span-5 bg-white rounded-lg p-6 shadow">
//               <h3 className="text-lg font-semibold mb-4">
//                 Sentiment Distribution
//               </h3>
//               <div className="flex items-center gap-6">
//                 <div className="w-48 h-48">
//                   <ResponsiveContainer width="100%" height="100%">
//                     {reportLoading ? (
//                       <div className="flex items-center justify-center w-full h-full">
//                         <CircularProgress size={60} />
//                       </div>
//                     ) : (
//                       <PieChart>
//                         <Pie
//                           data={pieData}
//                           innerRadius={70}
//                           outerRadius={90}
//                           dataKey="value"
//                           startAngle={90}
//                           endAngle={-270}
//                         >
//                           {pieData.map((entry, index) => (
//                             <Cell
//                               key={`cell-${index}`}
//                               fill={COLORS[index % COLORS.length]}
//                             />
//                           ))}
//                         </Pie>
//                       </PieChart>
//                     )}
//                   </ResponsiveContainer>
//                 </div>
//                 <div>
//                   <div className="text-3xl font-bold">
//                     {reportLoading ? (
//                       <CircularProgress size={30} />
//                     ) : (
//                       total.toLocaleString()
//                     )}
//                   </div>
//                   <div className="text-sm text-gray-500">Total Comments</div>
//                   <ul className="mt-4 text-sm space-y-1 text-gray-600">
//                     <li>
//                       <span
//                         className="inline-block w-3 h-3 rounded-full mr-2"
//                         style={{ background: COLORS[0] }}
//                       ></span>
//                       Positive{" "}
//                       <span className="text-gray-500">
//                         {reportLoading ? "..." : `${Pp}%`}
//                       </span>
//                     </li>
//                     <li>
//                       <span
//                         className="inline-block w-3 h-3 rounded-full mr-2"
//                         style={{ background: COLORS[1] }}
//                       ></span>
//                       Neutral{" "}
//                       <span className="text-gray-500">
//                         {reportLoading ? "..." : `${Nup}%`}
//                       </span>
//                     </li>
//                     <li>
//                       <span
//                         className="inline-block w-3 h-3 rounded-full mr-2"
//                         style={{ background: COLORS[2] }}
//                       ></span>
//                       Negative{" "}
//                       <span className="text-gray-500">
//                         {reportLoading ? "..." : `${Np}%`}
//                       </span>
//                     </li>
//                   </ul>
//                 </div>
//               </div>
//             </div>

//             {/* Stats + Analysis */}
//             <div className="col-span-12 lg:col-span-7 grid grid-cols-3 gap-6">
//               <StatCard
//                 title="Positive Comments"
//                 value={positive}
//                 valueColor="text-blue-600"
//                 isLoading={reportLoading}
//               />
//               <StatCard
//                 title="Negative Comments"
//                 value={negative}
//                 valueColor="text-red-600"
//                 isLoading={reportLoading}
//               />
//               <StatCard
//                 title="Neutral Comments"
//                 value={neutral}
//                 valueColor="text-gray-500"
//                 isLoading={reportLoading}
//               />

//               <motion.div
//                 whileHover={{ y: -3 }}
//                 className="col-span-3 bg-white rounded-lg p-6 shadow"
//               >
//                 <h3 className="text-lg font-semibold mb-2">Overall Analysis</h3>
//                 <p className="text-sm text-gray-600">
//                   {reportLoading ? (
//                     "Analyzing data..."
//                   ) : (
//                     <>
//                       The dominant sentiment for Amendment 3 is{" "}
//                       <strong className="text-blue-600">
//                         Overwhelmingly Positive
//                       </strong>
//                       , with a significant majority of feedback expressing
//                       support. This suggests strong public approval.
//                     </>
//                   )}
//                 </p>
//               </motion.div>
//             </div>
//           </motion.div>

//           {/* Keywords + Summary */}
//           <div className="grid grid-cols-12 gap-8">
//             <motion.div
//               whileHover={{ y: -3 }}
//               className="col-span-12 lg:col-span-6 bg-white rounded-lg p-6 shadow"
//             >
//               <h3 className="text-lg font-semibold mb-3">Frequent Keywords</h3>
//               <div className="flex flex-wrap gap-3">
//                 {reportLoading ? (
//                   <div className="w-full text-center py-10">
//                     <CircularProgress />
//                     <p className="text-gray-500 mt-2">Generating word clouds...</p>
//                   </div>
//                 ) : (
//                   <>
//                     <div className="my-5">
//                       <h2 className="text-bold text-xl underline my-3">Positive Cloud</h2>
//                       <img
//                         src={`http://localhost:5000${mlResult?.wordclouds?.positive?.url}`}
//                         alt="Positive Word Cloud"
//                       />
//                     </div>
//                     <div className="my-4">
//                       <h2 className="text-bold text-xl underline">Negative Cloud</h2>
//                       <img
//                         src={`http://localhost:5000${mlResult?.wordclouds?.negative?.url}`}
//                         alt="Negative Word Cloud"
//                       />
//                     </div>
//                     <div className="my-4">
//                       <h2 className="text-bold text-xl underline">Neutral Cloud</h2>
//                       <img
//                         src={`http://localhost:5000${mlResult?.wordclouds?.neutral?.url}`}
//                         alt="Neutral Word Cloud"
//                       />
//                     </div>
//                   </>
//                 )}
//               </div>
//             </motion.div>

//             <motion.div
//               whileHover={{ y: -3 }}
//               className="col-span-12 lg:col-span-6 bg-white rounded-lg p-6 shadow w-fit h-fit"
//             >
//               <h3 className="text-lg font-semibold mb-3">AI-Generated Summary</h3>
//               {reportLoading ? (
//                 <div className="text-sm text-gray-900 leading-relaxed text-center py-10">
//                   <CircularProgress size={30} />
//                   <p className="text-gray-500 mt-2">Generating summary...</p>
//                 </div>
//               ) : (
//                 <div className="text-sm text-gray-900 leading-relaxed">
//                   <h2 className="font-bold text-[18px] my-2">Positive Data</h2>
//                   <p> {mlResult?.summaries?.positive}</p>
//                   <h2 className="font-bold text-[18px] my-2">Negative Data</h2>
//                   <p> {mlResult?.summaries?.negative}</p>
//                   <h2 className="font-bold text-[18px] my-2">Neutral Data</h2>
//                   <p> {mlResult?.summaries?.neutral}</p>
//                 </div>
//               )}
//             </motion.div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

// import { motion } from "framer-motion";
import { motion } from "framer-motion";
import { Avatar, Button } from "@mui/material";
import { PictureAsPdf } from "@mui/icons-material";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import React, { useEffect, useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import { useLocation } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";

const COLORS = ["#3b82f6", "#94a3b8", "#ef4444"];

function StatCard({ title, value, valueColor, isLoading }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="p-6 rounded-lg shadow bg-white flex flex-col justify-center text-center"
    >
      <div className="text-sm text-gray-600 mb-1">{title}</div>
      <div className={`text-3xl font-bold ${valueColor}`}>
        {isLoading ? (
          <CircularProgress size={24} color="inherit" />
        ) : value !== null ? (
          value.toLocaleString()
        ) : (
          "--"
        )}
      </div>
    </motion.div>
  );
}

export default function AmendmentReport() {
  const reportRef = useRef();
  const location = useLocation();
  const csvFile = location.state?.csvFile;
  const Id = localStorage.getItem("aId") || "Amend126";
  console.log("The Id is ", Id);

  const [mlResult, setMlResult] = useState(null); // null means no data yet
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const sendCsvToML = async () => {
      if (!csvFile) return;
      setReportLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", csvFile);
      formData.append("amendmentId", Id);

      try {
        const res = await fetch("http://localhost:3000/api/ml/analyze", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`Server responded with ${res.status}`);
        }

        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();

          if (data.error) {
            // backend sent an error JSON
            throw new Error(data.error);
          }

          setMlResult(data);
          console.log("The ML reports are ", data);
        } else {
          const text = await res.text();
          throw new Error("Flask server did not return JSON: " + text);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
        setMlResult(null);
      } finally {
        setReportLoading(false);
      }
    };

    sendCsvToML();
  }, [csvFile]);

  // Derived values (null until data is ready)
  const positive = mlResult?.sentiment_counts?.positive ?? null;
  const negative = mlResult?.sentiment_counts?.negative ?? null;
  const neutral = mlResult?.sentiment_counts?.neutral ?? null;
  const total =
    positive !== null && negative !== null && neutral !== null
      ? positive + negative + neutral
      : null;

  const Pp = total ? ((positive / total) * 100).toFixed(2) : null;
  const Np = total ? ((negative / total) * 100).toFixed(2) : null;
  const Nup = total ? ((neutral / total) * 100).toFixed(2) : null;

  const pieData = total
    ? [
        { name: "Positive", value: positive, color: COLORS[0] },
        { name: "Neutral", value: neutral, color: COLORS[1] },
        { name: "Negative", value: negative, color: COLORS[2] },
      ]
    : [];

  const downloadPDF = async () => {
    if (!reportRef.current) {
      console.error("reportRef is null, nothing to capture");
      return;
    }

    try {
      console.log("Capturing report...");
      const dataUrl = await htmlToImage.toPng(reportRef.current, {
        cacheBust: true,
        backgroundColor: "white",
      });

      console.log("Image captured, generating PDF...");

      const pdf = new jsPDF("l", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(dataUrl);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, imgHeight);
      pdf.save("AmendmentReport.pdf");
      console.log("PDF saved in landscape mode!");
    } catch (error) {
      console.error("PDF download failed:", error);
    }
  };

  useEffect(() => {
    if (!mlResult) return;

    const savedKey = `saved_${Id}`;
    if (localStorage.getItem(savedKey)) {
      console.log(`⚠️ Already saved ML result for ${Id}`);
      return;
    }

    const saveResultToDB = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/amend/${Id}/saveAmends`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(mlResult),
          }
        );

        if (!res.ok) {
          throw new Error(`Server responded with ${res.status}`);
        }

        const data = await res.json();
        console.log("✅ ML Result saved:", data);

        // Mark as saved
        localStorage.setItem(savedKey, "true");
      } catch (err) {
        console.error("❌ Failed to save ML result:", err);
      }
    };

    saveResultToDB();
  }, [mlResult, Id]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50" ref={reportRef}>
      <header className="flex items-center justify-between h-20 px-10 border-b border-gray-200 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          Amendment 3 Analysis
          <span className="ml-3 px-3 py-1 text-sm bg-gray-100 rounded">
            Status: <strong className="text-green-600">Passed</strong>
          </span>
        </h1>
        <div className="flex items-center gap-4">
          <Button
            variant="outlined"
            startIcon={<PictureAsPdf />}
            size="small"
            className="normal-case !bg-gray-100 !text-gray-800 normal-case !rounded-lg hover:!bg-gray-200 shadow-sm !border-0"
            onClick={downloadPDF}
            disabled={reportLoading}
          >
            Download PDF
          </Button>
          <Avatar className="ml-6" src="/avatar.png" />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-10">
        <div className="max-w-6xl mx-auto space-y-8">
          <p className="text-gray-900">
            Detailed sentiment analysis for the selected amendment{" "}
            <span className="italic"> with a 87.28% accurate report</span>.
          </p>

          {/* Error Display */}

          {/* Sentiment + Stats */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-12 gap-8"
          >
            {/* Pie chart */}
            <div className="col-span-12 lg:col-span-5 bg-white rounded-lg p-6 shadow">
              <h3 className="text-lg font-semibold mb-4">
                Sentiment Distribution
              </h3>
              <div className="flex items-center gap-6">
                <div className="w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    {reportLoading ? (
                      <div className="flex items-center justify-center w-full h-full">
                        <CircularProgress size={60} />
                      </div>
                    ) : total ? (
                      <PieChart>
                        <Pie
                          data={pieData}
                          innerRadius={70}
                          outerRadius={90}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                        >
                          {pieData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    ) : (
                      <p className="text-gray-500 text-center">No data</p>
                    )}
                  </ResponsiveContainer>
                </div>
                <div>
                  <div className="text-3xl font-bold">
                    {reportLoading ? (
                      <CircularProgress size={30} />
                    ) : total ? (
                      total.toLocaleString()
                    ) : (
                      "--"
                    )}
                  </div>
                  <div className="text-sm text-gray-500">Total Comments</div>
                  {total && (
                    <ul className="mt-4 text-sm space-y-1 text-gray-600">
                      <li>
                        <span
                          className="inline-block w-3 h-3 rounded-full mr-2"
                          style={{ background: COLORS[0] }}
                        ></span>
                        Positive{" "}
                        <span className="text-gray-500">
                          {reportLoading ? "..." : `${Pp}%`}
                        </span>
                      </li>
                      <li>
                        <span
                          className="inline-block w-3 h-3 rounded-full mr-2"
                          style={{ background: COLORS[1] }}
                        ></span>
                        Neutral{" "}
                        <span className="text-gray-500">
                          {reportLoading ? "..." : `${Nup}%`}
                        </span>
                      </li>
                      <li>
                        <span
                          className="inline-block w-3 h-3 rounded-full mr-2"
                          style={{ background: COLORS[2] }}
                        ></span>
                        Negative{" "}
                        <span className="text-gray-500">
                          {reportLoading ? "..." : `${Np}%`}
                        </span>
                      </li>
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Stats + Analysis */}
            <div className="col-span-12 lg:col-span-7 grid grid-cols-3 gap-6">
              <StatCard
                title="Positive Comments"
                value={positive}
                valueColor="text-blue-600"
                isLoading={reportLoading}
              />
              <StatCard
                title="Negative Comments"
                value={negative}
                valueColor="text-red-600"
                isLoading={reportLoading}
              />
              <StatCard
                title="Neutral Comments"
                value={neutral}
                valueColor="text-gray-500"
                isLoading={reportLoading}
              />

              <motion.div
                whileHover={{ y: -3 }}
                className="col-span-3 bg-white rounded-lg p-6 shadow"
              >
                <h3 className="text-lg font-semibold mb-2">Overall Analysis</h3>
                <p className="text-sm text-gray-600">
                  {reportLoading ? (
                    "Analyzing data..."
                  ) : total ? (
                    <>
                      The dominant sentiment for Amendment 3 is{" "}
                      <strong className="text-blue-600">
                        Overwhelmingly Positive
                      </strong>
                      , with a significant majority of feedback expressing
                      support. This suggests strong public approval.
                    </>
                  ) : (
                    "No data available"
                  )}
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Keywords + Summary */}
          <div className="grid grid-cols-12 gap-8">
            <motion.div
              whileHover={{ y: -3 }}
              className="col-span-12 lg:col-span-6 bg-white rounded-lg p-6 shadow"
            >
              <h3 className="text-lg font-semibold mb-3">Frequent Keywords</h3>
              <div className="flex flex-wrap gap-3">
                {reportLoading ? (
                  <div className="w-full text-center py-10">
                    <CircularProgress />
                    <p className="text-gray-500 mt-2">
                      Generating word clouds...
                    </p>
                  </div>
                ) : mlResult?.wordclouds ? (
                  <>
                    <div className="my-5">
                      <h2 className="text-bold text-xl underline my-3">
                        Positive Cloud
                      </h2>
                      <img
                        src={`http://localhost:5000${mlResult.wordclouds.positive?.url.replace(
                          "#",
                          "%23"
                        )}`}
                        alt="Positive Word Cloud"
                      />
                    </div>
                    <div className="my-4">
                      <h2 className="text-bold text-xl underline">
                        Negative Cloud
                      </h2>
                      <img
                        src={`http://localhost:5000${mlResult.wordclouds.negative?.url.replace(
                          "#",
                          "%23"
                        )}`}
                        alt="Positive Word Cloud"
                      />
                    </div>
                    <div className="my-4">
                      <h2 className="text-bold text-xl underline">
                        Neutral Cloud
                      </h2>
                      <img
                        src={`http://localhost:5000${mlResult.wordclouds.neutral?.url.replace(
                          "#",
                          "%23"
                        )}`}
                        alt="Positive Word Cloud"
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500">No word clouds available</p>
                )}
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -3 }}
              className="col-span-12 lg:col-span-6 bg-white rounded-lg p-6 shadow w-fit h-fit"
            >
              <h3 className="text-lg font-semibold mb-3">
                AI-Generated Summary
              </h3>
              {reportLoading ? (
                <div className="text-sm text-gray-900 leading-relaxed text-center py-10">
                  <CircularProgress size={30} />
                  <p className="text-gray-500 mt-2">Generating summary...</p>
                </div>
              ) : mlResult?.summaries ? (
                <div className="text-sm text-gray-900 leading-relaxed">
                  <h2 className="font-bold text-[18px] my-2">Positive Data</h2>
                  <p>{mlResult.summaries.positive}</p>
                  <h2 className="font-bold text-[18px] my-2">Negative Data</h2>
                  <p>{mlResult.summaries.negative}</p>
                  <h2 className="font-bold text-[18px] my-2">Neutral Data</h2>
                  <p>{mlResult.summaries.neutral}</p>
                </div>
              ) : (
                <p className="text-gray-500">No summary available</p>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
