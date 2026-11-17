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

  useEffect(() => {
    const getUser = async () => {
      try {
        const cached = localStorage.getItem("diu_guest_user");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.userId) {
            dispatch(setUserData(parsed));
            return;
          }
        }
      } catch (e) {
        console.error(e);
      }

      const data = await getCurrentUser();
      if (data) {
        dispatch(setUserData(data));
      }
    };
    getUser();
  }, [dispatch]);

  return (
 <>
 <Home />
{/* <CoverPage /> */}
 </>
  )
}

export default App
