import axios from "axios";
import React, { useState } from "react";
import AceEditor from "react-ace";
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Center,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Radio,
  RadioGroup,
  Stack,
  useToast,
  Switch,
} from "@chakra-ui/react";

import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-terminal";
import { FaSave } from "react-icons/fa";
import { Link, useHistory } from "react-router-dom";
import { backend } from "../../server_urls";

import isJson from "../../utils/checkjson";
import { ChevronRightIcon } from "@chakra-ui/icons";

const AddFile = () => {
  const [filename, setfilename] = useState("");
  const [data, setdata] = useState("");
  const [loading, setLoading] = useState(false);
  const [grammarfor, setGrammarfor] = React.useState("scene");
  const [privateFile, setPrivateFile] = React.useState(false);
  const history = useHistory();
  const toast = useToast();

  function onChange(newValue) {
    setdata(newValue);
  }

  const submitform = async () => {
    const jwttoken = localStorage.getItem("jwtToken");
    setLoading(true);
    try {
      const requestOptions = {
        headers: { "Content-Type": "application/json", token: jwttoken },
      };
      //  if (grammarfor=="scene"){ let url ="http://localhost:5002/api/json/upload";}
      //  if (grammarfor=="action"){ let url ="http://localhost:5002/api/json/upload";}
      //  if (grammarfor=="asset"){ let url ="http://localhost:5002/api/json/upload";}
      //  if (grammarfor=="custom"){ let url ="http://localhost:5002/api/json/upload";}
      //  if (grammarfor=="timeline"){ let url ="http://localhost:5002/api/json/upload";}


      await axios.post(
        // "http://localhost:5002/api/json/upload",
        backend + "/api/json/upload",
        { name: filename, private: privateFile },
        requestOptions
      );
      history.push("/myfiles");
      setLoading(false);
      toast({
        title: "File saved successfully",
        status: "success",
        duration: 10000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      console.log(error);
      if (error.response.data.message == 'JSON file with this name already exists') {
        toast({
          title: "File with this name already exists",
          status: "error",
          duration: 10000,
          isClosable: true,
          position: "top",
        });
        setLoading(false);
      }
    }
  };

  return (
    <>
      <Breadcrumb
        spacing="8px"
        pt={5}
        pl={5}
        separator={<ChevronRightIcon color="gray.500" />}
      >
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/myfiles">
            My Validators
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>Add Validator</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <Flex
        backgroundColor={"white"}
        flexDir={"column"}
        justifyContent={"center"}
        alignItems="center"
        py="100px"
      >
        <Flex
          boxShadow={"xl"}
          p={8}
          rounded={"xl"}
          align={"center"}
          borderWidth={"1px"}
          borderColor="gray.400"
          mb={5}
        >
          <Flex justifyContent="center" flexDir={"column"} backgroundColor={"white"}>
            <Box p="2">
              <Input
                colorScheme="yellow"
                placeholder="Validator Name"
                isRequired
                onChange={(e) => setfilename(e.target.value)}
                value={filename}
              />
            </Box>
            <FormControl display="flex" justifyContent="center" pb={2}>
              <FormLabel htmlFor="public-file" mb="0">
                Private
              </FormLabel>
              <Switch
                id="public-file"
                defaultChecked={privateFile}
                onChange={() => {
                  setPrivateFile(!privateFile);
                  if (!privateFile) {
                    toast({
                      title: "Enabled! The File will be only visible to you.",
                      status: "success",
                      duration: 10000,
                      isClosable: true,
                      position: "top",
                    })
                  }
                  else
                  {
                    toast({
                      title: "Disabled! File is publicly visible.",
                      status: "success",
                      duration: 10000,
                      isClosable: true,
                      position: "top",
                    })
                  }
                }}
              />
            </FormControl>
          </Flex>
        </Flex>
        <Box mx={"40px"}>
        </Box>
        <Center minW="max-content" justifyContent={"center"} my={"20px"}>
          <Button
            leftIcon={<FaSave />}
            colorScheme="yellow"
            onClick={submitform}
            isLoading={loading}
            isDisabled={!filename}
          >
            Create Validator
          </Button>
        </Center>
      </Flex>
    </>
  );
};

export default AddFile;
