import {
  Box,
  Button,
  // Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  Input,
  List,
  ListIcon,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  // Select,
  Spinner,
  Stack,
  Tag,
  Text,
  // Tooltip,
  useDisclosure,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  // Textarea,
  // VStack
} from "@chakra-ui/react";
import Axios from "axios";
import React, { useEffect, useState } from "react";
import AceEditor from "react-ace";
import { FaExclamationCircle } from "react-icons/fa";
import { BiDownload } from "react-icons/bi";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { useParams } from "react-router-dom";
import { useDrop } from 'react-dnd';
import { validation_server, backend } from "../../server_urls";

import isJson from "../../utils/checkjson";
import e from "cors";
import semantics from "../../utils/syntax.json";
import Behaviour from "./Behaviour";
import { Link } from "react-router-dom";

let errors = [];
let rules = [];
let valid_rule = [];
let grammarDataArray = [];
let flag = false;
let fl = false;

const tipcolors = {
  number: "orange",
  object: "green",
  boolean: "red",
  string: "yellow",
  array: "blue",
};

const jsonValidator = (grammar, validating) => {
  const keys = Object.keys(grammar);
  const keys22 = Object.keys(validating);

  const grammarArray = Object.keys(grammar).filter(
    (value) => !Object.keys(validating).includes(value)
  );

  const extraEntries = Object.keys(validating).filter(
    (value) => !Object.keys(grammar).includes(value)
  );

  extraEntries.map((en) => {
    let app = 1;

    for (let i = 0; i < keys.length; i++) {
      if (keys[i] === en || grammar[keys[i]].root === en || grammar[keys[i]].proot === en) 
        app = 0;
    }
    if (app) {
      errors.push(`"${en}" is invalid key in the JSON`);
    }
  });

  grammarArray.map((en) => {
    let app = 1;
    for (let i = 0; i < keys22.length; i++) {
      if (en === keys22[i] || grammar[en].root === keys22[i] || grammar[en].proot === keys22[i]) {
        app = 0;
      }
    }
    if (app === 1) {
      errors.push(
        `"${en}" is a mandatory field! Please add the field with ${grammar[en].typeof} type`
      );
    }
  })

  for (let i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (grammar[key].hasOwnProperty('proot')) {
      let a = validating[grammar[key].proot];
      for (let i = 0; i < a.length; i++) {
        let c = a[i];
        if (c.hasOwnProperty(grammar[key].root)) {
          if (typeof c[grammar[key].root][key] === grammar[key].typeof) {
          }
          else {
            if (typeof c[grammar[key].root][key] === "undefined") {
              errors.push(
                `"${key}" is a mandatory field! Please add the field with ${grammar[key].typeof} type`
              );
            }
            else {
              errors.push(
                ` "${key}" has an invalid type of '${typeof c[grammar[key].root][key]}'. Expected type of ${grammar[key].typeof}`
              );
            }
          }
        }
      }
    }
    else if (grammar[key].hasOwnProperty('repeat') && grammar[key].repeat === "allow") {
      let a = grammar[key].root;
      var obje = Object.keys(validating);
      // let found = obje.indexOf(a);

      if (typeof validating[a] === "object") {
        for (let i = 0; i < validating[a].length; i++) {
          if (typeof validating[a][i][key] === grammar[key].typeof || (typeof validating[a][i][key] === "object" && grammar[key].typeof === "array")) {
          }
          else {
            if (typeof validating[a][i][key] === "undefined") {
              errors.push(
                `"${key}" is a mandatory field! Please add the field with ${grammar[key].typeof} type`
              );
            }
            else {
              errors.push(
                ` "${key}" has an invalid type of '${typeof validating[a][i][
                key
                ]}'. Expected type of ${grammar[key].typeof}`
              );
            }
          }
        }
      }
    }
    else {
      if (grammar[key].root === 'null' || grammar[key].root === 'undefined' || (!grammar[key].hasOwnProperty('root'))) {
        if (typeof validating[key] === "undefined") {
          continue;
        }

        // Handling nested objects recursively
        if (
          typeof validating[key] === "object" &&
          grammar[key].typeof === "object"
        ) {
          continue;
        }

        if (typeof validating[key] !== grammar[key].typeof) {
          errors.push(
            ` "${key}" has an invalid type of '${typeof validating[
            key
            ]}'. Expected type of ${grammar[key].typeof}`
          );
        }
        else {
          // alert("sucess");
        }

        if (
          typeof validating[key] === "string" &&
          typeof validating[key] === grammar[key].typeof &&
          grammar[key].req === "mandatory" &&
          validating[key].length === 0
        ) {
          errors.push(`"${key}" is mandatory, empty string is not allowed`);
        }
      }
      else {
        let a = grammar[key].root;
        if (false) {
          for (let i = 0; i < validating[a].length; i++) {
            if (typeof validating[a][i].key === grammar[key].typeof) {
              alert("Sucess");
            }
            else {
              //alert("Failure");
              //errors.push("kindly see the json syntax");
              errors.push(`"${key}" has invalid type, expected "${grammar[key].typeof}"`);
            }
          }
        }
        else {
          var b = validating[a];
          //alert(a);
          let c = Object.keys(b);
          let found = c.indexOf(key)
          if (typeof validating[a][c[found]] === grammar[key].typeof || (typeof validating[a][c[found]] === "object" && grammar[key].typeof === "array")) {
            //alert("Sucess!!!!!!");
          }
          else {
            if (typeof validating[a][c[found]] === "undefined") {
              errors.push(
                `"${key}" is a mandatory field! Please add the field with ${grammar[key].typeof} type`
              );

            }
            else {
              errors.push(
                ` "${key}" has an invalid type of '${typeof validating[a][c[found]]
                }'. Expected type of ${grammar[key].typeof}`
              );
            }
          }
        }
      }
    }
  }

  if (errors.length > 0) {
    console.log(errors);
    return true;
  }
  return false;
};

