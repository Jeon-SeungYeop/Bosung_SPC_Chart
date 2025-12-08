import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom"; 
import { ApiUrlProvider } from './context/APIContext'; //  
import AppRouterGuard from "./context/AppRouterGuard";
   

const Error = lazy(() => import("./services/404"));

import Layout from "./layout/Layout";
import AuthLayout from "./layout/AuthLayout";

// custom pages

const ProcessQualityTrand = lazy(() => import("./pages/real-chart/ProcessQualityTrand"))

import Loading from "@/components/Loading"; 

function App() {
  return (
    <main className="App  relative">
          <ProcessQualityTrand/>
    </main>
  );
}

export default App;
