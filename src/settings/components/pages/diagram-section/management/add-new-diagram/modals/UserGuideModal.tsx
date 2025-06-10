import React from 'react';
import {
    ReactObsidianModal,
    ReactObsidianSetting,
} from 'react-obsidian-setting';
import { useUserGuideVideo } from './hooks/useUserGuideVideo';

interface UserGuideModalProps {
    onClose: () => void;
}

const UserGuideModal: React.FC<UserGuideModalProps> = ({ onClose }) => {
    const { isLoading, videoUrl } = useUserGuideVideo();

    return (
        <ReactObsidianModal title={'User Guide'} onClose={() => onClose()}>
            <>
                <ReactObsidianSetting
                    name={'How this plugin does work'}
                    setHeading={true}
                />

                <ReactObsidianSetting
                    addMultiDesc={(multiDesc) => {
                        multiDesc.addDesc(
                            'This plugin stores data related to your selected elements.'
                        );
                        multiDesc.addDesc(
                            'When you open another Markdown file with a diagram code in it and switch to preview mode, ' +
                                'the plugin attempts to find the corresponding diagram in preview.'
                        );
                        multiDesc.addDesc(
                            'If a matching diagram is found, the plugin creates a container, applies CSS styles, ' +
                                'and enables diagram movement, zooming, and adds a control panel.'
                        );
                        return multiDesc;
                    }}
                />

                <ReactObsidianSetting
                    name={'How to find selectors in DevTool'}
                    setHeading={true}
                    desc={
                        'To identify the CSS selectors for diagrams on this page, follow these steps below using your browser’s DevTools:'
                    }
                />
                <ReactObsidianSetting
                    name={'Steps to find selectors:'}
                    addMultiDesc={(multiDesc) => {
                        multiDesc.addDesc(
                            '1. Open the markdown file in Obsidian where the diagram is. You should switch to preview mode.'
                        );
                        multiDesc.addDesc(
                            '2. Open the DevTools window. You can do it by pressing CTRL + SHIFT + I.'
                        );
                        multiDesc.addDesc(
                            '3. Click the "Select an element on this page to inspect it" button (usually a arrow icon) in the top-left corner of the DevTools window. You can also press CTRL + SHIFT + C'
                        );
                        multiDesc.addDesc(
                            '4. Move your cursor over the diagram and click on it to select the element.'
                        );
                        multiDesc.addDesc(
                            '5. In the Elements tab of DevTools, you will see the HTML element corresponding to the diagram highlighted.'
                        );

                        multiDesc.addDesc(
                            '6. Look for the "class" attribute in the highlighted element. ' +
                                'Common examples: `.mermaid`, `.block-language-plantuml`, `#chart-svg`'
                        );
                        return multiDesc;
                    }}
                />

                {isLoading && <p>Loading video...</p>}
                {!isLoading && videoUrl && (
                    <video
                        src={videoUrl}
                        controls={true}
                        autoPlay={false}
                        style={{ width: '100%', maxHeight: '400px' }}
                    />
                )}
                {!isLoading && !videoUrl && (
                    <p>Video failed to load. Please try again later.</p>
                )}
            </>
        </ReactObsidianModal>
    );
};

export default UserGuideModal;
