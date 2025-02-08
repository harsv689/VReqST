import {
  Box,
  Text,
  Button,
  IconButton,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { CloseIcon } from "@chakra-ui/icons";

const GuidedTour = ({ steps, isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen && steps[currentStep]) {
      const element = document.querySelector(steps[currentStep].target);
      if (element) {
        element.style.position = "relative";
        element.style.zIndex = 1000;
        element.style.boxShadow = "0 0 10px 5px rgba(0, 0, 0, 0.5)";
      }
    }
    return () => {
      if (steps[currentStep]) {
        const element = document.querySelector(steps[currentStep].target);
        if (element) {
          element.style.position = "";
          element.style.zIndex = "";
          element.style.boxShadow = "";
        }
      }
    };
  }, [currentStep, isOpen, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    isOpen && (
      <>
        <Box
          position="fixed"
          top="0"
          left="0"
          width="100%"
          height="100%"
          bg="rgba(0, 0, 0, 0.7)"
          zIndex="999"
        />
        <Box
          position="fixed"
          top={steps[currentStep].position?.top || "50%"}
          left={steps[currentStep].position?.left || "50%"}
          transform="translate(-50%, -50%)"
          bg="white"
          p="4"
          borderRadius="md"
          zIndex="1001"
          maxWidth="300px"
          textAlign="center"
          paddingTop="8"
        >
          <IconButton
            aria-label="Close Tour"
            icon={<CloseIcon />}
            position="absolute"
            top="4px"
            right="4px"
            onClick={onClose}
            size="xs"
          />
          <Text mb="4">{steps[currentStep].content}</Text>
          <Button onClick={handleBack} isDisabled={currentStep === 0} mr="3">
            Back
          </Button>
          <Button onClick={handleNext}>
            {currentStep === steps.length - 1 ? "Finish" : "Next"}
          </Button>
        </Box>
      </>
    )
  );
};

export default GuidedTour;