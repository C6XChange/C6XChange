import React, { useEffect, useState } from 'react';
import { Badge, Button, Card, Table, TextStyle, VerticalStack, Modal } from 'jiffy-ui';
import { useNavigate } from 'react-router-dom';

interface BuyRequest {
  id: string;
  creditLabel: string;
  numberOfCredits: string;
  pricePerCredit: string;
  totalValue: string;
  timestamp: string;
  username: string;
  seller: string;
  status: 'pending' | 'approved' | 'rejected';
  tokenType: string;
}

const AdminDashboard = () => {
    const [buyRequests, setBuyRequests] = useState<BuyRequest[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<BuyRequest | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Check admin authentication
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            navigate('/C6XChange/admin/login');
            return;
        }
        loadBuyRequests();
    }, [navigate]);

    // Reload when new requests are created
    useEffect(() => {
        const handleCreditsUpdate = () => {
            loadBuyRequests();
        };
        window.addEventListener('creditsUpdated', handleCreditsUpdate);
        return () => window.removeEventListener('creditsUpdated', handleCreditsUpdate);
    }, []);

    const loadBuyRequests = () => {
        const stored = localStorage.getItem('buyRequests');
        if (stored) {
            const requests = JSON.parse(stored);
            // Add status if not present
            const requestsWithStatus = requests.map((req: any) => ({
                ...req,
                status: req.status || 'pending'
            }));
            setBuyRequests(requestsWithStatus);
        }
    };

    const handleApprove = (request: BuyRequest) => {
        setSelectedRequest(request);
        setActionType('approve');
        setModalOpen(true);
    };

    const handleReject = (request: BuyRequest) => {
        setSelectedRequest(request);
        setActionType('reject');
        setModalOpen(true);
    };

    const confirmAction = () => {
        if (!selectedRequest || !actionType) return;

        // Update buy request status
        const newStatus: 'approved' | 'rejected' = actionType === 'approve' ? 'approved' : 'rejected';
        const updatedRequests = buyRequests.map(req => 
            req.id === selectedRequest.id 
                ? { ...req, status: newStatus }
                : req
        );
        localStorage.setItem('buyRequests', JSON.stringify(updatedRequests));
        setBuyRequests(updatedRequests);

        // If approved, update credit availability
        if (actionType === 'approve') {
            updateCreditAvailability(selectedRequest);
        }

        // Dispatch event to notify other components
        window.dispatchEvent(new Event('creditsUpdated'));

        setModalOpen(false);
        setSelectedRequest(null);
        setActionType(null);

        alert(`Request ${actionType === 'approve' ? 'approved' : 'rejected'} successfully!`);
    };

    const updateCreditAvailability = (request: BuyRequest) => {
        const creditData = localStorage.getItem('creditLimitData');
        if (!creditData) return;

        const credits = JSON.parse(creditData);
        const creditsToTransfer = parseFloat(request.numberOfCredits);
        
        // Check if buyer already has this credit
        const buyerHasCredit = credits.some((credit: any) => 
            credit.user === request.username && credit.label === request.creditLabel
        );

        let updatedCredits;

        if (buyerHasCredit) {
            // Buyer already has this credit, update both seller and buyer
            updatedCredits = credits.map((credit: any) => {
                // Deduct from seller
                if (credit.user === request.seller && credit.label === request.creditLabel) {
                    return {
                        ...credit,
                        creditAvailable: credit.creditAvailable - creditsToTransfer,
                        creditLimit: credit.creditAvailable - creditsToTransfer
                    };
                }
                // Add to buyer
                if (credit.user === request.username && credit.label === request.creditLabel) {
                    return {
                        ...credit,
                        creditAvailable: credit.creditAvailable + creditsToTransfer,
                        creditLimit: credit.creditAvailable + creditsToTransfer
                    };
                }
                return credit;
            });
        } else {
            // Buyer doesn't have this credit, create new entry for buyer
            const sellerCredit = credits.find((credit: any) => 
                credit.user === request.seller && credit.label === request.creditLabel
            );

            if (sellerCredit) {
                // Deduct from seller
                updatedCredits = credits.map((credit: any) => {
                    if (credit.user === request.seller && credit.label === request.creditLabel) {
                        return {
                            ...credit,
                            creditAvailable: credit.creditAvailable - creditsToTransfer,
                            creditLimit: credit.creditAvailable - creditsToTransfer
                        };
                    }
                    return credit;
                });

                // Create new credit entry for buyer
                const newBuyerCredit = {
                    ...sellerCredit,
                    user: request.username,
                    creditAvailable: creditsToTransfer,
                    creditLimit: creditsToTransfer
                };

                updatedCredits.push(newBuyerCredit);
            } else {
                updatedCredits = credits;
            }
        }

        localStorage.setItem('creditLimitData', JSON.stringify(updatedCredits));
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUsername');
        localStorage.removeItem('adminLoginTime');
        navigate('/C6XChange/admin/login');
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

    const getPendingCount = () => buyRequests.filter(r => r.status === 'pending').length;
    const getApprovedCount = () => buyRequests.filter(r => r.status === 'approved').length;
    const getRejectedCount = () => buyRequests.filter(r => r.status === 'rejected').length;

    const tableRows = buyRequests.map((request) => (
        <Table.Row key={request.id} id={request.id}>
            <Table.Cell>{formatDate(request.timestamp)}</Table.Cell>
            <Table.Cell>{request.username}</Table.Cell>
            <Table.Cell>{request.creditLabel}</Table.Cell>
            <Table.Cell>{request.numberOfCredits} tCO2e</Table.Cell>
            <Table.Cell>£{parseFloat(request.totalValue).toLocaleString()}</Table.Cell>
            <Table.Cell>
                <Badge color={
                    request.status === 'approved' ? 'Positive' : 
                    request.status === 'rejected' ? 'Negative' : 
                    'Neutral'
                }>
                    {request.status.toUpperCase()}
                </Badge>
            </Table.Cell>
            <Table.Cell>
                {request.status === 'pending' ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Button size='Small' color='Positive' onClick={() => handleApprove(request)}>
                            Approve
                        </Button>
                        <Button size='Small' color='Negative' onClick={() => handleReject(request)}>
                            Reject
                        </Button>
                    </div>
                ) : (
                    <TextStyle variant='body' size='sm' tone='subdued' as='span'>
                        {request.status === 'approved' ? 'Processed' : 'Declined'}
                    </TextStyle>
                )}
            </Table.Cell>
        </Table.Row>
    ));

    return (
        <div style={{ padding: '24px', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <VerticalStack gap={4}>
                {/* Header */}
                <Card>
                    <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <TextStyle variant='heading' size='2xl' as='h1' fontWeight='bold'>
                                Admin Dashboard
                            </TextStyle>
                            <TextStyle variant='body' size='md' tone='subdued' as='p'>
                                Manage credit buying requests and approvals
                            </TextStyle>
                        </div>
                        <Button color='Negative' onClick={handleLogout}>
                            Logout
                        </Button>
                    </div>
                </Card>

                {/* Statistics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    <Card>
                        <div style={{ padding: '20px', textAlign: 'center' }}>
                            <TextStyle variant='heading' size='lg'  as='h2' fontWeight='bold' tone='success'>
                                {getPendingCount()}
                            </TextStyle>
                            <TextStyle variant='body' size='md' tone='subdued' as='p'>
                                Pending Requests
                            </TextStyle>
                        </div>
                    </Card>
                    <Card>
                        <div style={{ padding: '20px', textAlign: 'center' }}>
                            <TextStyle variant='heading' size='lg'  as='h2' fontWeight='bold' tone='success'>
                                {getApprovedCount()}
                            </TextStyle>
                            <TextStyle variant='body' size='md' tone='subdued' as='p'>
                                Approved
                            </TextStyle>
                        </div>
                    </Card>
                    <Card>
                        <div style={{ padding: '20px', textAlign: 'center' }}>
                            <TextStyle variant='heading' size='lg' as='h2' fontWeight='bold' tone='critical'>
                                {getRejectedCount()}
                            </TextStyle>
                            <TextStyle variant='body' size='md' tone='subdued' as='p'>
                                Rejected
                            </TextStyle>
                        </div>
                    </Card>
                </div>

                {/* Buy Requests Table */}
                <Card header={{title: 'Credit Buy Requests'}}>
                    
                    {buyRequests.length === 0 ? (
                        <div style={{ padding: '60px', textAlign: 'center' }}>
                            <TextStyle variant='heading' size='lg' tone='subdued' as='h3'>
                                No buy requests yet
                            </TextStyle>
                            <TextStyle variant='body' size='md' tone='subdued' as='p'>
                                Buy requests from users will appear here
                            </TextStyle>
                        </div>
                    ) : (
                        <Table
                            headings={[
                                { title: "Date & Time" },
                                { title: "Buyer" },
                                { title: "Project" },
                                { title: "Credits" },
                                { title: "Total Value" },
                                { title: "Status" },
                                { title: "Actions" },
                            ]}
                        >
                            {tableRows}
                        </Table>
                    )}
                </Card>
            </VerticalStack>

            {/* Confirmation Modal */}
            <Modal
                isOpen={modalOpen}
                onDismiss={() => setModalOpen(false)}
                title={actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
                primaryAction={{
                    children: actionType === 'approve' ? 'Approve' : 'Reject',
                    onClick: confirmAction
                }}
                secondaryAction={{
                    children: 'Cancel',
                    onClick: () => setModalOpen(false)
                }}
            >
                {selectedRequest && (
                    <VerticalStack gap={3}>
                        <TextStyle variant='body' size='md' as='p'>
                            {actionType === 'approve' 
                                ? 'Are you sure you want to approve this buy request?' 
                                : 'Are you sure you want to reject this buy request?'}
                        </TextStyle>
                        <div style={{ 
                            padding: '16px', 
                            backgroundColor: '#f5f5f5', 
                            borderRadius: '8px' 
                        }}>
                            <VerticalStack gap={2}>
                                <div><strong>Buyer:</strong> {selectedRequest.username}</div>
                                <div><strong>Project:</strong> {selectedRequest.creditLabel}</div>
                                <div><strong>Credits:</strong> {selectedRequest.numberOfCredits} tCO2e</div>
                                <div><strong>Price:</strong> £{selectedRequest.pricePerCredit}/tCO2e</div>
                                <div><strong>Total Value:</strong> £{parseFloat(selectedRequest.totalValue).toLocaleString()}</div>
                            </VerticalStack>
                        </div>
                        {actionType === 'approve' && (
                            <div style={{ 
                                padding: '12px', 
                                backgroundColor: '#e8f5e9', 
                                borderRadius: '8px',
                                border: '1px solid #4caf50'
                            }}>
                                <TextStyle variant='body' size='sm' as='p'>
                                    ✓ Credits will be transferred from seller to buyer
                                </TextStyle>
                            </div>
                        )}
                    </VerticalStack>
                )}
            </Modal>
        </div>
    );
};

export default AdminDashboard;
