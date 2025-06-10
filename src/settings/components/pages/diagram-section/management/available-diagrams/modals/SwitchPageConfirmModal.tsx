import { App, Modal, Setting } from 'obsidian';
import React, { useEffect } from 'react';
import {
    ReactObsidianModal,
    ReactObsidianSetting,
} from 'react-obsidian-setting';

interface SwitchPageConfirmProps {
    diagramName: string;
    onSubmit: (action: 'Yes' | 'No' | 'Save') => void;
    onClose: () => void;
}

export const SwitchPageConfirmModal: React.FC<SwitchPageConfirmProps> = ({
    diagramName,
    onSubmit,
    onClose,
}) => {
    const handleAction = (action: 'Yes' | 'No' | 'Save') => {
        onSubmit(action);
        onClose();
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                handleAction('Save');
            }
            if (e.key === 'Escape') {
                handleAction('No');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <ReactObsidianModal
            title={`Editing ${diagramName}...`}
            onClose={onClose}
            // position={{ left: '0px', top: '0px' }}
            // width={'4000px'}
            // height={'4000px'}
        >
            <ReactObsidianSetting
                name={
                    'Are you sure you want to switch the page? You will lose your unsaved changes.'
                }
                setHeading={true}
                addButtons={[
                    (button) => {
                        button.setButtonText('Proceed without saving');
                        button.onClick(() => {
                            handleAction('Yes');
                        });
                        return button;
                    },
                    (button) => {
                        button.setButtonText('Cancel');
                        button.onClick(() => {
                            handleAction('No');
                        });
                        return button;
                    },
                    (button) => {
                        button.setButtonText('Save and continue');
                        button.buttonEl.focus();
                        button.onClick(() => {
                            handleAction('Save');
                        });
                        return button;
                    },
                ]}
            />
        </ReactObsidianModal>
    );
};
