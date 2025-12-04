import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthAPI, setAuthToken } from '../services/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [tipo, setTipo] = useState(null); // 'doador' | 'coletor' | null
  const [signed, setSigned] = useState(false);
  const [coletasConfirmadas, setColetasConfirmadas] = useState(0);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const clearSession = async () => {
    setTipo(null);
    setSigned(false);
    setColetasConfirmadas(0);
    setUser(null);
    setToken(null);
    setAuthToken(null);
    await AsyncStorage.multiRemove(['@recolhe360/token', '@recolhe360/user']);
  };

  useEffect(() => {
    (async () => {
      try {
        const [rawToken, rawUser] = await Promise.all([
          AsyncStorage.getItem('@recolhe360/token'),
          AsyncStorage.getItem('@recolhe360/user'),
        ]);
        if (!rawToken) return;

        setToken(rawToken);
        setAuthToken(rawToken);

        try {
          const me = await AuthAPI.me();
          setUser(me);
          const role = me.role === 'collector' ? 'coletor' : me.role === 'donor' ? 'doador' : null;
          setTipo(role);
          setSigned(true);
          await AsyncStorage.setItem('@recolhe360/user', JSON.stringify(me));
        } catch {
          await clearSession();
        }
      } catch {}
    })();
  }, []);

  const applySession = async (u, t) => {
    setUser(u);
    setToken(t);
    setAuthToken(t);
    await AsyncStorage.setItem('@recolhe360/token', t);
    await AsyncStorage.setItem('@recolhe360/user', JSON.stringify(u));
    setTipo(u?.role === 'collector' ? 'coletor' : u?.role === 'donor' ? 'doador' : null);
    setSigned(true);
  };

  const signIn = async ({ email, password, tipo: tipoEscolhido }) => {
    const data = await AuthAPI.login({ email, password });
    if (!data?.ok || !data?.user || !data?.token) {
      throw new Error(data?.message || 'Falha no login');
    }
    if (tipoEscolhido) {
      const want = tipoEscolhido === 'coletor' ? 'collector' : 'donor';
      if (data.user.role && data.user.role !== want) {
        throw new Error('Seu perfil nao corresponde ao tipo selecionado.');
      }
    }
    await applySession(data.user, data.token);
    return data.user;
  };

  const register = async ({ name, email, password, role, phone, address }) => {
    const data = await AuthAPI.register({ name, email, password, role, phone: phone || null, address: address || null });
    if (!data?.ok || !data?.user || !data?.token) {
      throw new Error(data?.message || 'Falha no cadastro');
    }
    await applySession(data.user, data.token);
    return data.user;
  };

  const logout = async () => {
    try { await AuthAPI.logout(); } catch {}
    await clearSession();
  };

  return (
    <UserContext.Provider value={{
      // state
      signed,
      tipo,
      user,
      token,
      coletasConfirmadas,
      // actions
      setTipo,
      setColetasConfirmadas,
      signIn,
      register,
      logout,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser deve ser usado dentro de um <UserProvider>');
  }
  return context;
};
