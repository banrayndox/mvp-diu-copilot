import { signInWithPopup } from 'firebase/auth'
import React from 'react'
import { auth, googleProvider } from '../utils/firebase'
import api from '../utils/config'
import Home from './pages/Home'
import { useEffect } from 'react'
import getCurrentUser from './features/getCurrentUser'
import { useDispatch } from 'react-redux'
import { setUserData } from './redux/userSlice'
import CoverPage from './tests/CoverPage'
const App = () => {
  const dispatch = useDispatch();

    useEffect(()=>{
      const getUser = async () => {
      const data = await getCurrentUser();
      dispatch(setUserData(data));
      }
      getUser();
    },[]);

  return (
 <>
 <Home />
{/* <CoverPage /> */}
 </>
  )
}

export default App
