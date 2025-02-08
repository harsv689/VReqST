import {
  Box,
  Flex,
  Heading,
  Input,
  Spinner,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  Text,
  useToast,
} from "@chakra-ui/react";

import Axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { backend } from "../../server_urls";
import GuidedTour from "./GuidedTour";
import Stack from "./Stack"

const scenefile = require("../default/lol.json")
const scenevalidator = require("../default/lol-validator.txt")
const assetfile = require("../default/asset.txt")
// const actionfile = require("../default/action.txt")
// const timelinefile = require("../default/timeline.txt")

const flattenJson = (data, parentKey = '') => {
  let flattened = {};
  Object.keys(data).forEach(key => {
    const newKey = parentKey ? `${parentKey}.${key}` : key;
    if (typeof data[key] === 'object' && !Array.isArray(data[key])) {
      Object.assign(flattened, flattenJson(data[key], newKey));
    } else {
      flattened[newKey] = data[key];
    }
  });
  return flattened;
};

const unflattenJson = (data) => {
  const result = {};
  Object.keys(data).forEach((key) => {
    const keys = key.split('.');
    keys.reduce((acc, value, index) => {
      if (index === keys.length - 1) {
        acc[value] = data[key];
      } else {
        if (!acc[value]) {
          acc[value] = {};
        }
      }
      return acc[value];
    }, result);
  });
  return result;
};

