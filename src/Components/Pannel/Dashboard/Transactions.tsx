import React, { useEffect, useState } from 'react';
import { Badge, Button, Card, InlineStack, PageTitle, Table, TextStyle, VerticalStack } from 'jiffy-ui';
import { useAuth } from '../../../context/AuthContext';
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

const Transactions = () => {
    const [transactions, setTransactions] = useState<TransactionItem[]>([]);
    const { username } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadTransactions();
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

        allTransactions.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setTransactions(allTransactions);
    };

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleBack = () => {
        navigate('/C6XChange/dashboard');
    };

    const getTotalSold = () => {
        return transactions
            .filter(t => t.type === 'sell')
            .reduce((sum, t) => sum + parseFloat(t.totalValue), 0);
    };

    const getTotalBought = () => {
        return transactions
            .filter(t => t.type === 'buy')
            .reduce((sum, t) => sum + parseFloat(t.totalValue), 0);
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
        <div style={{ padding: '24px' }}>
            <PageTitle 
            showBackButton={true}
            onBackClick={handleBack}
            title='All Transactions' 
            subtitle='View and manage all your credit transactions in one place' 
            
            />
            <VerticalStack gap={4}>
               
               
                <InlineStack gap={4}>
                    <Card>
                        <div style={{ padding: '20px' }}>
                            <VerticalStack gap={2}>
                                <TextStyle variant='body' size='md' tone='subdued' as='p'>
                                    Total Sold
                                </TextStyle>
                                <TextStyle variant='heading' size='2xl' as='h2' fontWeight='bold' tone='success'>
                                    £{getTotalSold().toLocaleString()}
                                </TextStyle>
                                <TextStyle variant='body' size='sm' tone='subdued' as='p'>
                                    {transactions.filter(t => t.type === 'sell').length} transaction(s)
                                </TextStyle>
                            </VerticalStack>
                        </div>
                    </Card>

                    <Card>
                        <div style={{ padding: '20px' }}>
                            <VerticalStack gap={2}>
                                <TextStyle variant='body' size='md' tone='subdued' as='p'>
                                    Total Buy Requests
                                </TextStyle>
                                <TextStyle variant='heading' size='2xl' as='h2' fontWeight='bold' tone='emphasis'>
                                    £{getTotalBought().toLocaleString()}
                                </TextStyle>
                                <TextStyle variant='body' size='sm' tone='subdued' as='p'>
                                    {transactions.filter(t => t.type === 'buy').length} request(s)
                                </TextStyle>
                            </VerticalStack>
                        </div>
                    </Card>

                    <Card>
                        <div style={{ padding: '20px' }}>
                            <VerticalStack gap={2}>
                                <TextStyle variant='body' size='md' tone='subdued' as='p'>
                                    Total Transactions
                                </TextStyle>
                                <TextStyle variant='heading' size='2xl' as='h2' fontWeight='bold' tone='success'>
                                    {transactions.length}
                                </TextStyle>
                                <TextStyle variant='body' size='sm' tone='subdued' as='p'>
                                    All time
                                </TextStyle>
                            </VerticalStack>
                        </div>
                    </Card>
                </InlineStack>

                <Card>
                    {transactions.length === 0 ? (
                        <div style={{ 
                            padding: '60px', 
                            textAlign: 'center', 
                            color: '#666',
                            fontSize: '16px' 
                        }}>
                            <TextStyle variant='heading' size='lg' tone='subdued' as='h3'>
                                No transactions yet
                            </TextStyle>
                            <TextStyle variant='body' size='md' tone='subdued' as='p'>
                                Start buying or selling credits to see your transaction history here!
                            </TextStyle>
                        </div>
                    ) : (
                        <Table
                            headings={[
                                { title: "Date & Time" },
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
            </VerticalStack>
        </div>
    );
};

export default Transactions;
