import { createContext, useContext, useEffect, useState } from 'react';
import { authMe } from '../services/api';
const AuthContext = createContext(null);
export function AuthProvider({children}) {
  const [user,setUser]=useState(null); const [ready,setReady]=useState(false);
  useEffect(()=>{ const token=localStorage.getItem('netsage_token'); if(!token){setReady(true);return;} authMe().then(setUser).catch(()=>localStorage.removeItem('netsage_token')).finally(()=>setReady(true)); },[]);
  const logout=()=>{localStorage.removeItem('netsage_token');setUser(null);};
  return <AuthContext.Provider value={{user,setUser,logout,ready}}>{children}</AuthContext.Provider>;
}
export const useAuth=()=>useContext(AuthContext);
