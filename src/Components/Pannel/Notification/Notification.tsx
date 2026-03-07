import { Badge, InlineStack, SideSheet, TextStyle, VerticalStack } from 'jiffy-ui'
import React, { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext';

interface NotificationProps {
  isOpen: boolean;
  onDismiss: () => void;
}

interface NotificationItem {
  id: string;
  type: 'sell' | 'buy';
  creditLabel: string;
  numberOfCredits: string;
  pricePerCredit: string;
  totalValue: string;
  timestamp: string;
  username: string;
}

const Notification: React.FC<NotificationProps> = ({ isOpen, onDismiss }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const { username } = useAuth();

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = () => {
    const soldCredits = localStorage.getItem('soldCredits');
    const buyRequests = localStorage.getItem('buyRequests');
    
    const allNotifications: NotificationItem[] = [];

    if (soldCredits) {
      const sold = JSON.parse(soldCredits);
      sold.forEach((item: any) => {
        allNotifications.push({
          id: item.id,
          type: 'sell',
          creditLabel: item.creditLabel,
          numberOfCredits: item.numberOfCredits,
          pricePerCredit: item.pricePerCredit,
          totalValue: item.totalValue,
          timestamp: item.timestamp,
          username: username || 'user'
        });
      });
    }

    if (buyRequests) {
      const bought = JSON.parse(buyRequests);
      bought.forEach((item: any) => {
        allNotifications.push({
          id: item.id,
          type: 'buy',
          creditLabel: item.creditLabel,
          numberOfCredits: item.numberOfCredits,
          pricePerCredit: item.pricePerCredit,
          totalValue: item.totalValue,
          timestamp: item.timestamp,
          username: item.username
        });
      });
    }

    // Sort by timestamp (newest first)
    allNotifications.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    setNotifications(allNotifications);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  const clearAllNotifications = () => {
    localStorage.removeItem('soldCredits');
    localStorage.removeItem('buyRequests');
    setNotifications([]);
  };

  return (
    <SideSheet
      footer={
        <div style={{ padding: '12px' }}>
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Clear All Notifications
            </button>
          )}
        </div>
      }
      title="Notifications"
      isOpen={isOpen}
      onDismiss={onDismiss}
    >
      <div style={{ padding: '16px' }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <TextStyle variant='body' size='lg' tone='subdued' as='p'>
              No notifications yet
            </TextStyle>
          </div>
        ) : (
          <VerticalStack gap={3}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                style={{
                  padding: '16px',
                  backgroundColor: notification.type === 'sell' ? '#e3f2fd' : '#f3e5f5',
                  borderRadius: '8px',
                  border: `1px solid ${notification.type === 'sell' ? '#90caf9' : '#ce93d8'}`
                }}
              >
                <VerticalStack gap={2}>
                  <InlineStack gap={2} align='center'>
                    <Badge color={notification.type === 'sell' ? 'Primary' : 'Positive'}>
                      {notification.type === 'sell' ? 'SOLD' : 'BUY REQUEST'}
                    </Badge>
                    <TextStyle variant='body' size='sm' tone='subdued' as='span'>
                      {formatDate(notification.timestamp)}
                    </TextStyle>
                  </InlineStack>
                  
                  <TextStyle variant='heading' size='md' fontWeight='bold' as='h4'>
                    {notification.creditLabel}
                  </TextStyle>
                  
                  <div style={{ fontSize: '14px', color: '#555' }}>
                    <div style={{ marginBottom: '4px' }}>
                      <strong>Credits:</strong> {notification.numberOfCredits} tCO2e
                    </div>
                    <div style={{ marginBottom: '4px' }}>
                      <strong>Price per Credit:</strong> £{notification.pricePerCredit}
                    </div>
                    <div style={{ 
                      marginTop: '8px', 
                      padding: '8px',
                      backgroundColor: 'rgba(255,255,255,0.5)',
                      borderRadius: '4px'
                    }}>
                      <strong>Total Value:</strong> £{notification.totalValue}
                    </div>
                  </div>
                </VerticalStack>
              </div>
            ))}
          </VerticalStack>
        )}
      </div>
    </SideSheet>
  )
}

export default Notification