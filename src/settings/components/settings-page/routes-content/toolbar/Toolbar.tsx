import React from 'react';
import { Platform } from 'obsidian';
import Navbar from './Navbar';
import ResetSettings from './ResetSettings';

import styled from 'styled-components';

const DesktopToolbar = styled.div`
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    width: 100%;

    &::before {
        content: '';
    }
`;

const DesktopResetButtonWrapper = styled.div`
    justify-self: end;
    display: flex;
    align-items: center;
    margin-top: 35px;
`;

const MobileResetButtonWrapper = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-top: -50px;
    margin-right: 0;
    padding: 0;
    width: 100%;
    margin-bottom: 0;
`;

/**
 * The settings page toolbar.
 *
 * On desktop, it displays the navbar in the center of the page and the reset
 * settings button on the right. On mobile, it displays the reset settings button
 * on the right and the navbar below it.
 * @returns The toolbar element.
 */
const Toolbar: React.FC = (): React.ReactElement => {
    if (Platform.isDesktopApp) {
        return (
            <DesktopToolbar>
                <Navbar />
                <DesktopResetButtonWrapper>
                    <ResetSettings />
                </DesktopResetButtonWrapper>
            </DesktopToolbar>
        );
    }

    return (
        <>
            <MobileResetButtonWrapper>
                <ResetSettings />
            </MobileResetButtonWrapper>
            <Navbar />
        </>
    );
};

export default Toolbar;
