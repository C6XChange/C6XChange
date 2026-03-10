import React, { useState, useEffect } from 'react';
import './AvailableCredit.css';
import { Badge, Button, Card, InlineStack, List, Modal, Select, TextField, TextStyle, VerticalStack } from 'jiffy-ui';
import { creditLimitData } from '../../../Data/AvailableCreditData';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import { useToast } from '../../../../context/ToastContext';

interface AvailableCreditProps {
  creditAmount?: number;
  creditLimit?: number;
  currency?: string;
  lastUpdated?: string;
}

interface SellCreditForm {
  tokenType: string;
  numberOfCredits: string;
  pricePerCredit: string;
  totalValue: string;
  creditItemIndex?: number;
}

interface SoldCredit extends SellCreditForm {
  id: string;
  timestamp: string;
  creditLabel: string;
}

interface CreditItem {
  label: string;
  creditAvailable: number;
  companyName: string;
  location: string;
  tags: string[];
  creditLimit: number;
  utilization: number;
  status: string;
  lastUpdated: string;
  user?: string;
}

const AvailableCredit: React.FC<AvailableCreditProps> = () => {
  const navigate = useNavigate();
  const { username } = useAuth();
  const toast = useToast();

  const handleViewMore = () => {
    navigate('/C6XChange/dashboard/credit-limit');
  };

  const [open, setOpen] = useState(false);
  const [buyOpen, setBuyOpen] = useState(false);
  const [creditData, setCreditData] = useState<CreditItem[]>([]);
  const [sellForm, setSellForm] = useState<SellCreditForm>({
    tokenType: '',
    numberOfCredits: '',
    pricePerCredit: '',
    totalValue: '0',
    creditItemIndex: undefined
  });
  const [buyForm, setBuyForm] = useState<SellCreditForm>({
    tokenType: '',
    numberOfCredits: '',
    pricePerCredit: '',
    totalValue: '0',
    creditItemIndex: undefined
  });

  useEffect(() => {
    const storedCredits = localStorage.getItem('creditLimitData');
    if (storedCredits) {
      const parsed = JSON.parse(storedCredits);
      // Check if stored data has user field, if not, reset with fresh data
      if (parsed.length > 0 && !parsed[0].hasOwnProperty('user')) {
        console.log('Stored data missing user field, resetting with fresh data');
        setCreditData(creditLimitData);
        localStorage.setItem('creditLimitData', JSON.stringify(creditLimitData));
      } else {
        console.log('Loading credit data from localStorage:', parsed);
        setCreditData(parsed);
      }
    } else {
      console.log('No stored data, using fresh creditLimitData:', creditLimitData);
      setCreditData(creditLimitData);
      localStorage.setItem('creditLimitData', JSON.stringify(creditLimitData));
    }
  }, []);

  // Debug log to see current state
  useEffect(() => {
    console.log('Current logged in user:', username);
    console.log('Current credit data:', creditData);
  }, [username, creditData]);

  // Calculate and alert total available credits for logged-in user
  useEffect(() => {
    if (username && creditData.length > 0) {
      const userCredits = creditData.filter(item => item.user === username);
      const totalAvailableCredits = userCredits.reduce((sum, item) => sum + item.creditAvailable, 0);
      
      if (userCredits.length > 0) {
        const creditDetails = userCredits.map(item => 
          `${item.label}: ${item.creditAvailable.toLocaleString()} tCO2e`
        ).join('\n');
        
        // alert(
        //   `Welcome ${username}!\n\n` +
        //   `Your Total Available Credits: ${totalAvailableCredits.toLocaleString()} tCO2e\n\n` +
        //   `Credit Breakdown:\n${creditDetails}`
        // );
      } else {
        // alert(`Welcome ${username}!\n\nYou currently have no credits available.`);
      }
    }
  }, [username, creditData]);

  useEffect(() => {
    const credits = parseFloat(sellForm.numberOfCredits) || 0;
    const price = parseFloat(sellForm.pricePerCredit) || 0;
    const total = (credits * price).toFixed(2);
    setSellForm(prev => ({ ...prev, totalValue: total }));
  }, [sellForm.numberOfCredits, sellForm.pricePerCredit]);

  useEffect(() => {
    const credits = parseFloat(buyForm.numberOfCredits) || 0;
    const price = parseFloat(buyForm.pricePerCredit) || 0;
    const total = (credits * price).toFixed(2);
    setBuyForm(prev => ({ ...prev, totalValue: total }));
  }, [buyForm.numberOfCredits, buyForm.pricePerCredit]);

  const getSoldCredits = (): SoldCredit[] => {
    const stored = localStorage.getItem('soldCredits');
    return stored ? JSON.parse(stored) : [];
  };

  const saveSoldCredit = (credit: SoldCredit) => {
    const soldCredits = getSoldCredits();
    soldCredits.push(credit);
    localStorage.setItem('soldCredits', JSON.stringify(soldCredits));
  };

  const handleSellCredit = () => {
    console.log('sellForm');
    if (!sellForm.tokenType || !sellForm.numberOfCredits || !sellForm.pricePerCredit) {
      toast.warning('Please fill in all fields', 'Missing Information');
      return;
    }

    if (sellForm.creditItemIndex === undefined) {
      toast.error('Error: Credit item not selected', 'Selection Error');
      return;
    }

    const numberOfCreditsToSell = parseFloat(sellForm.numberOfCredits);
    const currentCreditItem = creditData[sellForm.creditItemIndex];

    if (numberOfCreditsToSell > currentCreditItem.creditAvailable) {
    //   alert(`Insufficient credits. Only ${currentCreditItem.creditAvailable} credits available.`);
      return;
    }

    const updatedCreditData = [...creditData];
    updatedCreditData[sellForm.creditItemIndex] = {
      ...currentCreditItem,
      creditAvailable: currentCreditItem.creditAvailable - numberOfCreditsToSell
    };

    setCreditData(updatedCreditData);
    localStorage.setItem('creditLimitData', JSON.stringify(updatedCreditData));

    // Dispatch custom event to notify other components of credit update
    window.dispatchEvent(new Event('creditsUpdated'));

    const soldCredit: SoldCredit = {
      ...sellForm,
      creditLabel: currentCreditItem.label,
      id: `credit_${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    saveSoldCredit(soldCredit);
    
    toast.success(
      `${numberOfCreditsToSell} credits sold successfully from ${currentCreditItem.label}`,
      'Credit Sold'
    );
    
    setSellForm({
      tokenType: '',
      numberOfCredits: '',
      pricePerCredit: '',
      totalValue: '0',
      creditItemIndex: undefined
    });
    
    setOpen(false);
  };

  const handleCancel = () => {
    setSellForm({
      tokenType: '',
      numberOfCredits: '',
      pricePerCredit: '',
      totalValue: '0',
      creditItemIndex: undefined
    });
    setOpen(false);
  };

  const handleOpenSellModal = (index: number) => {
    setSellForm(prev => ({
      ...prev,
      creditItemIndex: index
    }));
    setOpen(true);
  };

  const handleOpenBuyModal = (index: number) => {
    setBuyForm(prev => ({
      ...prev,
      creditItemIndex: index
    }));
    setBuyOpen(true);
  };

  const handleBuyCredit = () => {
    if (!buyForm.tokenType || !buyForm.numberOfCredits || !buyForm.pricePerCredit) {
      toast.warning('Please fill in all fields', 'Missing Information');
      return;
    }

    if (buyForm.creditItemIndex === undefined) {
      toast.error('Error: Credit item not selected', 'Selection Error');
      return;
    }

    const numberOfCreditsToBuy = parseFloat(buyForm.numberOfCredits);
    const currentCreditItem = creditData[buyForm.creditItemIndex];

    if (numberOfCreditsToBuy > currentCreditItem.creditAvailable) {
      toast.warning(
        `Only ${currentCreditItem.creditAvailable} credits available.`,
        'Insufficient Credits'
      );
      return;
    }

    const buyRequest = {
      ...buyForm,
      creditLabel: currentCreditItem.label,
      id: `buy_${Date.now()}`,
      timestamp: new Date().toISOString(),
      username: username,
      seller: currentCreditItem.user,
      status: 'pending'
    };

    // Save to buyRequests in localStorage
    const existingBuyRequests = localStorage.getItem('buyRequests');
    const buyRequests = existingBuyRequests ? JSON.parse(existingBuyRequests) : [];
    buyRequests.push(buyRequest);
    localStorage.setItem('buyRequests', JSON.stringify(buyRequests));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('creditsUpdated'));
    
    toast.success(
      `${numberOfCreditsToBuy} credits requested successfully from ${currentCreditItem.label}`,
      'Buy Request Submitted'
    );
    
    setBuyForm({
      tokenType: '',
      numberOfCredits: '',
      pricePerCredit: '',
      totalValue: '0',
      creditItemIndex: undefined
    });
    
    setBuyOpen(false);
  };

  const handleBuyCancel = () => {
    setBuyForm({
      tokenType: '',
      numberOfCredits: '',
      pricePerCredit: '',
      totalValue: '0',
      creditItemIndex: undefined
    });
    setBuyOpen(false);
  };

  const showMyCredits = () => {
    if (username && creditData.length > 0) {
      const userCredits = creditData.filter(item => item.user === username);
      const totalAvailableCredits = userCredits.reduce((sum, item) => sum + item.creditAvailable, 0);
      
      if (userCredits.length > 0) {
        const creditDetails = userCredits.map(item => 
          `• ${item.label}: ${item.creditAvailable.toLocaleString()} tCO2e`
        ).join('\n');
        
        // alert(
        //   `📊 Your Credit Summary\n\n` +
        //   `Total Available Credits: ${totalAvailableCredits.toLocaleString()} tCO2e\n\n` +
        //   `Credit Breakdown:\n${creditDetails}`
        // );
      } else {
        // alert(`You currently have no credits available.`);
      }
    }
  };

  return (
    <>
    {username && creditData.length > 0 && (
      <Card>
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f0f7ff', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <InlineStack gap={4} align='center' justifyContent='start'>
            <div style={{ 
              fontSize: '48px',
              filter: 'grayscale(0%)'
            }}>💰</div>
            <VerticalStack gap={1}>
              <TextStyle variant='heading' size='md' tone='subdued' as='h3' fontWeight='bold'>
                Your Total Available Credits
              </TextStyle>
              <TextStyle variant='heading' size='2xl' as='h2' fontWeight='bold' tone='success'>
                {creditData
                  .filter(item => item.user === username)
                  .reduce((sum, item) => sum + item.creditAvailable, 0)
                  .toLocaleString()} tCO2e
              </TextStyle>
              <TextStyle variant='body' size='sm' tone='subdued' as='p'>
                {creditData.filter(item => item.user === username).length} credit source(s)
              </TextStyle>
            </VerticalStack>
          </InlineStack>
        </div>
      </Card>
    )}
    <Card header={{
        title: 'Available Credit',
        actions: [
            {
                label: 'My Credits',
                icon: 'wallet',
                onClick: showMyCredits
            },
            {
                label: 'View',
                icon: 'eye',
                onClick: handleViewMore
            }
        ]
    }}>
        <div className='credit-limit-data'>
            {creditData.slice(0, 2).map((item, index) => (
                <div className='credit-limit-item' key={index}>
                    <div className='credit-limit-item-inner'>
                        <div className='credit-limit-item-content'>
                            <VerticalStack gap={3}>
                                <div className='credit-limit-item-label'>
                                    <TextStyle variant='heading' size='lg' tone='subdued' as='h4' fontWeight='bold'>
                                        {item.label}
                                    </TextStyle>
                                </div>
                                <List type='ul'>
                                    <List.Item type='li'>
                                        <InlineStack>
                                            <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M13.0156 13.8125C13.0156 14.0238 12.9317 14.2265 12.7822 14.376C12.6328 14.5254 12.4301 14.6094 12.2188 14.6094H3.71875C3.50741 14.6094 3.30472 14.5254 3.15527 14.376C3.00583 14.2265 2.92188 14.0238 2.92188 13.8125C2.92188 13.6011 3.00583 13.3984 3.15527 13.249C3.30472 13.0996 3.50741 13.0156 3.71875 13.0156H3.98438C4.40706 13.0156 4.81244 12.8477 5.11133 12.5488C5.41021 12.2499 5.57812 11.8445 5.57812 11.4219V9.29685H3.71875C3.50741 9.29685 3.30472 9.21289 3.15527 9.06345C3.00583 8.91401 2.92188 8.71132 2.92188 8.49998C2.92188 8.28863 3.00583 8.08594 3.15527 7.9365C3.30472 7.78706 3.50741 7.7031 3.71875 7.7031H5.57812V5.5781C5.57804 4.87287 5.77849 4.18215 6.15609 3.58652C6.53369 2.99089 7.07287 2.51492 7.71074 2.21412C8.3486 1.91332 9.05885 1.8001 9.75863 1.88767C10.4584 1.97524 11.1189 2.25998 11.6629 2.70869C11.8259 2.84324 11.9288 3.03704 11.9489 3.24744C11.969 3.45785 11.9047 3.66762 11.7702 3.83062C11.6356 3.99362 11.4418 4.09649 11.2314 4.1166C11.021 4.13672 10.8112 4.07242 10.6482 3.93787C10.2686 3.62272 9.79026 3.45112 9.29688 3.4531C8.73329 3.4531 8.19279 3.67698 7.79427 4.0755C7.39576 4.47401 7.17188 5.01452 7.17188 5.5781V7.7031H9.03125C9.24259 7.7031 9.44528 7.78706 9.59473 7.9365C9.74417 8.08594 9.82812 8.28863 9.82812 8.49998C9.82812 8.71132 9.74417 8.91401 9.59473 9.06345C9.44528 9.21289 9.24259 9.29685 9.03125 9.29685H7.17188V11.4219C7.17251 11.9815 7.02496 12.5314 6.74422 13.0156H12.2188C12.4301 13.0156 12.6328 13.0996 12.7822 13.249C12.9317 13.3984 13.0156 13.6011 13.0156 13.8125Z" fill="white"/>
                                            </svg>
                                            <TextStyle variant='body' size='md' tone='subdued' as='p'>
                                                {item.creditAvailable} credits available
                                            </TextStyle>
                                        </InlineStack>
                                    </List.Item>
                                    <List.Item type='li'>
                                        <InlineStack>
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M4.16699 2.3335C4.03438 2.3335 3.90721 2.38617 3.81344 2.47994C3.71967 2.57371 3.66699 2.70089 3.66699 2.8335V13.6668H5.00033V11.8335C5.00033 11.3735 5.37366 11.0002 5.83366 11.0002H10.167C10.627 11.0002 11.0003 11.3735 11.0003 11.8335V13.6668H12.3337V7.8335C12.3337 7.70089 12.281 7.57371 12.1872 7.47994C12.0934 7.38617 11.9663 7.3335 11.8337 7.3335H10.5003C10.3677 7.3335 10.2405 7.28082 10.1468 7.18705C10.053 7.09328 10.0003 6.9661 10.0003 6.8335V2.8335C10.0003 2.70089 9.94765 2.57371 9.85388 2.47994C9.76011 2.38617 9.63293 2.3335 9.50032 2.3335H4.16699ZM6.00032 12.0002V13.6668H7.50032V12.0002H6.00032ZM8.50032 12.0002V13.6668H10.0003V12.0002H8.50032ZM12.8337 14.6668H3.16699C3.03438 14.6668 2.90721 14.6142 2.81344 14.5204C2.71967 14.4266 2.66699 14.2994 2.66699 14.1668V2.8335C2.66699 2.43567 2.82503 2.05414 3.10633 1.77284C3.38764 1.49153 3.76917 1.3335 4.16699 1.3335H9.50032C9.89815 1.3335 10.2797 1.49153 10.561 1.77284C10.8423 2.05414 11.0003 2.43567 11.0003 2.8335V6.3335H11.8337C12.0306 6.3335 12.2257 6.37229 12.4077 6.44768C12.5897 6.52306 12.755 6.63355 12.8943 6.77284C13.0336 6.91212 13.1441 7.07748 13.2195 7.25947C13.2949 7.44146 13.3337 7.63651 13.3337 7.8335V14.1668C13.3337 14.2994 13.281 14.4266 13.1872 14.5204C13.0934 14.6142 12.9663 14.6668 12.8337 14.6668ZM5.00033 4.3335C5.00033 4.15668 5.07056 3.98712 5.19559 3.86209C5.32061 3.73707 5.49018 3.66683 5.66699 3.66683C5.8438 3.66683 6.01337 3.73707 6.1384 3.86209C6.26342 3.98712 6.33366 4.15668 6.33366 4.3335C6.33366 4.51031 6.26342 4.67988 6.1384 4.8049C6.01337 4.92992 5.8438 5.00016 5.66699 5.00016C5.49018 5.00016 5.32061 4.92992 5.19559 4.8049C5.07056 4.67988 5.00033 4.51031 5.00033 4.3335ZM5.66699 8.3335C5.49018 8.3335 5.32061 8.40373 5.19559 8.52876C5.07056 8.65378 5.00033 8.82335 5.00033 9.00016C5.00033 9.17697 5.07056 9.34654 5.19559 9.47157C5.32061 9.59659 5.49018 9.66683 5.66699 9.66683C5.8438 9.66683 6.01337 9.59659 6.1384 9.47157C6.26342 9.34654 6.33366 9.17697 6.33366 9.00016C6.33366 8.82335 6.26342 8.65378 6.1384 8.52876C6.01337 8.40373 5.8438 8.3335 5.66699 8.3335ZM5.66699 6.00016C5.49018 6.00016 5.32061 6.0704 5.19559 6.19542C5.07056 6.32045 5.00033 6.49002 5.00033 6.66683C5.00033 6.84364 5.07056 7.01321 5.19559 7.13823C5.32061 7.26326 5.49018 7.3335 5.66699 7.3335C5.8438 7.3335 6.01337 7.26326 6.1384 7.13823C6.26342 7.01321 6.33366 6.84364 6.33366 6.66683C6.33366 6.49002 6.26342 6.32045 6.1384 6.19542C6.01337 6.0704 5.8438 6.00016 5.66699 6.00016ZM8.00032 3.66683C7.82351 3.66683 7.65394 3.73707 7.52892 3.86209C7.4039 3.98712 7.33366 4.15668 7.33366 4.3335C7.33366 4.51031 7.4039 4.67988 7.52892 4.8049C7.65394 4.92992 7.82351 5.00016 8.00032 5.00016C8.17714 5.00016 8.3467 4.92992 8.47173 4.8049C8.59675 4.67988 8.66699 4.51031 8.66699 4.3335C8.66699 4.15668 8.59675 3.98712 8.47173 3.86209C8.3467 3.73707 8.17714 3.66683 8.00032 3.66683ZM8.00032 8.3335C7.82351 8.3335 7.65394 8.40373 7.52892 8.52876C7.4039 8.65378 7.33366 8.82335 7.33366 9.00016C7.33366 9.17697 7.4039 9.34654 7.52892 9.47157C7.65394 9.59659 7.82351 9.66683 8.00032 9.66683C8.17714 9.66683 8.3467 9.59659 8.47173 9.47157C8.59675 9.34654 8.66699 9.17697 8.66699 9.00016C8.66699 8.82335 8.59675 8.65378 8.47173 8.52876C8.3467 8.40373 8.17714 8.3335 8.00032 8.3335ZM10.3337 8.3335C10.1568 8.3335 9.98728 8.40373 9.86225 8.52876C9.73723 8.65378 9.66699 8.82335 9.66699 9.00016C9.66699 9.17697 9.73723 9.34654 9.86225 9.47157C9.98728 9.59659 10.1568 9.66683 10.3337 9.66683C10.5105 9.66683 10.68 9.59659 10.8051 9.47157C10.9301 9.34654 11.0003 9.17697 11.0003 9.00016C11.0003 8.82335 10.9301 8.65378 10.8051 8.52876C10.68 8.40373 10.5105 8.3335 10.3337 8.3335ZM8.00032 6.00016C7.82351 6.00016 7.65394 6.0704 7.52892 6.19542C7.4039 6.32045 7.33366 6.49002 7.33366 6.66683C7.33366 6.84364 7.4039 7.01321 7.52892 7.13823C7.65394 7.26326 7.82351 7.3335 8.00032 7.3335C8.17714 7.3335 8.3467 7.26326 8.47173 7.13823C8.59675 7.01321 8.66699 6.84364 8.66699 6.66683C8.66699 6.49002 8.59675 6.32045 8.47173 6.19542C8.3467 6.0704 8.17714 6.00016 8.00032 6.00016Z" fill="white"/>
                                            </svg>

                                            <TextStyle variant='body' size='md' tone='subdued' as='p'>
                                                {item.companyName}
                                            </TextStyle>
                                        </InlineStack>
                                    </List.Item>
                                    <List.Item type='li'>
                                        <InlineStack>
                                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M9.18525 15.7268C10.0478 14.944 10.8462 14.0933 11.5725 13.1828C13.1025 11.2605 14.0332 9.36525 14.0962 7.68C14.1212 6.9951 14.0078 6.31219 13.7629 5.67209C13.518 5.03198 13.1466 4.4478 12.6709 3.95444C12.1951 3.46109 11.6249 3.06868 10.9941 2.80065C10.3633 2.53263 9.68498 2.39449 8.99962 2.39449C8.31427 2.39449 7.63594 2.53263 7.00516 2.80065C6.37439 3.06868 5.8041 3.46109 5.32838 3.95444C4.85265 4.4478 4.48125 5.03198 4.23634 5.67209C3.99144 6.31219 3.87807 6.9951 3.903 7.68C3.96675 9.36525 4.89825 11.2605 6.4275 13.1828C7.15385 14.0933 7.95216 14.944 8.81475 15.7268C8.89775 15.8018 8.9595 15.8563 9 15.8903L9.18525 15.7268ZM8.4465 16.6005C8.4465 16.6005 3 12.0135 3 7.5C3 5.9087 3.63214 4.38258 4.75736 3.25736C5.88258 2.13214 7.4087 1.5 9 1.5C10.5913 1.5 12.1174 2.13214 13.2426 3.25736C14.3679 4.38258 15 5.9087 15 7.5C15 12.0135 9.5535 16.6005 9.5535 16.6005C9.2505 16.8795 8.75175 16.8765 8.4465 16.6005ZM9 9.6C9.55695 9.6 10.0911 9.37875 10.4849 8.98493C10.8787 8.5911 11.1 8.05696 11.1 7.5C11.1 6.94305 10.8787 6.4089 10.4849 6.01508C10.0911 5.62125 9.55695 5.4 9 5.4C8.44304 5.4 7.9089 5.62125 7.51507 6.01508C7.12125 6.4089 6.9 6.94305 6.9 7.5C6.9 8.05696 7.12125 8.5911 7.51507 8.98493C7.9089 9.37875 8.44304 9.6 9 9.6ZM9 10.5C8.20435 10.5 7.44129 10.1839 6.87868 9.62132C6.31607 9.05871 6 8.29565 6 7.5C6 6.70435 6.31607 5.94129 6.87868 5.37868C7.44129 4.81607 8.20435 4.5 9 4.5C9.79565 4.5 10.5587 4.81607 11.1213 5.37868C11.6839 5.94129 12 6.70435 12 7.5C12 8.29565 11.6839 9.05871 11.1213 9.62132C10.5587 10.1839 9.79565 10.5 9 10.5Z" fill="white"/>
                                            </svg>

                                            <TextStyle variant='body' size='md' tone='subdued' as='p'>
                                                {item.location}
                                            </TextStyle>
                                        </InlineStack>
                                    </List.Item>
                                </List>
                                <div className='credit-limit-item-tags'>
                                    <InlineStack gap={3}>
                                    {item.tags.map((tag, tagIndex) => (
                                        <Badge key={tagIndex} color='Primary'>{tag}</Badge>
                                    ))}
                                    </InlineStack>
                                </div>
                            </VerticalStack>
                        </div>

                        <div className='credit-limit-item-value'>
                            <TextStyle as='h2' variant='heading' size='2xl' fontWeight='bold' tone='subdued'>
                                {item.creditLimit}/tCO2e
                            </TextStyle>
                        </div>
                    </div>
                    <InlineStack align={"stretch"} justifyContent={'start'} gap={3}>
                        {item.user === username ? (
                            <Button type='button' size='Large' color="Primary" onClick={() => handleOpenSellModal(index)}>
                                Sell now
                            </Button>
                        ) : (
                            <Button type='button' size='Large' color='Positive' onClick={() => handleOpenBuyModal(index)}>
                                Buy Now
                            </Button>
                        )}
                    </InlineStack>
                </div>
            ))}
        </div>

        <Modal isOpen={open} onDismiss={handleCancel}
            title="Sell Credit" size='medium'
            primaryAction={{
                children: 'Sell Now',
                onClick: handleSellCredit
            }}
            secondaryAction={{
                children: 'Cancel',
                onClick: handleCancel
            }}
            >
           
                <div>
                    <VerticalStack gap={4}>
                   <Select 
                   label="Token Type"
                   placeholder="Select token type"
                   value={sellForm.tokenType}
                   onChange={(value) => setSellForm(prev => ({ ...prev, tokenType: Array.isArray(value) ? value[0] : value }))}
                   options={[
                        {label: '100 tCO2e', value: '100'}, 
                        {label: '200 tCO2e', value: '200'}, 
                        {label: '300 tCO2e', value: '300'}
                    ]} />
                    <TextField
                    label="Number of Credits"
                    placeholder="Enter Number of Credits"
                    type="number"
                    value={sellForm.numberOfCredits}
                    onChange={(value: any) => setSellForm(prev => ({ ...prev, numberOfCredits: value }))}
                    />
                    <TextField
                    label="Price per Credit (£)"
                    placeholder="Enter Price per Credit (£)"
                    type="number"
                    value={sellForm.pricePerCredit}
                    onChange={(value: any) => setSellForm(prev => ({ ...prev, pricePerCredit: value }))}
                    />
                    <TextField
                        disabled={true}
                        label="Total Value (£)"
                        placeholder="Total Value"
                        value={sellForm.totalValue}
                        onChange={(value: any) => {}}
                    />
                    </VerticalStack>
                    
                </div>
            
        </Modal>

        <Modal isOpen={buyOpen} onDismiss={handleBuyCancel}
            title="Buy Credit" size='medium'
            primaryAction={{
                children: 'Submit Buy Request',
                onClick: handleBuyCredit
            }}
            secondaryAction={{
                children: 'Cancel',
                onClick: handleBuyCancel
            }}
            >
           
                <div>
                    <VerticalStack gap={4}>
                   <Select 
                   label="Token Type"
                   placeholder="Select token type"
                   value={buyForm.tokenType}
                   onChange={(value) => setBuyForm(prev => ({ ...prev, tokenType: Array.isArray(value) ? value[0] : value }))}
                   options={[
                        {label: '100 tCO2e', value: '100'}, 
                        {label: '200 tCO2e', value: '200'}, 
                        {label: '300 tCO2e', value: '300'}
                    ]} />
                    <TextField
                    label="Number of Credits"
                    placeholder="Enter Number of Credits"
                    type="number"
                    value={buyForm.numberOfCredits}
                    onChange={(value: any) => setBuyForm(prev => ({ ...prev, numberOfCredits: value }))}
                    />
                    <TextField
                    label="Offer Price per Credit (£)"
                    placeholder="Enter Offer Price per Credit (£)"
                    type="number"
                    value={buyForm.pricePerCredit}
                    onChange={(value: any) => setBuyForm(prev => ({ ...prev, pricePerCredit: value }))}
                    />
                    <TextField
                        disabled={true}
                        label="Total Value (£)"
                        placeholder="Total Value"
                        value={buyForm.totalValue}
                        onChange={(value: any) => {}}
                    />
                    </VerticalStack>
                    
                </div>
            
        </Modal>
    </Card>
    </>
  );
};

export default AvailableCredit;