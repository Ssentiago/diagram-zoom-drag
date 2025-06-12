import { useSettingsContext } from '../../../../core/SettingsContext';
import { useDiagramManagerContext } from '../context/diagramManagerContext';
import { useEffect, useState } from 'react';
import { DiagramData } from '../../../../../typing/interfaces';

// const diagramRegexp = /^[\w-]+$/;

export interface DiagramValidationResult {
    empty: boolean;
    valid: boolean;
    tooltip: string;
}

export interface GlobalValidationResult {
    nameResult: DiagramValidationResult;
    selectorResult: DiagramValidationResult;
    bothEmpty: boolean;
    oneEmpty: boolean;
}

export const useDiagramValidation = () => {
    const { plugin } = useSettingsContext();
    const { diagrams } = useDiagramManagerContext();
    const [diagramNamesIndex, setDiagramNamesIndex] = useState(new Set());
    const [diagramSelectorsIndex, setDiagramSelectorsIndex] = useState(
        new Set()
    );

    const updateDiagramNameAndSelectors = (diagrams: DiagramData[]) => {
        const diagramIndexData = {
            names: [] as string[],
            selectors: [] as string[],
        };
        diagrams.forEach((item) => {
            diagramIndexData.names.push(item.name);
            diagramIndexData.selectors.push(item.selector);
        });
        setDiagramNamesIndex(new Set(diagramIndexData.names));
        setDiagramSelectorsIndex(new Set(diagramIndexData.selectors));
    };

    useEffect(() => {
        updateDiagramNameAndSelectors(
            plugin.settings.data.diagrams.supported_diagrams
        );
        const handler = (payload: any) => {
            updateDiagramNameAndSelectors(diagrams);
        };

        plugin.settings.eventBus.on(
            plugin.settings.events.diagrams.supported_diagrams.$path,
            handler
        );

        return () => {
            plugin.settings.eventBus.off(
                plugin.settings.events.diagrams.supported_diagrams.$path,
                handler
            );
        };
    }, [diagrams]);

    const testSelector = (selector: string) => {
        try {
            document.querySelector(selector);
            return { valid: true, err: undefined };
        } catch (err: any) {
            const parts = (err.message as string).split(':');
            const message = parts.slice(1).join(':').trim();
            return { valid: false, err: message };
        }
    };

    const validateName = (
        name: string,
        exclude?: DiagramData
    ): DiagramValidationResult => {
        if (!name.trim()) {
            return {
                empty: true,
                tooltip: '',
                valid: false,
            };
        }

        // if (!diagramRegexp.test(name)) {
        //     return {
        //         valid: false,
        //         tooltip: 'Incorrect input. Should be only A-Za-z0-9-',
        //         empty: false,
        //     };
        // }

        if (
            diagramNamesIndex.has(name) &&
            (!exclude || exclude.name !== name)
        ) {
            return {
                valid: false,
                tooltip: 'Diagram with that name already exists',
                empty: false,
            };
        }

        return { valid: true, tooltip: '', empty: false };
    };

    const validateSelector = (
        selector: string,
        exclude?: DiagramData
    ): DiagramValidationResult => {
        if (!selector.trim()) {
            return {
                empty: true,
                tooltip: '',
                valid: false,
            };
        }

        const { valid, err } = testSelector(selector);
        if (!valid) {
            return {
                valid: false,
                tooltip: `Invalid CSS selector: ${err}`,
                empty: false,
            };
        }

        if (
            diagramSelectorsIndex.has(selector) &&
            (!exclude || exclude.selector !== selector)
        ) {
            return {
                valid: false,
                tooltip: 'Diagram with that selector already exists',
                empty: false,
            };
        }

        return { valid: true, tooltip: '', empty: false };
    };

    const validateBoth = (
        name: string,
        selector: string,
        exclude?: DiagramData
    ): GlobalValidationResult => {
        const nameResult = validateName(name, exclude);
        const selectorResult = validateSelector(selector, exclude);
        const bothEmpty = nameResult.empty && selectorResult.empty;
        const oneEmpty =
            (nameResult.empty || selectorResult.empty) && !bothEmpty;

        return { nameResult, selectorResult, bothEmpty, oneEmpty };
    };

    const applyValidationToElement = (
        element: HTMLInputElement,
        result: DiagramValidationResult
    ) => {
        element.classList.toggle('invalid', !result.empty && !result.valid);
        element.ariaLabel = result.tooltip;
    };

    const processBothValidation = (
        nameInput: HTMLInputElement,
        selectorInput: HTMLInputElement,
        result: GlobalValidationResult
    ): boolean => {
        applyValidationToElement(nameInput, result.nameResult);
        applyValidationToElement(selectorInput, result.selectorResult);

        if (result.bothEmpty) {
            plugin.showNotice('Nothing to save');
            return false;
        }

        if (result.oneEmpty) {
            const field = result.nameResult.empty ? 'name' : 'selector';
            plugin.showNotice(`Fill out diagram ${field} field!`);
            return false;
        }

        const bothInvalid =
            !result.nameResult.valid && !result.selectorResult.valid;
        const oneInvalid =
            !result.nameResult.valid || !result.selectorResult.valid;

        if (bothInvalid) {
            plugin.showNotice('Diagram name and selector are both invalid');
            return false;
        }

        if (oneInvalid) {
            const field = !result.nameResult.valid ? 'name' : 'selector';
            plugin.showNotice(`Diagram ${field} is invalid`);
            return false;
        }

        return true;
    };

    const processNameValidation = (
        nameInput: HTMLInputElement,
        result: DiagramValidationResult
    ): boolean => {
        applyValidationToElement(nameInput, result);
        return result.valid && !result.empty;
    };

    const processSelectorValidation = (
        selectorInput: HTMLInputElement,
        result: DiagramValidationResult
    ): boolean => {
        applyValidationToElement(selectorInput, result);
        return result.valid && !result.empty;
    };

    return {
        validateBoth,
        validateName,
        validateSelector,
        processBothValidation,
        processNameValidation,
        processSelectorValidation,
    };
};