const ProjectPageContent = ({
  stepslen,
  nextStep,
  prevStep,
  reset,
  activeStep,
  scene,
  action,
  asset,
  projectname,
  timeline,
  custom,
}) => {
  const toast = useToast();
  const { projectid } = useParams();
  const jwttoken = localStorage.getItem("jwtToken");

  let [val, setValue] = React.useState("");
  const [files, setfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [data, setdata] = useState("");
  const [grammarid, setGrammarid] = useState("");
  const [validated, setValidated] = useState(false);
  const [grammarbundle, setGrammarbundle] = useState({});
  const [displayErrors, setDisplayErrors] = useState([]);
  const [rule_list, setRuleList] = useState([]);
  const [names, setNames] = useState([]);
  const [arr, setArr] = useState([]);
  const [idx, setIdx] = useState(0);

  const [downloadable, setDownloadable] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [description, setDescription] = useState("");
  const [perdata, setPerdata] = useState("");
  const [seed, setSeed] = useState(0);
  const [rulename, setRulename] = useState("");
  const [textPointer, setTextPointer] = useState({"row": 0, "column": 0});

  const [position, setPosition] = useState(0);
  const [savebutton, setSavebutton] = useState(false);
  const [rule, setRule] = useState({});
  const [logic, setLogic] = useState("");
  const [board, setBoard] = useState([]);
  const [reorder, setReorder] = useState(false);

	const [{ isOver, canDrop }, drop] = useDrop(() => ({
		accept: "behaviour",
		drop: (item) => setBoard((board) => !board.includes(item.obj) ? [...board, item.obj] : board),
		collect: (monitor) => ({
			isOver: monitor.isOver(),
			canDrop: monitor.canDrop(),
		})
	}));

	const handleReorder = (dragIndex, hoverIndex) => {
		const dragged = board[dragIndex];
		const newBoard = [...board];
		newBoard.splice(dragIndex, 1);
		newBoard.splice(hoverIndex, 0, dragged);
		setBoard(newBoard);
	}

  const convertPointer = (pointer, lines) => {
    let pos = 0;
    for(let i=0; i<=pointer.row - 1; i++) {
      pos += lines[i].length;
      if(lines[i].length === 0)
        pos+=1;
    }
    pos += pointer.column;
    if(pointer.column === 0)
      pos+=1;
    setPosition(pos);
  }

  const getFiles = async () => {
    try {
      const requestOptions = {
        headers: { "Content-Type": "application/json", token: jwttoken },
      };
      const res = await Axios.get(
        // `http://localhost:5002/api/json/timeline`,
        backend + "/api/json/timeline",
        requestOptions
      );

      const requestOption = {
        headers: { "Content-Type": "application/json", token: jwttoken },
      };
      const res2 = await Axios.get(
        // `http://localhost:5002/api/project/${projectid}/grammarName`,
        backend + `/api/project/${projectid}/grammarName`,
        requestOption
      );
      setfiles(res.data);

      res.data.map((p) => {
        if (p.name === res2.data.grammarName) {
          if (grammarDataArray.length !== 5) {
            grammarDataArray.push(p.scene);
            grammarDataArray.push(p.asset);
            grammarDataArray.push(p.action);
            grammarDataArray.push(p.custom);
            grammarDataArray.push(p.timeline);
          }
        }
      })
    } catch (error) {
      toast({
        title: "Something went wrong",  //Goes wrong
        status: "error",
        duration: 10000,
        isClosable: true,
        position: "top",
      });
      console.log(error);
    }
  };

  const getRules = async () => {
    const res_rules = await Axios.post(
      // "http://localhost:5002/api/custom/get-custom-rules",
      backend + "/api/custom/get-custom-rules",
      {
        headers: {
          "Content-Type": "application/json", 
          token: jwttoken 
        },
        data: {
          project_id: projectid
        }
      }
    );
    setRuleList(res_rules.data);
  }

  useEffect(() => {
    setLoading(true);
    getFiles();
    getRules();
    if (activeStep === 0) {
      setdata(scene);
      fl = false;
      if (isJson(scene)) {
        setDownloadable(true);
      }
    }
    if (activeStep === 1) {
      if (asset === '') {
        setNames([]);
        setArr([]);
        setdata('');
      } else {
        const myobjs = JSON.parse(asset);
        let all_names = []
        let tarr = myobjs.articles
        myobjs.articles.map((c,i)=>{
          all_names.push(c._objectname);
        })
        setNames(all_names);
        setArr(tarr);
        setdata(JSON.stringify(tarr[idx], null, '\t'));
      }
      // setdata(asset);
      fl = false;
      if (isJson(asset)) {
        setDownloadable(true);
      }
    }
    if (activeStep === 2) {
      if (action === '') {
        setNames([]);
        setArr([]);
        setdata('');
      } else {
        let myobjs = JSON.parse(action);
        let all_names = []
        let tarr = myobjs.ObjAction
        myobjs.ObjAction.map((c,i)=>{
          all_names.push(c.actresid);
        })
        setNames(all_names);
        setArr(tarr);
        setdata(JSON.stringify(tarr[idx], null, '\t'));
      }
      // setdata(action)
      fl = false;
      if (isJson(action)) {
        setDownloadable(true);
      }
    }
    if (activeStep === 3) {
      // setdata(custom);
      fl = false
      if (isJson(custom)) {
        setDownloadable(true);
      }
    }
    if (activeStep === 4) {
      setdata(timeline);
      fl = false;
      if (isJson(timeline)) {
        setDownloadable(true);
      }
    }
    setLoading(false);
  }, []);
  
  const downloadTxtFile = () => {
    if (data === "" || !isJson(data)) {
      toast({
        title: "JSON Syntax is not correct",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      setDownloadable(false);
      return;
    }
    let fileName = "";
    if (activeStep === 0) fileName = "scene";
    if (activeStep === 1) fileName = "asset";
    if (activeStep === 2) fileName = "action";
    if (activeStep === 3) fileName = "custom";
    if (activeStep === 4) fileName = "timeline";
    const json = data;
    const blob = new Blob([json], { type: "application/json" });
    const href = URL.createObjectURL(blob);

    const downlink = document.createElement("a");
    downlink.href = href;
    downlink.download = projectname + "-" + fileName + ".json";
    document.body.appendChild(downlink);
    downlink.click();

    // clean up "a" element & remove ObjectURL
    document.body.removeChild(downlink);
    URL.revokeObjectURL(href);
  };

  let handleInputChange = (e) => {
    let inputValue = e.target.value;
    setValue(inputValue);
  };

  let asset_valid = (asset, asset_list, flag) => {
    // if flag is zero, dont print any errors
    let valid_obj = false;

    asset_list.map(((d,j)=>{
      if(asset === d)
        valid_obj = true;
      // if(c.targetObj == d)
      //   valid_target = true;
    }))

    if(valid_obj === false) {
      setValidated(false);
      setDownloadable(false);
      if (flag) {
        toast({
          title:
            "Object "+ asset +" is not listed in Asset JSON. Only assets present in Asset JSON are valid."+asset+"  "+asset_list,
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
      }
      return -1;
    }
    return 1;
  }

  let assetValidator = (a, all_object_ids) => {
    a.map((c,i)=>{
      let ret1 = asset_valid(c.sourceObj, all_object_ids, 1);
      let ret2;
      if (c.targetObj[c.targetObj.length - 1] === '*') {
        ret2 = 1;
      } else
        ret2 = asset_valid(c.targetObj, all_object_ids, 1);

      if(ret1 === -1) {
        return false;
      }

      if (c.repeatactionfor !== null && c.repeatactionfor.length !== 0 && c.repeatactionfor[0] !== " ") {
        let repeat_assets = [];
        let curr_word = "";
        Array.from(c.repeatactionfor).map((char, key)=>{
          if (char === ',' || char === ' ') {
            if(curr_word !== "" && curr_word !== " " && curr_word.length !== 0) {
              repeat_assets.push(curr_word);
              curr_word = "";
            }
          } else
            curr_word = curr_word + char;
        })
        if(curr_word !== "" || curr_word !== " " || curr_word.length !== 0)
          repeat_assets.push(curr_word);
        
        repeat_assets.map((word, key)=>{
          let ret = asset_valid(word, all_object_ids, 1);
          if ( ret === -1) {
            return false;
          }
        })

        if (ret2 === -1 && c.targetObj[c.targetObj.length - 1] !== "*") {
          toast({
            title:
              "Please update the Target Object according to the reccomendations in the document.",
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: "top-right",
          });
          return false;
        } else {
          if(asset_valid(c.targetObj, repeat_assets, 0) === 1) {
            toast({
              title:
                "Target object should not be a part of repeatactionfor.",
              status: "warning",
              duration: 5000,
              isClosable: true,
              position: "top-right",
            });
            return false;
          }
        }
      }
    })
    return true;
  }

  let onValidate2 = async () => {
    toast({
      title: "Validation successful",
      status: "success",
      duration: 5000,
      isClosable: true,
      position: "top-right",
    });

    valid_rule.push({
      rulename: rulename,
      data_name: data,
      description: description
    });

    setDownloadable(true);
    setSavebutton(true);
  };

  const onValidate = async () => {
    let tarr = arr;
    tarr[idx] = JSON.parse(data);
    setArr(tarr);
    
    let tnames = names;
    if (activeStep === 1)
      tnames[idx] = tarr[idx]._objectname;
    else if (activeStep === 2)
      tnames[idx] = tarr[idx].actresid;
    setNames(tnames);

    let tdata = data;
    if (activeStep === 1)
      tdata = JSON.stringify({articles: arr}, null, 4)
    else if (activeStep === 2)
      tdata = JSON.stringify({ObjAction: arr}, null, 4)

    if (!isJson(tdata)) {
      setValidated(false);
      setDownloadable(false);
      toast({
        title: "JSON Syntax is not correct",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }
    setDisplayErrors([]);
    errors = [];
    var myjson = JSON.parse(tdata);
    
    try {
      var mygrm = "";
      if (activeStep === 0) mygrm = JSON.parse(grammarDataArray[0]);
      else if (activeStep === 1) mygrm = JSON.parse(grammarDataArray[1]);
      else if (activeStep === 2) mygrm = JSON.parse(grammarDataArray[2]);
      else if (activeStep === 3) mygrm = JSON.parse(grammarDataArray[3]);
      else if (activeStep === 4) mygrm = JSON.parse(grammarDataArray[4]);
      // console.log(typeof errors);

    } catch (e) {
      console.log(e);
    }

    try {
      if (activeStep === 2) {
        try {
          {
            let all_object_ids = [];
            const myobjs = JSON.parse(asset);

            myobjs.articles.map((c,i)=>{
              all_object_ids.push(c._sid);
            })

            var a = myjson.ObjAction;
            for (let i = 0; i < a.length; i++) {
              var c = a[i].actresid;
              flag = true;
              if (c) {
                rules.push(c);
              }
            }
          }
        } catch (e) {
          console.log(e);
          setValidated(false);
          setDownloadable(false);
          toast({
            title:
              "There are errors in the specification. Please review the error message",
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: "top-right",
          });
          return;
        }
      } else if (activeStep === 1) {
        try {
          {
            var a = myjson.articles;
            for (let i = 0; i < a.length; i++) {
              var c = a[i]._objectname;
              flag = true;
              if (c) {
                rules.push(c);
              }
            }
          }
        } catch (e) {
          console.log(e);
          setValidated(false);
          setDownloadable(false);
          toast({
            title:
              "There are errors in the specification. Please review the error message",
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: "top-right",
          });
          return;
        }
      } 
    } catch {
      console.log(e);
    }
    if (grammarDataArray.length === 0) {
      await getFiles();
    }


    try {
      let mygrm = "";
      if (activeStep === 0) mygrm = JSON.parse(grammarDataArray[0]);
      else if (activeStep === 1) mygrm = JSON.parse(grammarDataArray[1]);
      else if (activeStep === 2) mygrm = JSON.parse(grammarDataArray[2]);
      else if (activeStep === 3) mygrm = JSON.parse(grammarDataArray[3]);
      else if (activeStep === 4) mygrm = JSON.parse(grammarDataArray[4]);


      if (!jsonValidator(mygrm, myjson)) {
        if(activeStep === 2)
        {
          let all_object_ids = [];
          const myobjs = JSON.parse(asset);

          myobjs.articles.map((c,i)=>{
            all_object_ids.push(c._sid);
          })

          const ret_asset = assetValidator(myjson.ObjAction, all_object_ids);
          if(!ret_asset)
          {
            console.log(errors);
            toast({
              title: "There are errors in the specification. Please review the error message",
              status: "warning",
              duration: 5000,
              isClosable: true,
              position: "top-right",
            });
            return;
          }
          else{
            setValidated(true);
            setDownloadable(true);
            toast({
              title: "Validation Successful",
              status: "success",
              duration: 5000,
              isClosable: true,
              position: "top-right",
            });
          }
        }
        else{
          setValidated(true);
          setDownloadable(true);
          toast({
            title: "Validation Successful",
            status: "success",
            duration: 5000,
            isClosable: true,
            position: "top-right",
          });
        }
      } else {
        console.log(errors);
        toast({
          title: "There are errors in the specification. Please review the error message",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
      }
      setDisplayErrors(errors);
    }
    catch (e) {
      console.log(e);
      toast({
        title: "There are errors in the specification. Please review the error message",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const showValidateHandler = async () => {
    let code = data;
    let jsonData = JSON.stringify({
      types: [
        {
          type: "if",
          order: [["condition"], ["scope"]],
        },

        {
          type: "else",
          prev: ["if", "else-if"],
          order: [["scope"]],
        },

        {
          type: "else-if",
          prev: ["if", "else-if"],
          order: [["condition"], ["scope"]],
        },

        {
          type: "switch",
          order: [["condition"], ["scope", ["Case"], ["Default"]]],
        },

        {
          type: "switch-case",
          order: [["condition"], ["scope"]],
        },

        {
          type: "switch-case-default",
          order: [["scope"]],
        },

        {
          type: "for",
          order: [
            ["condition", ["conditionSeparator", "conditionSeparator"]],
            ["scope"],
          ],
        },

        {
          type: "while",
          order: [["condition"], ["scope"]],
        },

        {
          type: "do",
          order: [["scope"]],
          next: ["do-while"],
        },

        {
          type: "do-while",
          order: [["condition"]],
          prev: ["do"],
        },
      ],
      constructs: [
        {
          name: "if",
          type: "if",
          conditionStart: "(",
          conditionEnd: ")",
          scopeStart: "(",
          scopeEnd: ")",
        },

        {
          name: "else-if",
          type: "else-if",
          conditionStart: "(",
          conditionEnd: ")",
          scopeStart: "(",
          scopeEnd: ")",
          pre: ["if", "else-if"],
        },

        {
          name: "else",
          type: "else",
          scopeStart: "(",
          scopeEnd: ")",
          pre: ["if", "else-if"],
        },

        {
          name: "switch",
          type: "switch",
          conditionStart: "(",
          conditionEnd: ")",
          body: "Case",
          scopeStart: "(",
          scopeEnd: ")",
          "end-body": "default",
        },

        {
          name: "Case",
          type: "switch-case",
          conditionStart: "(",
          conditionEnd: ")",
          scopeStart: "(",
          scopeEnd: ")",
          parent: "switch",
        },

        {
          name: "Default",
          type: "switch-case-default",
          scopeStart: "(",
          scopeEnd: ")",
          parent: "switch",
        },

        {
          name: "for",
          type: "for",
          conditionStart: "(",
          conditionEnd: ")",
          conditionSeparator: "/",
          scopeStart: "(",
          scopeEnd: ")",
        },

        {
          name: "while",
          type: "while",
          conditionStart: "(",
          conditionEnd: ")",
          scopeStart: "(",
          scopeEnd: ")",
        },

        {
          name: "do",
          type: "do",
          scopeStart: "(",
          scopeEnd: ")",
          next: "do-while",
        },

        {
          name: "do-while",
          type: "do-while",
          conditionStart: "(",
          conditionEnd: ")",
        },
      ],
      specialSymbols: ["#", ":", "!", "/", "(", ")"],
    });

    // fetch(`http://localhost:5001/api/upload`, {
    fetch(validation_server + '/api/upload', {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify({jsonData}),
    }).then((response) => {
      response.json().then((val) => {
        console.log("Uploaded");
        console.log(val);
      })
      .catch((err)=>{
        console.log(err);
      });
    })
    .catch((err)=>{
      console.log(err);
    });

    // fetch(`http://localhost:5001/api/process`, {
    fetch(validation_server + '/api/process', {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify({code}),
    }).then((response) => {
      response.json().then((val) => {
        if (val.valid) {
          onValidate2();
        } else {
          setValidated(false);
          setDownloadable(false);
          toast({
            title: "Error! Please follow conditional syntax.",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "top-right",
          });
          return;
        }
      })
      .catch((err)=>{
        console.log(err);
      });
    })
    .catch((err)=>{
      console.log(err);
    });
  };

  const handleValidateButton = () => {
    showValidateHandler(true);
    setValidated(true);
  };

  const saveButton = async () => {
    try{
      const res = await Axios.post(
        // "http://localhost:5002/api/custom/upload-custom-rule", {
        backend + "/api/custom/upload-custom-rule", {
          headers: {
            "Content-Type": "application/json", 
            token: jwttoken 
          },
          data: {
            project_id: projectid,
            rulename: rulename,
            data_name: btoa(data),
            description: description
          }
        }
      );
      toast({
        title: "Behaviour Added",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });

      setRuleList([...rule_list, {
        project_id: projectid,
        rulename: rulename,
        data_name: btoa(data),
        description: description
      }]);

      setdata('');
      setRulename('');
      setDescription('');
      setValidated(false);
    } catch(err){
      console.log(err);
    }
  }

  const flushWrite = () => {
    console.log('flushed everything!');
    setValidated(false);
    setdata('');
    setRulename('');
    setDescription('');
  }

  const onNextStep = async () => {
    let tdata = data;
    if (activeStep === 1)
      tdata = JSON.stringify({articles: arr}, null, 4)
    else if (activeStep === 2)
      tdata = JSON.stringify({ObjAction: arr}, null, 4)

    if (!isJson(data) && activeStep !== 3) {
      setValidated(false);
      toast({
        title: "JSON Syntax is not correct",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    setSubmitting(true);
    let url = backend;
    if (activeStep === 0)
      url = url + `/api/project/${projectid}/scene`;
    else if (activeStep === 1)
      url = url + `/api/project/${projectid}/asset`;
    else if (activeStep === 2)
      url = url + `/api/project/${projectid}/action`;
    else if (activeStep === 3)
      url = url + `/api/project/${projectid}/custom`;
    else if (activeStep === 4)
      url = url + `/api/project/${projectid}/timeline`;
    try {
      const requestOptions = {
        headers: { "Content-Type": "application/json", token: jwttoken },
      };
      const res = await Axios.patch(url, { data:tdata }, requestOptions);

      toast({
        title: res.data.message,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    } catch (error) {
      toast({
        title: "Something wents wrong",
        status: "error",
        duration: 10000,
        isClosable: true,
        position: "top",
      });
      console.log(error);
    }
    setSubmitting(false);
    nextStep();
  };

  const handel_name = (e) => {
    setRulename(e.target.value);
  };

  const handel_description = (e) => {
    setDescription(e.target.value);
  };

  const AddNewObj = () => {
    setIdx(arr.length)
    let tnames = names;
    tnames.push('');
    setNames(tnames);
    let tarr = arr;
    tarr.push('');
    setArr(tarr);
    setdata('');
  };

  const onFinish = async () => {
    if (!isJson(data)) {
      setValidated(false);
      toast({
        title: "JSON Syntax is not correct",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    setSubmitting(true);
    let url = backend;
    if (activeStep === 0)
      url = url + `/api/project/${projectid}/scene`;
    else if (activeStep === 1)
      url = url + `/api/project/${projectid}/asset`;
    else if (activeStep === 2)
      url = url + `/api/project/${projectid}/action`;
    else if (activeStep === 3)
      url = url + `/api/project/${projectid}/custom`;
    else if (activeStep === 4)
      url = url + `/api/project/${projectid}/timeline`;
    try {
      const requestOptions = {
        headers: { "Content-Type": "application/json", token: jwttoken },
      };
      const res = await Axios.patch(url, { data }, requestOptions);

      toast({
        title: res.data.message,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
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
    setSubmitting(false);
    onOpen();
  };

  const saveCustom = () => {
    let str = '';
    board.map((p) => {
      if (str.length > 0) {
        str +=
        `,{"rulename":"${p.rulename
        }", "description":"${p.description
        }","logic": "${btoa(
          p.data_name
        )}"}\n`
      } else {
        str +=
        `{"rulename":"${p.rulename
        }", "description":"${p.description
        }","logic": "${btoa(
          p.data_name
        )}"}\n`
      }
    });

    if (!fl) {
      for (let i = 0; i < rules.length; i++) {
        rules[i] = `"` + rules[i] + `"`;
      }
      fl = true;
    }
    setdata(
      `{"objects_used":[${rules}],"rules":[${str}]}`
    );
    toast({
      title:
        "JSON is saved, click Next to continue",
      status: "success",
      duration: 5000,
      isClosable: true,
      position: "top-right",
    });
    setReorder(false);
    setDownloadable(true);
    setBoard([]);
    console.log(`{"objects_used":[${rules}],"rules":[${str}]}`);
  }

  return loading ? (
    <>
      <Flex
        width={"80vw"}
        height={"90vh"}
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
    <>
      {activeStep !== 3 ? (
        <Grid templateColumns="repeat(6, 1fr)" gap={4}>
          <GridItem rowSpan={3} colSpan={1}>
            <Flex flexDir={"column"} pr={20} pt={120}>
            </Flex>
          </GridItem>
          <GridItem rowSpan={3} colSpan={3}>
            <Flex py={4} alignItems={"center"} flexDir="column">
              <Flex marginTop={20} marginBottom={10}>
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
                  onChange={(newvalue, event) => {
                    setdata(newvalue);
                    setDownloadable(false);
                  }}
                  value={data}
                  name="grammar-editor"
                  wrapEnabled
                  height="40em"
                  width={"40em"}
                />
                <Stack marginLeft={10} py={4} direction="column">
                  {names.map((name, id) => (
                    <>
                      <Button
                        colorScheme="blue"
                        onClick={ () => {setIdx(id);
                          if (name === '')
                            setdata('')
                          else
                            setdata(JSON.stringify(arr[id], null, '\t'))} }
                      >{name}</Button>
                    </>
                  ))}
                </Stack>
              </Flex>
              <Stack py={4} direction="row">
                <Button
                  colorScheme="yellow"
                  disabled={!data}
                  onClick={onValidate}
                >
                  Validate
                </Button>
                <Button
                  colorScheme="green"
                  disabled={!downloadable}
                  onClick={downloadTxtFile}
                  leftIcon={<BiDownload />}
                >
                  Download File
                </Button>
                {activeStep === 1 | activeStep === 2 ? (
                  <Button
                    colorScheme="yellow"
                    disabled={!data}
                    onClick={AddNewObj}
                  >
                    New
                  </Button>
                ): (<></>)}
              </Stack>

              {activeStep === stepslen ? (
                <Flex px={4} py={4} width="100%" flexDirection="column">
                  <Heading fontSize="xl" textAlign="center">
                    Woohoo! All steps completed!
                  </Heading>
                  <Button mx="auto" mt={6} size="sm" onClick={reset}>
                    Reset
                  </Button>
                </Flex>
              ) : (
                <Flex width="100%" justify="flex-end">
                  <Button
                    isDisabled={activeStep === 0}
                    mr={4}
                    onClick={prevStep}
                    size="sm"
                    variant={"outline"}
                  >
                    Prev
                  </Button>
                  {activeStep === stepslen - 1 ? (
                    <Button
                      size="sm"
                      onClick={onFinish}
                      disabled={!validated}
                      isLoading={submitting}
                      colorScheme="green"
                      variant={"outline"}
                    >
                      Finish
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={onNextStep}
                      disabled={!validated}
                      isLoading={submitting}
                      colorScheme="yellow"
                      variant={"outline"}
                    >
                      Next
                    </Button>
                  )}
                </Flex>
              )}
            </Flex>
          </GridItem>
          {/* for errors */}
          <GridItem rowSpan={3} colSpan={2} pt={120}>
            <Flex flexDir={"column"} pl={20}>
              {displayErrors.length > 0 ? (
                <List spacing={2}>
                  {displayErrors.map((e, i) => {
                    let str = "";
                    const splitarr = e.match(/(?:[^\s"]+|"[^"]*")+/g);
                    let Val;
                    if (splitarr.length === 12) {
                      splitarr.map(
                        (m, i) => i !== 0 && i !== 10 && (str = str + " " + m)
                      );
                      Val = () => (
                        <>
                          <Text as="span">
                            <Text
                              as="span"
                              fontWeight={"bold"}
                              color={tipcolors[splitarr[10]]}
                            >
                              {splitarr[0]}
                            </Text>
                            <Text as="span">{str}</Text>
                            <Text
                              as="span"
                              fontWeight={"bold"}
                              color={tipcolors[splitarr[10]]}
                            >
                              {" " + splitarr[10]}
                            </Text>
                          </Text>
                        </>
                      );
                    }
                    if (splitarr.length === 7 || splitarr.length === 8) {
                      splitarr.map((m, i) => i !== 0 && (str = str + " " + m));
                      Val = () => (
                        <>
                          <Text as="span">
                            <Text
                              as="span"
                              fontWeight={"bold"}
                              color={"teal.400"}
                            >
                              {splitarr[0]}
                            </Text>
                            <Text as="span">{str}</Text>
                          </Text>
                        </>
                      );
                    }
                    if (splitarr.length === 11) {
                      splitarr.map(
                        (m, i) => i !== 0 && i !== 10 && (str = str + " " + m)
                      );
                      Val = () => (
                        <>
                          <Text as="span">
                            <Text
                              as="span"
                              fontWeight={"bold"}
                              color={tipcolors[splitarr[10]]}
                            >
                              {splitarr[0]}
                            </Text>
                            <Text as="span">{str}</Text>
                            <Text
                              as="span"
                              fontWeight={"bold"}
                              color={tipcolors[splitarr[10]]}
                            >
                              {" " + splitarr[10]}
                            </Text>
                          </Text>
                        </>
                      );
                    }
                    return (
                      <ListItem key={i}>
                        <ListIcon as={FaExclamationCircle} color="red.500" />
                        {<Val />}
                      </ListItem>
                    );
                  })}
                </List>
              ) : (
                <></>
              )}
            </Flex>
          </GridItem>
          <Modal onClose={onClose} isOpen={isOpen} isCentered>
            <ModalOverlay />
            <ModalContent>
              <ModalCloseButton />
              <ModalBody>
                <Box textAlign="center" py={10} px={6}>
                  <CheckCircleIcon boxSize={"50px"} color={"green.500"} />
                  <Heading as="h2" size="xl" mt={6} mb={2}>
                    Your specification are successful saved!
                  </Heading>
                  <Text color={"gray.500"}>
                    We have made sure that your data is free from any data-types
                    or syntax errors. Happy Development!
                  </Text>
                </Box>
              </ModalBody>
              <ModalFooter>
                <Button>
                  <Flex as={Link} to="/projects">Close</Flex>
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Grid>
      ) : (
        <>
          <Tabs isFitted variant="unstyled" marginTop={10}>
            <TabList mb="1em">
              <Tab _selected={{ color: 'white', bg: 'blue.300' }}>Author Custom Behaviour</Tab>
              <Tab _selected={{ color: 'white', bg: 'blue.300' }}>View Authored Custom Behaviours</Tab>
              <Tab _selected={{ color: 'white', bg: 'blue.300' }}>Publish</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <div>
                  <Grid templateColumns="repeat(8, 1fr)" gap={2}>
                    <GridItem rowSpan={8} colStart={1} colEnd={8}>
                      <Flex py={4} alignItems={"center"} flexDir="column">
                        <Text fontSize='xl'>Author your custom behaviours below.</Text>
                        <Flex flexDir="row" marginTop={10}>
                          <Text fontSize='lg'>Behaviour Name:</Text>
                          <Flex>
                            <FormControl
                              paddingRight={10}
                              paddingLeft={2}
                            >
                              <Input
                                value={rulename}
                                onChange={handel_name}
                                placeholder="Name"
                                size="sm"
                              ></Input>
                            </FormControl>
                          </Flex>
                          <Text fontSize='lg'>Behaviour Description:</Text>
                          <Flex>
                            <FormControl
                              paddingLeft={2}
                            >
                              <Input
                                value={description}
                                onChange={handel_description}
                                placeholder="Description"
                                size="sm"
                              ></Input>
                            </FormControl>
                          </Flex>
                        </Flex>
                        <Flex flexDir="row" paddingTop={10} paddingLeft={35} marginLeft={20}>
                          <Box
                            as="pane"
                            bg="grey"
                            _dark={{
                              bg: "gray.800",
                            }}
                            h="32em"
                            w="12em"
                          >
                            <Box 
                              as="pane"
                              zIndex="fixed"
                              h="300px"
                              overflowX="hidden"
                              overflowY="auto"
                              w="400px"
                              colorScheme="yellow"
                            >
                              <Flex px="4" pb="3" pt="5" align="center">
                                  <Text
                                    fontSize="2xl"
                                    ml="2"
                                    color="white"
                                    fontWeight="semibold"
                                  >
                                    Code Constructs
                                  </Text>
                              </Flex>
                              <Flex
                                direction="column"
                                as="nav"
                                fontSize="lg"
                                color="white"
                                aria-label="Main Navigation"
                                margin={5}
                                marginTop={2}
                                marginLeft={7}
                              >
                                { semantics.elements.map((p) => (
                                    <a
                                      onClick={() => {
                                        console.log(position);
                                        var newdata_part1 = data.slice(0,position);
                                        var newdata_part2 = data.slice(position);
                                        setdata(newdata_part1 + p.editorDisplay + newdata_part2);
                                      }}
                                      color="white"
                                    >
                                      <span>{p.displayName}</span>
                                    </a>
                                  ))
                                }
                              </Flex>
                            </Box>
                          </Box>
                          <Flex marginLeft={10} marginRight={10} marginBottom={10}>
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
                              onChange={(newvalue, event) => {
                                fl = false;
                                setdata(newvalue);
                                setDownloadable(false);
                              }}
                              onCursorChange={(newplace)=>{
                                convertPointer({"row":newplace.cursor.row, "column": newplace.cursor.column}, newplace.cursor.document.$lines);
                              }}
                              onSelectionChange={(e)=>{
                                convertPointer({"row": e.cursor.row, "column": e.cursor.column}, e.doc.$lines);
                              }}
                              value={data}
                              name="grammar-editor"
                              wrapEnabled
                              height={"40em"}
                              width={"40em"}
                              id="editor"
                            />
                          </Flex>
                          <Box
                            as="pane"
                            bg="grey"
                            _dark={{
                              bg: "gray.800",
                            }}
                            h="32em"
                            w="18em"
                          >
                            <Box // navbar
                              as="pane"
                              zIndex="fixed"
                              h="300px"
                              pb="10"
                              overflowX="hidden"
                              overflowY="auto"
                              bg="grey"
                              w="400px"
                            >
                              <Flex px="4" pb="3" pt="5" align="center">
                                  <Text
                                    fontSize="2xl"
                                    ml="2"
                                    color="white"
                                    fontWeight="semibold"
                                  >
                                    Action-Responses
                                  </Text>
                              </Flex>
                              <Flex
                                direction="column"
                                as="nav"
                                fontSize="lg"
                                color="white"
                                aria-label="Main Navigation"
                                margin={5}
                                marginTop={2}
                                marginLeft={7}
                              >
                                {flag ? (
                                  rules.map((p) => (
                                    <a
                                      onClick={() => {
                                        var newdata_part1 = data.slice(0,position);
                                        var newdata_part2 = data.slice(position);
                                        setdata(newdata_part1 + p + newdata_part2);
                                      }}
                                      color="white"
                                    >
                                      {p}
                                    </a>
                                  ))
                                ) : (
                                  <>
                                    <Text>No recent files...</Text>
                                  </>
                                )}
                              </Flex>
                            </Box>
                          </Box>
                        </Flex>
                        <Stack py={4} direction="row">
                          <Button
                            colorScheme="yellow"
                            disabled={!(data && rulename && description)}
                            onClick={() => {
                              handleValidateButton();
                              setSeed(Math.random());
                            }}
                          >
                            Validate
                          </Button>
                          <Button
                            colorScheme="green"
                            disabled={!validated}
                            onClick={() => {
                              saveButton();
                            }}
                          >
                            Save
                          </Button>
                          <Button
                            colorScheme="red"
                            disabled={!(data || rulename || description)}
                            onClick={() => {
                              flushWrite();
                            }}
                          >
                            Flush
                          </Button>
                        </Stack>
                        {activeStep === stepslen ? (
                          <Flex
                            px={4}
                            py={4}
                            width="100%"
                            flexDirection="column"
                          >
                            <Heading fontSize="xl" textAlign="center">
                              Woohoo! All steps completed!
                            </Heading>
                            <Button mx="auto" mt={6} size="sm" onClick={reset}>
                              Reset
                            </Button>
                          </Flex>
                        ) : (
                          <Flex width="100%" justify="flex-end">
                            <Button
                              isDisabled={activeStep === 0}
                              mr={4}
                              onClick={prevStep}
                              size="sm"
                              variant={"outline"}
                            >
                              Prev
                            </Button>
                          </Flex>
                        )}
                      </Flex>
                    </GridItem>
                    {/* for errors */}
                    <GridItem rowSpan={3} colSpan={2} pt={120}>
                      <Flex flexDir={"column"} pl={20}>
                        {displayErrors.length > 0 ? (
                          <List spacing={2}>
                            {displayErrors.map((e, i) => {
                              let str = "";
                              const splitarr = e.match(/(?:[^\s"]+|"[^"]*")+/g);
                              let Val;
                              if (splitarr.length === 12) {
                                splitarr.map(
                                  (m, i) =>
                                    i !== 0 && i !== 10 && (str = str + " " + m)
                                );
                                Val = () => (
                                  <>
                                    <Text as="span">
                                      <Text
                                        as="span"
                                        fontWeight={"bold"}
                                        color={tipcolors[splitarr[10]]}
                                      >
                                        {splitarr[0]}
                                      </Text>
                                      <Text as="span">{str}</Text>
                                      <Text
                                        as="span"
                                        fontWeight={"bold"}
                                        color={tipcolors[splitarr[10]]}
                                      >
                                        {" " + splitarr[10]}
                                      </Text>
                                    </Text>
                                  </>
                                );
                              }

                              if (
                                splitarr.length === 7 ||
                                splitarr.length === 8
                              ) {
                                splitarr.map(
                                  (m, i) => i !== 0 && (str = str + " " + m)
                                );
                                Val = () => (
                                  <>
                                    <Text as="span">
                                      <Text
                                        as="span"
                                        fontWeight={"bold"}
                                        color={"teal.400"}
                                      >
                                        {splitarr[0]}
                                      </Text>
                                      <Text as="span">{str}</Text>
                                    </Text>
                                  </>
                                );
                              }

                              if (splitarr.length === 11) {
                                splitarr.map(
                                  (m, i) =>
                                    i !== 0 && i !== 10 && (str = str + " " + m)
                                );
                                Val = () => (
                                  <>
                                    <Text as="span">
                                      <Text
                                        as="span"
                                        fontWeight={"bold"}
                                        color={tipcolors[splitarr[10]]}
                                      >
                                        {splitarr[0]}
                                      </Text>
                                      <Text as="span">{str}</Text>
                                      <Text
                                        as="span"
                                        fontWeight={"bold"}
                                        color={tipcolors[splitarr[10]]}
                                      >
                                        {" " + splitarr[10]}
                                      </Text>
                                    </Text>
                                  </>
                                );
                              }

                              return (
                                <ListItem key={i}>
                                  <ListIcon
                                    as={FaExclamationCircle}
                                    color="red.500"
                                  />
                                  {<Val />}
                                </ListItem>
                              );
                            })}
                          </List>
                        ) : (
                          <></>
                        )}
                      </Flex>
                    </GridItem>
                  </Grid>
                </div>
              </TabPanel>
              <TabPanel> 
                <div>
                  <Grid templateColumns="repeat(6, 1fr)" gap={2}>
                    <GridItem rowSpan={8} colStart={1} colEnd={8}>
                      <Flex py={4} alignItems={"center"} flexDir="column">
                        <Text fontSize='xl'>Choose a custom behaviour to view the behaviour logic.</Text>
                        <Flex flexDir="row" paddingTop={10} paddingLeft={35} marginLeft={20}>
                          <Stack direction="column" marginRight={10}>
                            <Flex>
                              <Text fontSize='lg'>Behaviour Name: {rule.rulename}</Text>
                            </Flex>
                            <Flex paddingTop={2}>
                              <Text fontSize='lg'>Behaviour Description: {rule.description}</Text>
                            </Flex>
                            <Flex paddingTop={2}>
                              <Text fontSize='lg'>Behaviour Logic:</Text>
                            </Flex>
                            <Flex paddingLeft={12}>
                              <AceEditor
                                fontSize={20}
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
                                value={(rule.data_name != null ? atob(rule.data_name) : rule.data_name)}
                                // value={logic}
                                name="grammar-editor"
                                wrapEnabled
                                height={"28em"}
                                width={"32em"}
                                readOnly={true}
                              />
                            </Flex>
                          </Stack>
                          <Box
                            as="pane"
                            bg="grey"
                            _dark={{
                              bg: "gray.800",
                            }}
                            h="36em"
                            w="18em"
                          >
                            <Box // navbar
                              as="pane"
                              zIndex="fixed"
                              h="300px"
                              pb="10"
                              overflowX="hidden"
                              overflowY="auto"
                              bg="grey"
                              w="400px"
                            >
                              <Flex px="4" pb="3" pt="5" align="center">
                                <Text
                                  fontSize="2xl"
                                  ml="2"
                                  color="white"
                                  fontWeight="semibold"
                                >
                                  Custom Behaviours
                                </Text>
                              </Flex>
                              <Flex
                                direction="column"
                                as="nav"
                                fontSize="md"
                                color="white"
                                aria-label="Main Navigation"
                                margin={5}
                              >
                                {rule_list.length > 0 ? (
                                  rule_list.map((p) => (
                                    <Text fontSize='xl'>
                                      <a
                                        onClick={() => {
                                          setRule(p);
                                          setLogic(p.data_name);
                                        }}
                                        color="white"
                                      >
                                        {p.rulename}
                                      </a>
                                    </Text>
                                  ))
                                ) : (
                                  <>
                                    <Text>No recent files!</Text>
                                  </>
                                )}
                              </Flex>
                            </Box>
                          </Box>
                        </Flex>
                        <Flex marginTop={10}>
                          <Button
                            colorScheme="red"
                            disabled={!rule.rulename}
                            onClick={() => {
                              setRule({});
                              setLogic("");
                            }}
                          >
                            Flush
                          </Button>
                        </Flex>
                      </Flex>
                    </GridItem>
                  </Grid>
                </div>
              </TabPanel>
              <TabPanel>
                <div>
                  <Grid templateColumns="repeat(6, 1fr)" gap={2}>
                    <GridItem rowSpan={8} colStart={1} colEnd={8}>
                      <Flex py={4} alignItems={"center"} flexDir={"column"}>
                        <Text fontSize='xl'>Select and Publish final custom behaviours.</Text>
                        <Text>Drag and drop custom behaviours from the behaviour section. Organise them
                          in an order. On saving, the underlying specification will be published.
                        </Text>
                        <Flex flexDir="row" paddingTop={10} paddingLeft={35} marginLeft={20}>
                          {/* 1. space to hold items: pending */}
                          <Flex paddingTop={10} marginRight={20}>
                            {/* <DropArea /> */}
                            {board.length > 0 ? (
                              <Box
                                ref={drop}
                                width={600}
                                height={700}
                                border='1px solid'
                                position='relative'
                                maxHeight={700}
                                overflowY='auto'
                                justifyContent='center'
                              >
                                <Stack
                                  py={4}
                                  direction="column"
                                  paddingLeft={5}
                                  paddingRight={5}
                                >
                                  {board.map((p, index) => (
                                    <Button
                                      backgroundColor='blue.200'
                                      height={10}
                                      width='auto'
                                      draggable
                                      onDragStart={(e) => {
                                        if (reorder) {
                                      	  e.dataTransfer.setData('text/plain', index);
                                        }
                                      }}
                                      onDragOver={(e) => {
                                      	e.preventDefault();
                                      }}
                                      onDrop={(e) => {
                                        if (reorder) {
                                          const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
                                          console.log(dragIndex);
                                          const hoverIndex = index;
                                          if (dragIndex != hoverIndex) {
                                            handleReorder(dragIndex, hoverIndex);
                                          }
                                        }
                                      }}
                                    >
                                      <Text fontSize='xl'>{p.rulename}</Text>
                                    </Button>
                                  ))}
                                </Stack>
                              </Box>
                            ) : (
                              <Box
                                ref={drop}
                                width={600}
                                height={700}
                                border='1px solid'
                                position='relative'
                                justifyContent='center'
                                alignItems='center'
                              >
                                <Text
                                  textAlign="center"
                                >Drop Here</Text>
                              </Box>
                            )}
                          </Flex>
                          {/* 2. behaviours to select: done */}
                          <Stack
                            py={4}
                            direction="column"
                            maxHeight={800}
                            overflowY='auto'
                          >
                            <Flex align="center">
                              <Text fontSize="2xl">Custom Behaviours</Text>
                            </Flex>
                            {rule_list.length > 0 ? (
                              rule_list.map((p) => {
                                return <Behaviour obj={p} reorder={reorder}/>
                              })
                            ) : (
                              <>
                                <Text fontSize='xl'>No recent files!</Text>
                              </>
                            )}
                          </Stack>
                        </Flex>
                        <Stack py={4} direction="row" marginTop={10}>
                          <Button
                            colorScheme="yellow"
                            onClick={() => {setReorder(true)}}
                            disabled={board.length === 0}
                            isLoading={submitting}
                          >
                            Reorder
                          </Button>
                          <Button
                            onClick={saveCustom}
                            disabled={!reorder}
                            isLoading={submitting}
                            colorScheme="green"
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => {setBoard([]); setReorder(false)}}
                            disabled={board.length === 0}
                            isLoading={submitting}
                            colorScheme="red"
                          >
                            Flush
                          </Button>
                          <Button
                            colorScheme="green"
                            disabled={!downloadable}
                            onClick={downloadTxtFile}
                            leftIcon={<BiDownload />}
                          >
                            Download File
                          </Button>
                        </Stack>
                        <Flex width="70%" justify="flex-end">
                          <Button
                            size="sm"
                            onClick={onNextStep}
                            disabled={board.length}
                            isLoading={submitting}
                            colorScheme="yellow"
                            variant={"outline"}
                          >
                            Next
                          </Button>
                        </Flex>
                      </Flex>
                    </GridItem>
                  </Grid>
                </div>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </>
      )}
    </>
  );
};

const CustomCard = React.forwardRef(({ children, ...rest }, ref) => (
  <Box p="1">
    <Tag ref={ref} {...rest}>
      {children}
    </Tag>
  </Box>
));

export default ProjectPageContent;
