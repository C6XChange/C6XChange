import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { DummySummaryCards } from './components/SummaryCard';
import { Card, FlexLayout, FlexLayoutItem, PageTitle, VerticalStack } from 'jiffy-ui';
import ChartSummary from './components/ChartSummary';
import GreenScore from './components/GreenScore';
import AvailableCredit from './components/AvailableCredit';
import RecentPurchaseCard from './components/RecentPurchaseCard';
import ComplianceMetrics from './components/ComplianceMetrics';
import TokenHolding from './components/TokenHolding';
import EnvironmentalImpact from './components/EnvironmentalImpact';

const Dashboard = () => {
    const { username } = useAuth();
    const [loginTime, setLoginTime] = useState<string>('');

    useEffect(() => {
        // Get login time from session storage
        const storedLoginTime = localStorage.getItem('loginTime');
        if (storedLoginTime) {
            const date = new Date(storedLoginTime);
            setLoginTime(date.toLocaleString());
        }
    }, []);

    return (
        
        <div className='box-container'>
            <PageTitle title="Dashboard" subtitle="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's" />
            <DummySummaryCards />
            <FlexLayout align={{sm: 'start', md: 'start', lg: 'start', xl: 'start'}}>
                <FlexLayoutItem cols={{ sm: '12', md: '12', lg: '8', xl: '8'}}>
                    <VerticalStack gap={5}>
                        
                            <ChartSummary />
                        
                        <AvailableCredit />
                        
                            <RecentPurchaseCard />
                        
                    </VerticalStack>
                </FlexLayoutItem>
                <FlexLayoutItem cols={{ sm: '12', md: '12', lg: '4', xl: '4'}}>
                    <VerticalStack gap={5}>
                        <GreenScore />
                        <ComplianceMetrics />
                        <TokenHolding />
                        <EnvironmentalImpact />
                    </VerticalStack>
                </FlexLayoutItem>
            </FlexLayout>
        </div>
    );
};

export default Dashboard;