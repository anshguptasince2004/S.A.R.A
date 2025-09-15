import React, { useState } from "react";
import "./LoginSignup.css";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { login } from "../../redux/authSlice";

const LoginSignup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    empId: "",
    department: "",
    phone: "",
    password: "",
    confirmPassword: "",
    profilePic: "",
  });
  const [loginForm,setLoginForm] = useState({
    adminId:"",
    password:""
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handlePic = async (e) => {
    e.preventDefault();
     const file = e.target.files[0]; // ✅ get file
  

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "Joinin"); // your preset
      data.append("cloud_name", "divrqv1q7"); // your cloud name

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/divrqv1q7/image/upload",
        {
          method: "POST",
          body: data,
        }
      );

      const upload = await res.json();
      console.log("Uploaded:", upload);

      // save uploaded URL to your formData state
      setFormData((prev) => ({
        ...prev,
        profilePic: upload.secure_url || "", // Cloudinary returns secure_url
      }));
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(false);
    if (
      !formData.name ||
      !formData.email ||
      !formData.empId ||
      !formData.department||!formData.phone||!formData.password||!formData.confirmPassword
    ) {
      toast.error("Please fill all the feilds");

      
      return;
    }
    if(formData.password!=formData.confirmPassword){
      toast.error("Check Password")
    }
    try {
      let res = await fetch("http://localhost:3000/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.name,
          email: formData.email,
          adminId: formData.empId,
          department: formData.department,
          password: formData.password,
          phoneNumber: formData.phone,
          profilePic: formData.profilePic,
        }),
      });
      const result = await res.json();
      if (res.status === 201) {
        const token = result.token;

        if (!token) {
          toast.error("No token found");
          return;
        }

        const jwtToken = jwtDecode(token);
        dispatch(login({ user: result.adminInfo, token: jwtToken }));
       
        toast.success(`${result.fullName} registration successful`);

        setFormData({
          name: "",
          email: "",
          empId: "",
          department: "",
          phone: "",
          password: "",
          confirmPassword: "",
          profilePic: "",
        }); // <-- clear form fields here
        navigate("/amendments");
      } else {
        toast.error(`Error: ${result.message || "Something went wrong"}`);
      }
    } catch (e) {
      toast.error(e.message || "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChange2 = (e)=>{
    
    setLoginForm({...loginForm,[e.target.name]:e.target.value})
  }

  const handleSubmit2 = async (e) => {
    e.preventDefault();
    setLoading(true);
    if(!loginForm.adminId || !loginForm.password){
      toast.error("Please fill all the feilds");
      return;
    }
    try{
       let res = await fetch("http://localhost:3000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId:loginForm.adminId,
          password:loginForm.password
        }),
      });
     
const dataBody = await res.json();
      if (res.status === 200) {
        const token = dataBody.token;
        if (!token) {
          toast.error("No token found");
          return;
        }

        const jwtToken = jwtDecode(token);
        dispatch(
          login({
            user: dataBody.adminInfo,
            token,
            
          })
        );
        
        setLoading(false);
        toast.success(`Login Successful`);

        navigate("/amendments");
        setLoginForm({adminId:"",password:""}) 
      }
    } catch (e) {
     
      toast.error(`Error: ${e.message || "Something went wrong"}`);
    } finally {
      setLoading(false);
    }



  };

  return (
    <div className="page">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="auth-box">
        <div className="auth-header">
          <img
            src="https://cdn-icons-png.flaticon.com/512/1828/1828490.png"
            alt="logo"
            className="logo"
          />
          <h1 className="app-title">S.A.R.A</h1>
          <p className="subtitle">Sentiment Analysis & Reporting Assistant</p>
        </div>

        <div className="card">
          <h2>{isLogin ? "Secure Login" : "Administrator Registration"}</h2>
          <p className="card-subtitle">
            {isLogin
              ? "Enter your credentials to access your dashboard."
              : "Create an account for MCA Admins"}
          </p>

          {isLogin ? (
            <>
              <form className="auth-form" onSubmit={handleSubmit2}>
                <input
                
                  type="text"
                  name="adminId"
                  placeholder="Enter AdminId"
                  value={loginForm.adminId}
                  onChange={handleChange2}
                  required
                />
                <input
                
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={handleChange2}
                  required
                />
                <button type="submit" className="submit-btn">
                  {loading?<CircularProgress/>:"Login"}
                </button>
              </form>
            </>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="signup-grid">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <input
                class="reg"
                  type="email"
                  name="email"
                  placeholder="Official Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="empId"
                  placeholder="Employee ID"
                  value={formData.empId}
                  onChange={handleChange}
                  required
                />
                <input
                class="reg"
                  type="text"
                  name="department"
                  placeholder="Department / Designation"
                  value={formData.department}
                  onChange={handleChange}
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
                <input
                class="reg"
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <input
                  className="confirmpw"
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <input
                id="pic"
                  type="file"
                  name="profilePic"
                  onChange={handlePic}
                  className=""
                />
                <button type="submit" className="submit-btn">
                  {loading?<CircularProgress/>:"Sign Up"}
                </button>
              </div>
            </form>
          )}

          <p className="switch-text">
            {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
            <span onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Sign up" : "Log in"}
            </span>
          </p>
        </div>

        <footer className="footer">© 2025 S.A.R.A. All rights reserved.</footer>
      </div>
    </div>
  );
};

export default LoginSignup;
