declare type UseSteps = {
    initialStep: number;
};
export declare function useSteps({ initialStep }: UseSteps): {
    nextStep: () => void;
    prevStep: () => void;
    reset: () => void;
    setStep: (step: number) => void;
    activeStep: number;
};
export {};
