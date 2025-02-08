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

const scenefile = require("../default/scene.txt")
// const assetfile = require("../default/asset.txt")
// const actionfile = require("../default/action.txt")
// const timelinefile = require("../default/timeline.txt")

const ChatPage = () => {
  const [currProject, setcurrProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [owner, setOwner] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const [isTourOpen, setIsTourOpen] = useState(true);
  const toast = useToast();

  const { projectid } = useParams();

  const [answer, setAnswer] = useState('');
  const [questions, setQuestions] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [curridx, setCurrIdx] = useState(0);

  const [RemRepeats, setRemRepeats] = useState(0);
  const [isRecurring, setIsRecurring] = useState(false);
  const [totalQuestions, setTotalQuestion] = useState(0);
  const [coveredTillNow, setCoveredTillNow] = useState(0);

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
      const response = await fetch(scenefile);
      const data = await response.json();
      let ques = [];

      Object.entries(data).forEach(([key, value]) => {
        if (value.typeof !== 'object') {
          ques.push({
            text: `Please enter ${value.query}`,
            validation: getValidation(value.typeof),
          });
        } else {
          ques.push({
            text: `How many ${value.query} are there?`,
            validation: (input) => !isNaN(input) && Number(input) > 0,
            isObject: true,
            numQuestions: parseInt(value.num),
          });
        }
      })

      setQuestions(ques);
      setCurrIdx(0);
      setChatHistory([{ text: ques[0].text, sender: 'bot' }]);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  }

  const handleSend = () => {
    console.log(answer)
    if (answer.trim() !== '' && curridx < questions.length) {
      const question = questions[curridx];
      setChatHistory([...chatHistory, { text: answer, sender: 'user' }]);

      if (question.validation(answer)) {
        if (question.isObject) {
          const repeatCount = parseInt(answer, 10);
          setRemRepeats(repeatCount);
          setIsRecurring(true);
          setTotalQuestion(question.numQuestions);
          console.log(question.numQuestions)
          setCoveredTillNow(0);
        }

        let ci = curridx;
        if (isRecurring) {
          let ctn = coveredTillNow+1;
          setCoveredTillNow(coveredTillNow+1);
          if (ctn === totalQuestions) {
            let rr = RemRepeats-1;
            setRemRepeats(RemRepeats-1);
            if (rr !== 0) {
              ci = ci - totalQuestions;
              setCoveredTillNow(0);
            } else {
              setIsRecurring(false);
              setTotalQuestion(0);
              setCoveredTillNow(0);
            }
          }
        }

        ci = ci+1;
        setCurrIdx(ci);
        if (ci < questions.length) {
          setChatHistory((prevHistory) => [
            ...prevHistory,
            { text: questions[ci].text, sender: 'bot' }
          ]);
        } else {
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