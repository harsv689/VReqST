import { HTMLChakraProps } from '@chakra-ui/system';
import * as React from 'react';
export interface StepProps extends HTMLChakraProps<'li'> {
    label?: string | React.ReactNode;
    description?: string;
    icon?: React.ComponentType<any>;
    state?: 'loading' | 'error';
    checkIcon?: React.ComponentType<any>;
    isCompletedStep?: boolean;
    isKeepError?: boolean;
}
export declare const Step: import("@chakra-ui/system").ComponentWithAs<"li", StepProps>;
