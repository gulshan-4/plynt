'use client'

import { useSelector } from "react-redux";

const { useEffect } = require("react");

export default function BodyWrapper({ children }) {
    const darkMode = useSelector((state) => state.theme.darkMode);
  
    useEffect(() => {
        document.documentElement.classList.toggle("dark", darkMode);
    }, [darkMode]);
  
    return children;
}