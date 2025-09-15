import { motion } from "framer-motion";
import { ArrowForward, Add, Notifications } from "@mui/icons-material";
import CommentUpload from "./components/CommentsUpload";
import CommentsPage from "./CommentsPage";
import { useNavigate } from "react-router-dom";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Avatar from '@mui/material/Avatar';

import { useSelector, useDispatch } from "react-redux";

const amendments = [
    {
        id: "#2024-001",
        title: "Amendment to the Public Health Act",
        status: "Pending Review",
        color: "bg-yellow-100 text-yellow-800",
        date: "2024-07-26",
    },
    {
        id: "#2024-002",
        title: "Amendment to the Education Reform Bill",
        status: "Approved",
        color: "bg-green-100 text-green-800",
        date: "2024-07-20",
    },
    {
        id: "#2024-003",
        title: "Amendment to the Environmental Protection Law",
        status: "Rejected",
        color: "bg-red-100 text-red-800",
        date: "2024-07-15",
    },
    {
        id: "#2024-004",
        title: "Amendment to the Transportation Infrastructure Plan",
        status: "Pending Review",
        color: "bg-yellow-100 text-yellow-800",
        date: "2024-07-10",
    },
    {
        id: "#2024-005",
        title: "Amendment to the Social Welfare Program",
        status: "Approved",
        color: "bg-green-100 text-green-800",
        date: "2024-07-05",
    },
];

export default function Amendments() {
    const navigate = useNavigate();
    const {user } = useSelector((state)=>state.auth)
    
    
    return (
        <div className="flex min-h-screen flex-col bg-slate-50 font-inter">

            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg">
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                            <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                            <polyline points="16.5 19.79 16.5 14.6 21 12"></polyline>
                            <polyline points="12 12.01 12 22.42"></polyline>
                            <line x1="12" x2="3" y1="12" y2="12"></line>
                            <line x1="12" x2="21" y1="12" y2="12"></line>
                        </svg>
                    </div>
                    <h1 className="text-lg font-bold text-slate-900">S.A.R.A.</h1>
                </div>
                <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
                    <button
                        onClick={() => navigate("/amendments")}
                        className="font-semibold text-blue-600"
                    >
                        Amendments
                    </button>
                    <button
                        onClick={() => navigate("/settings")}
                        className="text-slate-600 hover:text-slate-900"
                    >
                        Settings
                    </button>
                </nav>
                <div className="flex items-center gap-4">
                    <button className="rounded-full p-2 hover:bg-slate-100">
                        <Notifications className="text-slate-500" />
                    </button>
                    {user.profilePic.length>0? <Avatar alt="Travis Howard" sx={{fontSize:"large"}} src={user.profilePic} />
                    :<AccountCircleIcon fontSize="large"/>}
                   
                </div>
            </header>

            <main className="flex-1">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                                Amendments
                            </h2>
                            <p className="text-sm text-slate-500">
                                Review and manage proposed amendments.
                            </p>
                        </div>
                        <button className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:to-indigo-600 focus-visible:outline  focus-visible:outline-offset-2 focus-visible:outline-blue-500">
                            <Add fontSize="small" />
                            <span>New Amendment</span>
                        </button>
                    </div>

                    <motion.div
                        className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-600 sm:pl-6">
                                            Amendment ID
                                        </th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-600">
                                            Title
                                        </th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-600">
                                            Status
                                        </th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-600">
                                            Date Submitted
                                        </th>
                                        <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Action</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {amendments.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50">
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-500 sm:pl-6">
                                                {item.id}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-900">
                                                {item.title}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${item.color}`}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                                                {item.date}
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <a
                                                    className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700"
                                                    href="#"
                                                >
                                                    <CommentUpload />
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <nav
                            aria-label="Pagination"
                            className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6"
                        >
                            <div className="hidden sm:block">
                                <p className="text-sm text-slate-700">
                                    Showing <span className="font-medium">1</span> to{" "}
                                    <span className="font-medium">5</span> of{" "}
                                    <span className="font-medium">20</span> results
                                </p>
                            </div>
                            <div className="flex flex-1 justify-between sm:justify-end">
                                <a
                                    href="#"
                                    className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Previous
                                </a>
                                <a
                                    href="#"
                                    className="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Next
                                </a>
                            </div>
                        </nav>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}