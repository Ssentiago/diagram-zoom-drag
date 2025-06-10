import { ReactObsidianSetting } from 'react-obsidian-setting';
import React from 'react';
import SizeDimensionsOption from './DimensionsOption';
import { ComponentType } from './typing/Size.constants';

const Size: React.FC = () => {
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

            <SizeDimensionsOption type={ComponentType.Expanded} />
            <SizeDimensionsOption type={ComponentType.Folded} />
        </>
    );
};

export default Size;
