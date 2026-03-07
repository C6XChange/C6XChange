import React, { useEffect, useState } from 'react'
import { Badge, Card, Table } from 'jiffy-ui';
import { useAuth } from '../../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface TransactionItem {
  id: string;
  type: 'sell' | 'buy';
  creditLabel: string;
  numberOfCredits: string;
  pricePerCredit: string;
  totalValue: string;
  timestamp: string;
  username?: string;
  seller?: string;
}

const RecentPurchaseCard = () => {
    const [transactions, setTransactions] = useState<TransactionItem[]>([]);
    const { username } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadTransactions();
    }, []);

    // Reload when localStorage changes
    useEffect(() => {
        const handleCreditsUpdate = () => {
            loadTransactions();
        };
        window.addEventListener('creditsUpdated', handleCreditsUpdate);
        return () => window.removeEventListener('creditsUpdated', handleCreditsUpdate);
    }, []);

    const loadTransactions = () => {
        const soldCredits = localStorage.getItem('soldCredits');
        const buyRequests = localStorage.getItem('buyRequests');
        
        const allTransactions: TransactionItem[] = [];

        if (soldCredits) {
            const sold = JSON.parse(soldCredits);
            sold.forEach((item: any) => {
                allTransactions.push({
                    id: item.id,
                    type: 'sell',
                    creditLabel: item.creditLabel,
                    numberOfCredits: item.numberOfCredits,
                    pricePerCredit: item.pricePerCredit,
                    totalValue: item.totalValue,
                    timestamp: item.timestamp,
                    username: username || undefined
                });
            });
        }

        if (buyRequests) {
            const bought = JSON.parse(buyRequests);
            bought.forEach((item: any) => {
                allTransactions.push({
                    id: item.id,
                    type: 'buy',
                    creditLabel: item.creditLabel,
                    numberOfCredits: item.numberOfCredits,
                    pricePerCredit: item.pricePerCredit,
                    totalValue: item.totalValue,
                    timestamp: item.timestamp,
                    username: item.username,
                    seller: item.seller
                });
            });
        }

        // Sort by timestamp (newest first) and take last 5
        allTransactions.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setTransactions(allTransactions.slice(0, 5));
    };

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
        });
    };

    const handleViewAll = () => {
        navigate('/C6XChange/dashboard/transactions');
    };

    const tableRows = transactions.map((transaction) => (
        <Table.Row key={transaction.id} id={transaction.id}>
            <Table.Cell>{formatDate(transaction.timestamp)}</Table.Cell>
            <Table.Cell>{transaction.creditLabel}</Table.Cell>
            <Table.Cell>{transaction.numberOfCredits} tCO2e</Table.Cell>
            <Table.Cell>£{parseFloat(transaction.totalValue).toLocaleString()}</Table.Cell>
            <Table.Cell>
                <Badge emphasis='Intense' color={transaction.type === 'sell' ? 'Primary' : 'Positive'}>
                    {transaction.type === 'sell' ? 'SOLD' : 'BUY REQUEST'}
                </Badge>
            </Table.Cell>
            <Table.Cell>£{transaction.pricePerCredit}/tCO2e</Table.Cell>
        </Table.Row>
    ));

    return (
        <Card 
            header={{
                title: 'Recent Transactions',
                actions: [
                    {
                        label: 'View All',
                        icon: 'eye',
                        onClick: handleViewAll
                    }
                ]
            }}
        >
            {transactions.length === 0 ? (
                <div style={{ 
                    padding: '40px', 
                    textAlign: 'center', 
                    color: '#666',
                    fontSize: '14px' 
                }}>
                    No transactions yet. Start buying or selling credits!
                </div>
            ) : (
                <Table
                    headings={[
                        { title: "Date" },
                        { title: "Project", align: "left" },
                        { title: "Credits" },
                        { title: "Total Amount", priority: 3 },
                        { title: "Status", align: "left" },
                        { title: "Price/Unit", priority: 1 },
                    ]}
                >
                    {tableRows}
                </Table>
            )}
        </Card>
    );
};

export default RecentPurchaseCard;