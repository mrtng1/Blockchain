import React from 'react';
import CreateWalletComponent from "../../components/CreateWalletComponent";
import WalletBalanceSearchComponent from "../../components/WalletBalanceSearchComponent";
import RecoverWalletComponent from "../../components/RecoverWalletComponent";
import WalletOverviewComponent from "../../components/WalletsOverviewComponent";

const WalletsPage = () => {
    const gridContainerStyle = {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        gap: '1rem',
    };

    const gridItemStyle = {
        width: 'calc(50% - 0.5rem)',
        boxSizing: 'border-box',
    };

    return (
        <div>
            <div style={gridContainerStyle}>
                <div style={gridItemStyle}>
                    <CreateWalletComponent />
                </div>
                <div style={gridItemStyle}>
                    <WalletBalanceSearchComponent />
                </div>
                <div style={gridItemStyle}>
                    <RecoverWalletComponent />
                </div>
                <div style={gridItemStyle}>
                    <WalletOverviewComponent />
                </div>
            </div>
        </div>
    );
};

export default WalletsPage;