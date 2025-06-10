import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ButtonComponent } from 'obsidian';
import React from 'react';
import { MobileMiniNavbar } from './PanelSection.styled';
import { ReactObsidianSetting } from 'react-obsidian-setting';
import Settings from './settings/Settings';
import Management from './management/Management';

const PanelSection: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isSettingsActive =
        location.pathname === '/panel-section/settings' ||
        location.pathname === '/panel-section';
    const isManagementActive =
        location.pathname === '/panel-section/management';

    return (
        <>
            <MobileMiniNavbar>
                <ReactObsidianSetting
                    addButtons={[
                        (button): ButtonComponent => {
                            button.setIcon('settings');
                            button.setTooltip('Panels Settings');
                            button.onClick(async () => {
                                await navigate('/panel-section/settings');
                            });
                            if (isSettingsActive) {
                                button.setClass('button-active');
                            }
                            return button;
                        },

                        (button): ButtonComponent => {
                            button.setIcon('folder-plus');
                            button.setTooltip('Panels Management');
                            button.onClick(async () => {
                                await navigate('/panel-section/management');
                            });
                            if (isManagementActive) {
                                button.setClass('button-active');
                            }
                            return button;
                        },
                    ]}
                />
            </MobileMiniNavbar>

            <Routes>
                <Route index element={<Settings />} />
                <Route path="settings" element={<Settings />} />
                <Route path="management" element={<Management />} />
            </Routes>
        </>
    );
};

export default PanelSection;
