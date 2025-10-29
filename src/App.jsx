import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom"; 
import { ApiUrlProvider } from './context/APIContext'; //  
import AppRouterGuard from "./context/AppRouterGuard";
   

const Login = lazy(() => import("./pages/auth/login")); 
const Error = lazy(() => import("./services/404"));

import Layout from "./layout/Layout";
import AuthLayout from "./layout/AuthLayout";

// custom pages

const ProcessQualityTrand = lazy(() => import("./pages/real-chart/ProcessQualityTrand"))

import Loading from "@/components/Loading"; 

function App() {
  return (
    <main className="App  relative">
      <ApiUrlProvider>
        <AppRouterGuard>
        <Routes>
          <Route path="/" element={<AuthLayout />}>
            <Route path="/" element={<ProcessQualityTrand />} /> 
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/processqualitytrand" element={<ProcessQualityTrand/>} />
          <Route path="/*" element={<Layout />}> 
            {/* Custom pages */}            
            <Route path="*" element={<Navigate to="/404" />} />
          </Route>
          <Route
            path="/404"
            element={
              <Suspense fallback={<Loading />}>
                <Error />
              </Suspense>
            }
          />  
        </Routes>
        </AppRouterGuard>
      </ApiUrlProvider>
    </main>
  );
}

export default App;
