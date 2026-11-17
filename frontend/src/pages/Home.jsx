import { signInWithPopup } from 'firebase/auth'
import React, { useState } from 'react'
import { auth, googleProvider } from '../../utils/firebase'
import api from '../../utils/config'
import { useDispatch, useSelector } from 'react-redux'
import { FcGoogle } from "react-icons/fc";
import { setUserData } from '../redux/userSlice'
import Sidebar from '../components/Sidebar.jsx'
import ChatArea from '../components/ChatArea.jsx'
import Artifact from '../components/Artifact.jsx'

const Home = () => {
    const { userData } = useSelector(state => state.user)
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

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
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4'>
          <div className='w-full max-w-[380px] bg-[#121520] border border-white/[0.1] rounded-2xl p-7 flex flex-col gap-5 shadow-2xl shadow-indigo-500/10'>
            <div className='flex flex-col items-center text-center gap-2'>
              <div className='w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25'>
                <span className='font-bold text-lg tracking-wider'>DIU</span>
              </div>
              <h2 className='text-lg font-bold text-slate-100 tracking-tight mt-1'>Welcome to DIU Copilot</h2>
              <p className='text-xs text-slate-400 max-w-[280px] leading-relaxed'>
                Smart academic assistant for Daffodil International University students and faculty.
              </p>
            </div>

            {errorMessage && (
              <div className='p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center leading-relaxed'>
                {errorMessage}
              </div>
            )}

            <button 
              onClick={googleLogin}
              disabled={loading}
              className='w-full flex items-center justify-center gap-3 py-3 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:opacity-90 border border-indigo-500/30 shadow-lg shadow-indigo-500/20 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'>
              <FcGoogle size={18} />
              {loading ? "Authenticating..." : "Continue with DIU Google Account"}
            </button>

            <p className='text-[11px] text-slate-400 text-center'>
              Use your institutional or personal Google account to access all AI agents, routines, and mentors.
            </p>
          </div> 
        </div>
      )}

    </div>
  )
}

export default Home
