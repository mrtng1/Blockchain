import React from 'react';
import CreateWalletComponent from "../../components/CreateWalletComponent";
import WalletBalanceSearchComponent from "../../components/WalletBalanceSearchComponent";
import RecoverWalletComponent from "../../components/RecoverWalletComponent";
import WalletOverviewComponent from "../../components/WalletsOverviewComponent";

const WalletsPage = () => {
    const pageContainerStyle = {
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-start',
    };

    const leftColumnStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: 'calc(50% - 0.5rem)',
        boxSizing: 'border-box',
    };

    const rightColumnStyle = {
        width: 'calc(50% - 0.5rem)',
        boxSizing: 'border-box',
    };

    const topComponentStyle = {
        width: '100%',
        boxSizing: 'border-box',
    };

    const pairedComponentsRowStyle = {
        display: 'flex',
        gap: '1rem',
        width: '100%',
        alignItems: 'flex-start',
    };

    const scaleFactor = 0.7;
    const createWalletOriginalWidth = 400;
    const createWalletScaledWidth = createWalletOriginalWidth * scaleFactor;

    const createWalletLayoutWrapperStyle = {
        width: `${createWalletScaledWidth}px`,
        boxSizing: 'border-box',
    };

    const createWalletTransformWrapperStyle = {
        width: `${createWalletOriginalWidth}px`,
        transform: `scale(${scaleFactor})`,
        transformOrigin: 'top left',
        boxSizing: 'border-box',
    };

    const balanceSearchWrapperStyle = {
        flex: 1,
        minWidth: '300px',
        boxSizing: 'border-box',
    };

    return (
        <div>
            <div style={pageContainerStyle}>
                <div style={leftColumnStyle}>
                    <div style={topComponentStyle}>
                        <RecoverWalletComponent />
                    </div>
                    <div style={pairedComponentsRowStyle}>
                        <div style={createWalletLayoutWrapperStyle}>
                            <div style={createWalletTransformWrapperStyle}>
                                <CreateWalletComponent />
                            </div>
                        </div>
                        <div style={balanceSearchWrapperStyle}>
                            <WalletBalanceSearchComponent />
                        </div>
                    </div>
                </div>
                <div style={rightColumnStyle}>
                    <WalletOverviewComponent />
                </div>
            </div>
        </div>
    );
};

export default WalletsPage;