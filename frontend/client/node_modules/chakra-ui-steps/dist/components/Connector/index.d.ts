import { HTMLChakraProps, ThemingProps } from '@chakra-ui/system';
import * as React from 'react';
interface ConnectorProps extends HTMLChakraProps<'div'>, ThemingProps {
    isCompletedStep: boolean;
    isLastStep?: boolean;
    hasLabel?: boolean;
    index: number;
}
export declare const Connector: React.MemoExoticComponent<({ index, isCompletedStep, children, isLastStep, hasLabel, }: ConnectorProps) => JSX.Element>;
export {};
