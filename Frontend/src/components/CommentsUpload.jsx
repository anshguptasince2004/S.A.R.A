import React, { useState } from "react";
import { ArrowForward } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setCsvFile } from "../redux/csvSlice";


export default function CommentUpload() {
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  const [jsonData, setJsonData] = useState([]);
  const [open, setOpen] = useState(false);
 

  const handleChange = (e) => {
    if (e.target.files.length <= 0) {
      toast.error("Please upload a file");
      return;
    }

    const selectedFile = e.target.files[0];

    if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
      toast.error("Only CSV files are allowed");
      return;
    }

    setFile(selectedFile); 
     
    toast.success("Upload Successful")  // ✅ Just store file now
    setOpen(true);           // Show view/cancel options
  };

  const handleUploadAndNavigate = async () => {
    if (!file) {
      toast.error("No file selected");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:3000/api/comments/upload-csv", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      toast.success("Upload Successful");
      setJsonData(data);
      localStorage.setItem("commentsData",JSON.stringify(data.data));

        navigate("/amendments/comments", {
      state: {
        comments: data.data, // backend response
        csvFile: file        // actual File object
      },
    });
    } catch (e) {
      toast.error("Upload failed, try again");
      console.error("Comments failed ", e);
    }
  };

  const handleReset = () => {
    setFile(null);
    setOpen(false);  // ✅ Reset back to Upload state
    setJsonData([]);
  };

  return (
    <div className="flex items-center space-x-2">
      <Toaster position="top-center" reverseOrder={false} />
      {!open ? (
        <label className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
          Upload comments
          <input
            type="file"
            className="hidden"
            onChange={handleChange}
            accept=".csv"
          />
        </label>
      ) : (
        <div className="flex items-center gap-1">
          <button
            onClick={handleReset}
            className="text-red-500 hover:text-red-700 flex items-center"
          >
            <CloseIcon fontSize="small" />
          </button>
          <button
            className="text-blue-600 cursor-pointer hover:underline flex items-center gap-1"
            onClick={handleUploadAndNavigate}
          >
            View Comments <ArrowForward fontSize="small" />
          </button>
        </div>
      )}
    </div>
  );
}