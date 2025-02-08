import { ChevronRightIcon } from "@chakra-ui/icons";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import Axios from "axios";
import { Step, Steps, useSteps } from "chakra-ui-steps";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { backend } from "../../server_urls";

import ProjectPageContent from "./ProjectPageContent";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const steps = [
  { label: "Step 1", description: "Scene(s)" },
  { label: "Step 2", description: "Article(s)" },
  { label: "Step 3", description: "Action-Response(s)" },
  { label: "Step 4", description: "Behaviour(s)" },
  { label: "Step 5", description: "Timeline" },
];

const ProjectPage = () => {
  const { nextStep, prevStep, setStep, reset, activeStep } = useSteps({
    initialStep: 0,
  });

  const [currProject, setcurrProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const { projectid } = useParams();

  const jwttoken = localStorage.getItem("jwtToken");
  const getProject = async () => {
    try {
      const requestOptions = {
        headers: { "Content-Type": "application/json", token: jwttoken },
      };
      const res = await Axios.get(
        // `http://localhost:5002/api/project/${projectid}`,
        backend + `/api/project/${projectid}`,
        requestOptions
      );

      setcurrProject(res.data);
      // setStep(res.data.step);
      // console.log(res.data.stModel Template
    } catch (error) {
      toast({
        title: "Something went wrong",
        status: "error",
        duration: 10000,
        isClosable: true,
        position: "top",
      });
      console.log(error);
    }
  };

  const handleStep = (step) => {
    if (step <= activeStep) {
      const f = async () => {
        try {
          setLoading(true);
          await getProject();
          setLoading(false);
        } catch (err) {
          console.log(err);
        }
      };
      f();
      setStep(step);
    }
  }

  useEffect(() => {
    const f = async () => {
      try {
        setLoading(true);
        await getProject();
        setLoading(false);
      } catch (err) {
        console.log(err);
      }
    };

    f();
  }, []);

  {
    return loading === true || currProject === null ? (
      <>
        <Flex
          width={"80vw"}
          height={"85vh"}
          justifyContent="center"
          alignItems={"center"}
        >
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="xl"
          />
        </Flex>
      </>
    ) : (
      <Flex flexDir="column" minH={"85vh"}>
        <Breadcrumb
          spacing="8px"
          pt={5}
          pl={5}
          separator={<ChevronRightIcon color="gray.500" />}
        >
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/projects">
              Projects
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>{currProject.name}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        <Flex flexDir={"column"} m="30px">
          <Steps
            colorScheme="yellow"
            activeStep={activeStep}
            onClickStep={handleStep}
          >
            {steps.map(({ label, description }) => (
              <Step
                labelOrientation="vertical"
                label={label}
                key={label}
                description={description}
              >
                <DndProvider backend={HTML5Backend}>
                  <ProjectPageContent
                    projectname={currProject.name}
                    nextStep={nextStep}
                    prevStep={prevStep}
                    reset={reset}
                    activeStep={activeStep}
                    stepslen={steps.length}
                    scene={currProject.scene}
                    action={currProject.action}
                    asset={currProject.asset}
                    custom={currProject.custom}
                    timeline={currProject.timeline}
                  />
                </DndProvider>
              </Step>
            ))}
          </Steps>
        </Flex>
      </Flex>
    );
  }
};

export default ProjectPage;
