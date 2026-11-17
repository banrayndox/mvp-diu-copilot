import { signInWithPopup } from 'firebase/auth'
import React, { useState } from 'react'
import { auth, googleProvider } from '../../utils/firebase'
import api from '../../utils/config'
import { useDispatch, useSelector } from 'react-redux'
import { FcGoogle } from "react-icons/fc";
import { Sparkles, UserCheck } from 'lucide-react';
import { setUserData } from '../redux/userSlice'
import Sidebar from '../components/Sidebar.jsx'
import ChatArea from '../components/ChatArea.jsx'
import Artifact from '../components/Artifact.jsx'

export const STATIC_GUEST_USER = {
  userId: "recruiter_guest_2026",
  name: "Recruiter / Reviewer (Guest)",
  email: "recruiter.guest@diu.edu.bd",
  avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=diu-copilot-guest",
  role: "recruiter_guest",
  department: "Computer Science and Engineering",
  studentId: "221-15-RECRUITER"
};

const Home = () => {
    const { userData } = useSelector(state => state.user)
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleGuestLogin = () => {
      localStorage.setItem("diu_guest_user", JSON.stringify(STATIC_GUEST_USER));
      dispatch(setUserData(STATIC_GUEST_USER));
    };

    const handleLogin = async (token) => {
      try {
        setLoading(true);
        setErrorMessage("");
        const { data } = await api.post('/api/auth/login', { token });
        if (data?.user) {
          dispatch(setUserData(data.user));
        } else {
          setErrorMessage("Failed to authenticate user.");
        }
      } catch (error) {
        console.error("Login API error:", error);
        setErrorMessage(error.response?.data?.message || "Login failed. Please check the backend connection.");
      } finally {
        setLoading(false);
      }
    }

  const googleLogin = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result?.user?.getIdToken();
      if (token) {
        await handleLogin(token);
      }
    } catch (error) {
      console.error("Google sign in error:", error);
      setErrorMessage(error.message || "Google sign-in failed.");
      setLoading(false);
    }
  }

  return (
    <div className='h-screen min-w-0 flex bg-[#0d0f14] text-white overflow-hidden'>
      <Sidebar />
      <ChatArea />
      <Artifact />

      {!userData && (  
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4'>
          <div className='w-full max-w-[420px] bg-[#121520] border border-white/[0.12] rounded-3xl p-7 flex flex-col gap-5 shadow-2xl shadow-indigo-500/20'>
            <div className='flex flex-col items-center text-center gap-2'>
              <div className='w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30'>
                <span className='font-extrabold text-xl tracking-wider'>DIU</span>
              </div>
              <h2 className='text-xl font-bold text-slate-100 tracking-tight mt-1'>Welcome to DIU Copilot</h2>
              <p className='text-xs text-slate-400 max-w-[320px] leading-relaxed'>
                Smart AI-Powered Digital Campus Assistant for Daffodil International University.
              </p>
            </div>

            {errorMessage && (
              <div className='p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center leading-relaxed'>
                {errorMessage}
              </div>
            )}

            <div className='flex flex-col gap-3 w-full'>
              <button 
                onClick={handleGuestLogin}
                className='w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.99] border border-emerald-400/40 shadow-xl shadow-emerald-500/25 transition-all duration-150 cursor-pointer'>
                <Sparkles size={16} className='text-amber-200 animate-pulse' />
                <span>Join as Guest (Recruiter Demo)</span>
              </button>

              <div className='flex items-center gap-2.5 my-0.5'>
                <div className='flex-1 h-[1px] bg-white/[0.08]' />
                <span className='text-[10px] text-slate-500 font-medium uppercase tracking-wider'>or</span>
                <div className='flex-1 h-[1px] bg-white/[0.08]' />
              </div>

              <button 
                onClick={googleLogin}
                disabled={loading}
                className='w-full flex items-center justify-center gap-3 py-3 rounded-2xl text-xs font-semibold text-slate-200 bg-white/[0.04] hover:bg-white/[0.08] active:opacity-90 border border-white/[0.08] transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'>
                <FcGoogle size={17} />
                {loading ? "Authenticating..." : "Continue with DIU Google Account"}
              </button>
            </div>

            <div className='p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 text-center leading-relaxed'>
              💡 <strong>Recruiter Notice:</strong> Guest mode gives immediate, full access to all features (Routines, Mentors, Canvas Artifacts, Lost & Found, and Multi-Agent Routing) with pre-loaded demo templates.
            </div>
          </div> 
        </div>
      )}

    </div>
  )
}

export default Home
