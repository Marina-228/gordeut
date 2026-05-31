import React, { createContext, useState } from 'react';

export const CottageContext = createContext();

export const CottageProvider = ({ children }) => {
  const [cottages, setCottages] = useState([]);

  return (
    <CottageContext.Provider value={{ cottages, setCottages }}>
      {children}
    </CottageContext.Provider>
  );
};