import { ReactObsidianSetting } from 'react-obsidian-setting';
import React from 'react';
import SizeDimensionsOption from './DimensionsOption';
import { ComponentType } from './typing/Size.constants';
import { useSettingsContext } from '../../../../core/SettingsContext';

const Size: React.FC = () => {
    const { plugin } = useSettingsContext();
    return (
        <>
            <ReactObsidianSetting
                name={'Diagram Size'}
                addMultiDesc={(multidesc) => {
                    multidesc.addDescriptions([
                        'Note: You need to reopen all the open Markdown views with diagrams in them to apply these settings.',
                    ]);
                    return multidesc;
                }}
                setHeading={true}
            />

            <SizeDimensionsOption
                type={ComponentType.Expanded}
                initialOptions={plugin.settings.data.diagrams.size.expanded}
            />
            <SizeDimensionsOption
                type={ComponentType.Folded}
                initialOptions={plugin.settings.data.diagrams.size.folded}
            />
        </>
    );
};

export default Size;
