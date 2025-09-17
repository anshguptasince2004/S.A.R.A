import { motion } from "framer-motion";
import { Avatar, Button } from "@mui/material";
import { PictureAsPdf } from "@mui/icons-material";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import React, { useEffect, useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import { useLocation } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import CommentsDashboard from "./components/PopUp";

const COLORS = ["#3b82f6", "#94a3b8", "#ef4444"];

function StatCard({ title, value, valueColor, isLoading, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      onClick={onClick}
      className="p-6 rounded-lg shadow bg-white flex flex-col justify-center text-center cursor-pointer"
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
  const [openPopup, setOpenPopup] = useState(null); // "positive" | "negative" | "neutral" | null

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
            className="normal-case !bg-gray-100 !text-gray-800 !rounded-lg hover:!bg-gray-200 shadow-sm !border-0"
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
            Detailed sentiment analysis for the comments on selected amendment{" "}
            <span className="italic"> with a 88% accurate report</span>.
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
                onClick={() => setOpenPopup("positive")}
              />
              <StatCard
                title="Negative Comments"
                value={negative}
                valueColor="text-red-600"
                isLoading={reportLoading}
                onClick={() => setOpenPopup("negative")}
              />
              <StatCard
                title="Neutral Comments"
                value={neutral}
                valueColor="text-gray-500"
                isLoading={reportLoading}
                onClick={() => setOpenPopup("neutral")}
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
      {openPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setOpenPopup(null)} // close when background clicked
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-2xl w-[95%] max-w-3xl h-[80vh] overflow-y-auto p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <CommentsDashboard sentiment={openPopup} />
          </motion.div>

        </motion.div>
      )}
    </div>
  );
}
