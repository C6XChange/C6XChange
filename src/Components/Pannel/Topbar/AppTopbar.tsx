import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Button, Dropdown, InlineStack, TextStyle, Thumbnail, TopBar, VerticalStack } from 'jiffy-ui';
import user from '../../../assets/images/user.png';
import { Bell, ChevronDown, ChevronLeft, Copy, Eye, FileText, List } from 'jiffy-icons';
import { BankIcon, LogoutIcon, OrderIcon, ReportIcon, RightArrowIcon, SettingIcon, SupportIcon, WalletIcon } from '../../../assets/Icons';
import Notification from '../Notification/Notification';
// import ActionList from 'jiffy-ui/dist/components/Actionlist/Actionlist';


const AppTopbar = () => {
    const { logout, username, fullName, role } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [totalAvailableCredits, setTotalAvailableCredits] = useState(0);

    // Load and calculate user's total available credits
    useEffect(() => {
        if (username) {
            const storedCredits = localStorage.getItem('creditLimitData');
            if (storedCredits) {
                const creditData = JSON.parse(storedCredits);
                const userCredits = creditData.filter((item: any) => item.user === username);
                const total = userCredits.reduce((sum: number, item: any) => sum + item.creditAvailable, 0);
                setTotalAvailableCredits(total);
            }
        }
    }, [username]);

    // Update credits when localStorage changes (using custom event)
    useEffect(() => {
        const handleCreditsUpdate = () => {
            if (username) {
                const storedCredits = localStorage.getItem('creditLimitData');
                if (storedCredits) {
                    const creditData = JSON.parse(storedCredits);
                    const userCredits = creditData.filter((item: any) => item.user === username);
                    const total = userCredits.reduce((sum: number, item: any) => sum + item.creditAvailable, 0);
                    setTotalAvailableCredits(total);
                }
            }
        };

        // Listen for custom credit update event
        window.addEventListener('creditsUpdated', handleCreditsUpdate);
        return () => window.removeEventListener('creditsUpdated', handleCreditsUpdate);
    }, [username]);

    const handleLogout = () => {
        logout();
        navigate('/C6XChange');
    };



    const userMenu1 = [
      {
        id: "file-group",
        title: "File Actions",
        items: [
          {
            id: "new",
            label: "New File",
            leading: <FileText size={16} />,
            onClick: () => alert("New File clicked"),
          },
          {
            id: "open",
            label: "Open File",
            leading: <Eye size={16} />,
            onClick: () => alert("Open File clicked"),
          },
        ],
        separator: true,
      },
      {
        id: "edit-group",
        title: "Edit Actions",
        items: [
          {
            id: "copy-edit",
            label: "Copy",
            leading: <Copy size={16} />,
            onClick: () => alert("Copy clicked"),
          },
          {
            id: "delete-edit",
            label: "Delete",
            leading: LogoutIcon,
            variant: "destructive" as const,
            onClick: () => alert("Delete clicked"),
          },
        ],
      },
    ];


    const userMenu = (
        <div style={{ padding: "8px", minWidth: "270px" }}>
          <div style={{ padding: "12px", borderBottom: "1px solid #eee", marginBottom: "8px" }}>
            <strong>{fullName || username || 'User'}</strong>
            <div style={{ fontSize: "12px", color: "#666" }}>{role || 'User'}</div>
          </div>
          <div className='user-menu-items'>
            
            <button className='user-menu-item'>
              <WalletIcon />
              <span className='user-menu-item-text'>
                Available Credits
                <span className='user-menu-item-value'>
                  {totalAvailableCredits.toLocaleString()} tCO2e
                </span>
              </span>
              <RightArrowIcon />
            </button>
            <button className='user-menu-item'>
              <OrderIcon />
              <span className='user-menu-item-text'>
                Transactions
               
              </span>
              <RightArrowIcon />
            </button>
            <button className='user-menu-item'>
              <BankIcon />
              <span className='user-menu-item-text'>
                Bank Details
               
              </span>
              <RightArrowIcon />
            </button>
            <button className='user-menu-item'>
            <SupportIcon />
              <span className='user-menu-item-text'>
                Support
               
              </span>
              <RightArrowIcon />
            </button>
            <button className='user-menu-item'>
            <ReportIcon />
              <span className='user-menu-item-text'>
                Reports
               
              </span>
              <RightArrowIcon />
            </button>
            <button className='user-menu-item'>
            <SettingIcon />
              <span className='user-menu-item-text'>
                Settings
               
              </span>
              <RightArrowIcon />
            </button>
            <button className='user-menu-item' onClick={handleLogout}>
              <LogoutIcon />
              Sign Out
            </button>
            
            
          </div>
        </div>
      );
    
    const connectLeft = (
      <div className='connect-left-action'>
        <Button variant="Ghost" icon={<List />} iconOnly />
      </div>
     )
    const connectRight = (
      <>
        <Button variant="Secondary" icon={<Bell color='#fff' />} iconOnly onClick={() => setIsOpen(true)} />
        <Notification isOpen={isOpen} onDismiss={() => setIsOpen(false)} />
         
        <Dropdown content={userMenu} placement="bottom-end">
          <div className='user-menu-container'>
            <Button variant="Ghost" suffixIcon={<ChevronDown />}>
              <InlineStack gap={3} align={"center"} justifyContent={'center'}>
                <Thumbnail
                  size='Large'
                  src={user}
                  alt={"User login"}
                />
                <VerticalStack gap={0}>
                  <TextStyle variant='heading' size='sm' tone='subdued' as='p' fontWeight='bold'>{fullName || username || 'User'}</TextStyle>
                  <TextStyle variant='body' size='md' tone='subdued' as='p'>{role || 'User'}</TextStyle>
                </VerticalStack>
              </InlineStack>
            </Button>
            </div>
        </Dropdown>
        </>
    );
    return (
      <>
        <TopBar title='AppTopbar' connectRight={connectRight} connectLeft={connectLeft} />
      </>
 
    );
};

export default AppTopbar;
