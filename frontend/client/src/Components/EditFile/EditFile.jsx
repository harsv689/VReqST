import axios from "axios";
import React, { useEffect, useState } from "react";
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
  Radio,
  RadioGroup,
  Spinner,
  Stack,
  Switch,
  useToast,
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-terminal";
import { FaSave, FaTimes } from "react-icons/fa";
import { useHistory, useParams, Link } from "react-router-dom";
import { backend } from "../../server_urls";

import isJson from "../../utils/checkjson";
// import { check } from "express-validator";

const scenefile = require("../default/scene.txt")
const assetfile = require("../default/asset.txt")
const actionfile = require("../default/action.txt")
const timelinefile = require("../default/timeline.txt")

const EditFile = () => {
  const [filename, setfilename] = useState("");
  const [data, setdata] = useState("");
  const [loading, setLoading] = useState(false);
  const [grammarfor, setGrammarfor] = useState("");
  const [privateFile, setPrivateFile] = useState(false);
  const [flag, setflag] = useState(false);
  const [isSaved, setSaved] = useState(true);

  const [scenedef, setScenedef] = useState('');
  const [assetdef, setAssetdef] = useState('');
  const [actiondef, setActiondef] = useState('');
  const [timelinedef, setTimelinedef] = useState('');

  const [scenedata, setSceneData] = useState('');
  const [assetdata, setAssetData] = useState('');
  const [actiondata, setActionData] = useState('');
  const [timelinedata, setTimelineData] = useState('');

  const history = useHistory();
  const toast = useToast();
  let { fileid } = useParams();

  const fetchdata = async () => {
    const jwttoken = localStorage.getItem("jwtToken");
    try {
      const requestOptions = {
        headers: { "Content-Type": "application/json", token: jwttoken },
      };
      const res = await axios.get(
        // `http://localhost:5002/api/json/${fileid}`,
        backend + `/api/json/${fileid}`,
        requestOptions
      );

      if (res.data.scene != null) setSceneData(res.data.scene);
      if (res.data.asset != null) setAssetData(res.data.asset);
      if (res.data.action != null) setActionData(res.data.action);
      if (res.data.timeline != null) setTimelineData(res.data.timeline);

      setfilename(res.data.name);
      setGrammarfor(res.data.grammarfor);
      setPrivateFile(res.data.private);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchDefault = async () => {
    try {
      const response1 = await fetch(scenefile);
      if (!response1.ok) {
        throw new Error('Network response was not ok.');
      }
      const data1 = await response1.text();
      setScenedef(data1);

      const response2 = await fetch(assetfile);
      if (!response2.ok) {
        throw new Error('Network response was not ok.');
      }
      const data2 = await response2.text();
      setAssetdef(data2);

      const response3 = await fetch(actionfile);
      if (!response3.ok) {
        throw new Error('Network response was not ok.');
      }
      const data3 = await response3.text();
      setActiondef(data3);

      const response4 = await fetch(timelinefile);
      if (!response4.ok) {
        throw new Error('Network response was not ok.');
      }
      const data4 = await response4.text();
      setTimelinedef(data4);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchdata();
    fetchDefault();
    setLoading(false);
  }, []);

  function onChange(newValue) {
    setdata(newValue);
    setSaved(false);
  }

  const handleGrammar = (value) => {
    setflag(false);
    setGrammarfor(value);
    if (value === "scene") setdata(scenedata);
    if (value === "asset") setdata(assetdata);
    if (value === "action") setdata(actiondata);
    if (value === "timeline") setdata(timelinedata);
  }

  const handleSwitch = () => {
    setSaved(false);
    if (!flag) {
      if (grammarfor === "scene") setdata(scenedef);
      if (grammarfor === "asset") setdata(assetdef);
      if (grammarfor === "action") setdata(actiondef);
      if (grammarfor === "timeline") setdata(timelinedef);
      setflag(true)
    }
    else {
      // setdata("");
      if (grammarfor === "scene") setdata(scenedata);
      if (grammarfor === "asset") setdata(assetdata);
      if (grammarfor === "action") setdata(actiondata);
      if (grammarfor === "timeline") setdata(timelinedata);
      setflag(false)
    }
  }

  const saveFiles = async () => {
    if (!isJson(data)) {
      toast({
        title: "JSON Syntax is not correct",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    const jwttoken = localStorage.getItem("jwtToken");
    setLoading(true);

    try {
      const requestOptions = {
        headers: { "Content-Type": "application/json", token: jwttoken },
      };

      let url = backend;
      if (grammarfor === "scene") {
        url = url + `/api/json/${fileid}/scene`;
        setSceneData(data);
      }
      if (grammarfor === "action") {
        url = url + `/api/json/${fileid}/action`;
        setActionData(data);
      }
      if (grammarfor === "asset") {
        url = url + `/api/json/${fileid}/asset`;
        setAssetData(data);
      }
      if (grammarfor === "timeline") {
        url = url + `/api/json/${fileid}/timeline`;
        setTimelineData(data);
      }
      setSaved(true);

      await axios.patch(
        url,
        { data, name: filename, grammarfor },
        requestOptions
      );
      // history.push("/myfiles");
      setLoading(false);
      toast({
        title: "File updated successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    } catch (error) {
      console.log(error);
    }
    setflag(false);
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
    <Box minH={"85vh"}>
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
          <BreadcrumbLink>{filename}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <Flex
        flexDir={"column"}
        justifyContent={"center"}
        alignItems="center"
        py="50px"
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
          <Flex justifyContent="center" flexDir={"column"}>
            <RadioGroup onChange={handleGrammar} value={grammarfor} py={2}>
              <Stack direction="row">
                <Radio isReadOnly={!isSaved} value="scene">Scene</Radio>
                <Radio isReadOnly={!isSaved} value="asset">Asset</Radio>
                <Radio isReadOnly={!isSaved} value="action">Action</Radio>
                <Radio isReadOnly={!isSaved} value="timeline">Timeline</Radio>
              </Stack>
            </RadioGroup>
            <FormControl display="flex" justifyContent="center" pb={2}>
              <FormLabel htmlFor="public-file" mb="0">
                DEFAULT
              </FormLabel>
              <Switch
                id="public-file"
                defaultChecked={false}
                isChecked={flag}
                onChange={handleSwitch}
              />
            </FormControl>
          </Flex>
        </Flex>

        <Box mx={"40px"}>
          <AceEditor
            fontSize={16}
            showPrintMargin={true}
            showGutter={true}
            highlightActiveLine={true}
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              enableSnippets: false,
              showLineNumbers: true,
              tabSize: 2,
            }}
            mode="json"
            theme="terminal"
            onChange={onChange}
            value={data}
            name="grammar-editor"
            id="grammar-editor"
            wrapEnabled
            height="40em"
            width="60em"
          />
        </Box>
        <Center minW="max-content" justifyContent={"center"} my={"20px"}>
          <Button
            leftIcon={<FaSave />}
            colorScheme="yellow"
            // disabled={!filename || !data}
            disabled={isSaved}
            onClick={() => {saveFiles()}}
            isLoading={loading}
          >
            Save Validator
          </Button>
          <Button
            leftIcon={<FaTimes />}
            colorScheme="yellow"
            disabled={!isSaved}
            onClick={() => {
              history.push("/myfiles");
            }}
            isLoading={loading}
          >
            Exit
          </Button>
        </Center>
      </Flex>
    </Box>
  );
};

export default EditFile;
