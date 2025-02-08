import React, { useState, useEffect } from "react";
import {
  Button,
  Flex,
  Spinner,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalFooter,
  Input,
  FormControl,
  FormLabel,
  Box,
  Stack,
  Heading,
  Center,
  Image,
  Select,
} from "@chakra-ui/react";
import axios from "axios";
import { backend } from "../../server_urls";

import ProjectRow from "./ProjectRow";
import { FaPlus } from "react-icons/fa";

const Project = () => {
  const [data, setdata] = useState([]);
  const [files, setfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [projectName, setProjectName] = useState("");
  const [grammarName, setGrammarName] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const onCreate = async () => {
    const jwttoken = localStorage.getItem("jwtToken");
    setSubmitLoading(true);
    try {
      const requestOptions = {
        headers: { "Content-Type": "application/json", token: jwttoken },
      };
      const res = await axios.post(
        "api/project/new",
        { name: projectName, grammarName: grammarName },
        requestOptions
      );
      setdata((olddata) => [...olddata, res.data]);
      setProjectName("")
      setGrammarName("")
      onClose();
      setSubmitLoading(false);
      toast({
        title: "Project created successfully",
        status: "success",
        duration: 10000,
        isClosable: true,
        position: "top-right",
      });
    } catch (error) {
      setSubmitLoading(false);
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

  const getmyprojects = async () => {
    const jwttoken = localStorage.getItem("jwtToken");
    try {
      const requestOptions = {
        headers: { "Content-Type": "application/json", token: jwttoken },
      };
      const res = await axios.get(
        // "http://localhost:5002/api/project/my",
        backend + "/api/project/my",
        requestOptions
      );

      setdata(res.data);
      // console.log(data);
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

  const getfiles = async () => {
    const jwttoken = localStorage.getItem("jwtToken");
    // let url = `http://localhost:5002/api/json/timeline`;
    let url = backend + `/api/json/timeline`;
    try {
      const requestOptions = {
        headers: { "Content-Type": "application/json", token: jwttoken },
      };
      const res = await axios.get(url, requestOptions);
      // console.log(res);

      setfiles(res.data);
      // alert(files)
    } catch (error) {
      toast({
        title: "Something went wrong 1",  //Goes wrong
        status: "error",
        duration: 10000,
        isClosable: true,
        position: "top",
      });
      console.log(error);
    }
  };

  useEffect(() => {
    const f = async () => {
      setLoading(true);
      await getmyprojects();
      await getfiles();
      setLoading(false);
    };
    f();
  }, []);

  const handleGrammar = (e) => {
    setGrammarName(e.target.value)
  }

  return loading ? (
    <>
      <Flex
        width={"100vw"}
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
    <Box minH="85vh">
      <Flex justifyContent={"space-between"} mx={"60px"} py={"30px"}>
        <Heading>My Projects</Heading>
        <Button leftIcon={<FaPlus />} colorScheme="gray" onClick={onOpen} border="1px">
          Create Project
        </Button>
      </Flex>
      <Flex direction="column" mx={"60px"}>
        {data.length > 0 ? (
          data.map((row) => {
            return (
              <ProjectRow
                key={row._id}
                name={row.name}
                organization={row.ownerid.organization}
                owner={row.ownerid.name}
                projid={row._id}
                isFinished={row.isFinished}
                grammarName={row.grammarName}
                scene={row.scene}
                asset={row.asset}
                action={row.action}
                custom={row.custom}
                timeline={row.timeline}
              />
            );
          })
        ) : (
          <Center>
            <Image src="/assets/empty.png" maxW="300px" />
          </Center>
        )}
      </Flex>

      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create new project</ModalHeader>
          <ModalCloseButton />
          <Box p={10}>
            <FormControl isRequired>
              <FormLabel>Project Name</FormLabel>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Model Template Validator</FormLabel>
              <Select value={grammarName} onChange={handleGrammar}>
                <option value="">Select</option>
                {files.map((p, index) => (
                  <option key={index} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </Box>
          <ModalFooter>
            <Stack spacing={2} direction="row">
              <Button
                onClick={onCreate}
                disabled={submitLoading || !projectName || !grammarName}
                isLoading={submitLoading}
                loadingText="Creating"
                colorScheme={"whatsapp"}
              >
                Create
              </Button>
              <Button onClick={onClose}>Close</Button>
            </Stack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Project;
