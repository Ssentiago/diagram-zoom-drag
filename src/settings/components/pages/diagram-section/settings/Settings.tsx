import React from 'react';
import DiagramSize from './size/Size';
import Folding from './folding/Folding';

const Settings: React.FC = (): React.ReactElement => {
    return (
        <>
            <DiagramSize />
            <Folding />
        </>
    );
};

export default Settings;
