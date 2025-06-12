import React from 'react';

import {
    ReactObsidianModal,
    ReactObsidianSetting,
} from 'react-obsidian-setting';
import PanelLayout from '../panel-layout/PanelLayout';

interface LayoutModalProps {
    onClose: () => void;
    title: string;
}

const LayoutModal: React.FC<LayoutModalProps> = ({ onClose, title }) => {
    return (
        <ReactObsidianModal
            onClose={onClose}
            title={title}
            width={'50vw'}
            height={'90vh'}
            maxHeight={'100vh'}
            maxWidth={'100vw'}
        >
            <ReactObsidianSetting
                name="Panel configuration"
                desc="Configure the visibility and position of control panels on your diagrams"
                setHeading={true}
                noBorder={true}
            />
            <ReactObsidianSetting
                name="Available panels"
                addMultiDesc={(multiDesc) => {
                    multiDesc.addDesc(
                        '• Move Panel: By default located at bottom right - Contains 8 directional buttons for diagram movement'
                    );
                    multiDesc.addDesc(
                        '• Zoom Panel: By default located at center right - Features zoom in/out and reset controls'
                    );
                    multiDesc.addDesc(
                        '• Service Panel: By default located at upper right - Contains additional functionality buttons'
                    );
                    return multiDesc;
                }}
                noBorder={true}
            />
            <ReactObsidianSetting
                name="How to customize panels"
                addMultiDesc={(multiDesc) => {
                    multiDesc.addDesc(
                        '1. Use checkboxes below to toggle panel visibility on/off'
                    );
                    multiDesc.addDesc(
                        '2. Click and drag any panel to reposition it on the diagram'
                    );
                    multiDesc.addDesc(
                        '3. Panel positions are saved automatically'
                    );
                    multiDesc.addDesc(
                        '4. Reload the view to see your changes take effect'
                    );
                    return multiDesc;
                }}
            />
            <PanelLayout />
        </ReactObsidianModal>
    );
};

export default LayoutModal;