const ChatPage = () => {
  const [currProject, setcurrProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [owner, setOwner] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const [isTourOpen, setIsTourOpen] = useState(true);
  const [stack] = useState(new Stack());
  const toast = useToast();

  const { projectid } = useParams();

  const [answer, setAnswer] = useState('');
  const [questions, setQuestions] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [parHistory, setParHistory] = useState([]);
  const [formData, setFormData] = useState({});
  const [curridx, setCurrIdx] = useState(0);

  const jwttoken = localStorage.getItem("jwtToken");
  const getProject = async() => {
    try {
      const requestOptions = {
        headers: { "Content-Type": "application/json", token: jwttoken },
      };
      const res = await Axios.get(
        backend + `/api/project/${projectid}`,
        requestOptions
      );

      setcurrProject(res.data);
      // console.log(res.data.scene);
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
  }

  // const questions = [
  //   { text: 'Please enter the project name', validation: (input) => input === currProject },
  //   { text: 'Please enter a number', validation: (input) => !isNaN(input) && Number(input) > 0 },
  //   { text: 'Please enter Yes or No', validation: (input) => input === "Yes" || input === "No" },
  //   { text: 'Please enter any string', validation: (input) => input.trim().length > 0 }
  // ]

  const chatRef = useRef(null);

  const getTabColor = (index) => {
    if (index < tabIndex) {
      return 'green.200';
    } else if (index === tabIndex) {
      return 'blue.200';
    } else {
      return 'gray.200';
    }
  };

  const getGreeting = () => {
    const currentHour = new Date().getHours();

    if (currentHour < 12) {
      return 'Good morning';
    } else if (currentHour < 18) {
      return 'Good afternoon';
    } else {
      return 'Good evening';
    }
  };

  const getValidation = (type) => {
    switch (type) {
      case 'string':
        return (input) => input.trim().length > 0;
      case 'number':
        return (input) => !isNaN(input);
      case 'boolean':
        return (input) => input==='Yes' | input==='No';
      // can add other validations here
      default:
        return () => true;
    }
  };

  const fetchQuestions = async () => {
    // now fetching the default files, need to change the path later
    try {
      const flattenedJson = flattenJson(scenefile);
      setFormData(flattenedJson);
      console.log(flattenedJson)

      const response = await fetch(scenevalidator);
      const data = await response.json();
      // console.log(data)

      const ques = Object.entries(data).map(([key, value]) => {
        if (value.typeof === "object") {
          return {
            key,
            text: `How many ${value.query} are there?`,
            typeof: value.typeof,
            validation: getValidation(value.typeof),
            num: value.num
          }
        } else {
          return {
            key,
            text: `Please enter ${value.query}`,
            validation: getValidation(value.typeof),
            typeof: value.typeof,
          }
        }
      });

      // console.log(ques)
      setQuestions(ques);
      setCurrIdx(0);
      // console.log(stack.peek())
      if (ques[0].typeof !== "object") {
        stack.push(0, ques.length-1, 0, 1, []);
        // console.log(stack.peek())
      }
      setChatHistory([{ text: ques[0].text, sender: 'bot' }]);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  }

  const handleSend = () => {
    console.log(answer)
    console.log(formData)
    if (answer.trim() !== '' && curridx < questions.length) {
      const question = questions[curridx];
      setChatHistory([...chatHistory, { text: answer, sender: 'user' }]);

      if (question.validation(answer)) {
        let ci = curridx;
        let top = stack.peek();
        const currData = Array.isArray(formData) ? [...formData] : { ...formData };
        if (question.typeof === "object") {
          let key = question.key;
          let arr = [];
          let num = parseInt(answer);
          if (stack.isEmpty()) {
            stack.push(ci+1, ci+question.num, 0, num, [key]);
            for (let i=0; i<num; i++) {
              arr.push(currData[key][0]);
            }
            currData[key] = arr;
          } else {
            let parList = top.parKey;
            console.log(top.parKey)
            parList.push(key);
            stack.push(ci+1, ci+question.num, 0, num, parList);
            console.log(top.parKey)
            console.log(parList)
            // let temp = Array.isArray(currData) ? [...currData] : { ...currData };
            // top.parKey.forEach((key, index) => {
            //   console.log(key, index)
            //   temp[key] = Array.isArray(temp[key]) ? [...temp[key]] : { ...temp[key] };
            //   if (index === top.parKey.length - 1) {
            //     temp[key][top.i] = Array.isArray(temp[key][top.i]) ? [...temp[key][top.i]] : { ...temp[key][top.i] };
            //   }
            //   temp = temp[key];
            // });
            // let arr = [];
            console.log(currData['objects'])
            let temp = currData['objects'][0]['four'];
            console.log(temp)
            for (let i = 0; i < num; i++) {
              arr.push(currData['objects'][0]['four'][0]);
            }
            // let finalObj = Array.isArray(currData) ? [...currData] : { ...currData };
            // top.parKey.forEach((key, index) => {
            //   finalObj[key] = Array.isArray(finalObj[key]) ? [...finalObj[key]] : { ...finalObj[key] };
            //   if (index === top.parKey.length - 1) {
            //     finalObj[key][top.i] = arr;
            //   } else {
            //     finalObj = finalObj[key];
            //   }
            // });
            currData['objects'][0]['four'] = arr;
          }
          setFormData(currData);
          top = stack.peek();
        } else {
          if (top.parKey.length === 0) {
            setFormData({
              ...formData,
              [question.key]: answer
            });
          } else {
            let temp = currData;
            for (let i=0; i<top.parKey.length; i++) {
              temp[top.parKey[i]] = Array.isArray(temp[top.parKey[i]]) ? [...temp[top.parKey[i]]] : { ...temp[top.parKey[i]] };
              temp = temp[top.parKey[i]];
            }
            temp[top.i] = Array.isArray(temp[top.i]) ? [...temp[top.i]] : { ...temp[top.i] };
            let keys = question.key.split('.')
            if (keys.length === 1) {
              temp[top.i][question.key] = answer;
            } else {
              temp[top.i][keys[0]][keys[1]] = answer;
            }
            setFormData(currData);
          }
        }
        console.log(currData)
        if (ci === top.r) {
          top.i++;
          stack.pop();
          if (top.i === top.total) {
            ci = ci+1;
          } else {
            ci = top.l;
            stack.push(top.l, top.r, top.i, top.total, top.parKey);
          }
        } else {
          ci = ci+1;
        }
        setCurrIdx(ci);
        if (ci < questions.length) {
          setChatHistory((prevHistory) => [
            ...prevHistory,
            { text: questions[ci].text, sender: 'bot' }
          ]);
        } else {
          console.log(JSON.stringify(unflattenJson(currData), null, 2))
          setChatHistory((prevHistory) => [
            ...prevHistory,
            { text: 'Thank you for providing all the information!', sender: 'bot' },
          ]);
        }
      } else {
        setChatHistory((prevHistory) => [
          ...prevHistory,
          { 
            text: (
              <Text>
                <Text as="span" color="red.500" fontWeight="bold">
                  Invalid input!
                </Text>{' '}
                {question.text}
              </Text>
            ),
            sender: 'bot'
          },
        ]);
      }
      setAnswer('');
    }
  }

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        await getProject();
        // fetch the owner from project id
        setOwner('Amogha');
        await fetchQuestions();
        setLoading(false);
        // setChatHistory([...chatHistory, { text: 'Please enter the project name', sender: 'bot' }]);
      } catch (err) {
        console.log(err);
      }
    }

    initialize();
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const tourSteps = [
    {
      target: '.all-steps',
      content: 'This indicates the current step',
    },
    {
      target: '.chat-history',
      content: 'This area displays chat history between you and VReqST',
    },
    {
      target: '.user-input',
      content: 'Reply to each query by typing your answer here',
    },
    {
      target: '.all-steps',
      content: 'You can go back to any step to edit the answers',
    },
  ];

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
    <Flex direction="column" h="100vh" justifyContent="flex-start" alignItems="center">
      <Heading fontSize={{ base: "3xl" }} pt="2">
        <Text as={"span"}>
          {getGreeting()},{" "}
        </Text>
        <Text as={"span"} color={"blue.400"}>
          {owner}
        </Text>
      </Heading>
      <Tabs
        isFitted w="80%" mt="4"
        variant="soft-rounded"
        index={tabIndex}
        onChange={(index) => setTabIndex(index)}
        // isDisabled={isTourOpen}
      >
        <TabList className="all-steps">
          {['Scene', 'Article', 'Action-Response', 'Behaviour', 'Timeline'].map((label, index) => (
            <Tab
              key={index}
              bg={getTabColor(index)}
              _selected={{ bg: getTabColor(index) }}
              isDisabled={isTourOpen}
            >
              {label}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          <TabPanel>
            <Flex
              direction="column"
              w="100%"
              bg="gray.200"
              p="4"
              borderRadius="md"
              overflowY="auto"
              height="65vh"
              mb="4"
              ref={chatRef}
              className="chat-history"
            >
              {chatHistory.map((chat, index) => (
                <Box
                  key={index}
                  alignSelf={chat.sender === 'user' ? 'flex-end' : 'flex-start'}
                  bg={chat.sender === 'user' ? 'blue.100' : 'gray.300'}
                  color={chat.sender === 'user' ? 'black' : 'black'}
                  borderRadius="md"
                  p="2"
                  mb="2"
                  maxWidth="60%"
                >
                  <Text>{chat.text}</Text>
                </Box>
              ))}
            </Flex>
            <Flex
              w="100%"
              bg="gray.200"
              borderRadius="md"
              className="user-input"
            >
              <Input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Reply to VReqST..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                }}
                isDisabled={isTourOpen}
              />
            </Flex>
          </TabPanel>
          <TabPanel>
            <Text>Article goes here</Text>
          </TabPanel>
          <TabPanel>
            <Text>Action Response goes here</Text>
          </TabPanel>
          <TabPanel>
            <Text>Behaviour goes here</Text>
          </TabPanel>
          <TabPanel>
            <Text>Timeline goes here</Text>
          </TabPanel>
        </TabPanels>
      </Tabs>
      <GuidedTour
        steps={tourSteps}
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
      />
    </Flex>
  )
};

export default ChatPage;