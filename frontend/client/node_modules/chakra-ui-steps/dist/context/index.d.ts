import * as React from 'react';
import { StepsProps } from '../components/Steps';
interface StepsContextValue extends StepsProps {
    stepContainerWidths?: number[];
    clickable?: boolean;
    isError?: boolean;
    isLoading?: boolean;
    isVertical?: boolean;
    isLabelVertical?: boolean;
    widths?: number[];
    setWidths?: React.Dispatch<React.SetStateAction<number[]>>;
    stepCount?: number;
}
export declare const useStepsContext: () => StepsContextValue;
export declare const StepsProvider: React.FC<{
    value: StepsContextValue;
}>;
export {};
