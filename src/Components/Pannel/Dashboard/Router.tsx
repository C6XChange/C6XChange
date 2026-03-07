import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import CreditLimit from '../CreditLimit/CreditLimit';
import Configuration from '../Config/Configuration';
import Transactions from './Transactions';

const Router = () => {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/credit-limit" element={<CreditLimit />} />
            <Route path="/configuration" element={<Configuration />} />
            <Route path="/transactions" element={<Transactions />} />
        </Routes>
    );
};

export default Router;