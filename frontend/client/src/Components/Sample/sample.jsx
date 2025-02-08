import React, { useState, useEffect } from 'react';
import Stack from './Stack';

// Helper function to flatten the JSON structure
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

// Helper function to unflatten the JSON structure
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

const QuestionForm = ({ initialJson, validatorFile }) => {
  const [formData, setFormData] = useState({});
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [error, setError] = useState("");
  const [stack] = useState(new Stack());

  // Load the JSON file, flatten it, and frame questions using the validator
  useEffect(() => {
    if (initialJson && validatorFile) {
      // Flatten the initial JSON structure
      const flattenedJson = flattenJson(initialJson);
    //   console.log(flattenedJson)
    //   console.log(flattenedJson['four'][0])
    //   let ll = flattenedJson['four'][0]
    //   let cpy = flattenedJson;
    //   cpy['four'].push(ll);
    //   console.log(cpy)
      setFormData(flattenedJson);

      // Generate questions from the validatorFile's 'query' field
      const generatedQuestions = Object.keys(flattenedJson).map(key => ({
        key,
        query: validatorFile[key]?.query || key,
        typeof: validatorFile[key]?.typeof || 'string'
      }));
    //   console.log(generatedQuestions)
      setQuestions(generatedQuestions);
    }
  }, [initialJson, validatorFile]);

  // Function to validate the answer
  const validateAnswer = (answer, type) => {
    switch (type) {
      case 'string':
        return typeof answer === 'string';
      case 'number':
        return !isNaN(answer);
      case 'boolean':
        return answer.toLowerCase() === 'true' || answer.toLowerCase() === 'false';
      default:
        return false;
    }
  };

  // Function to handle the form submission and move to the next question
  const handleSubmit = (event) => {
    event.preventDefault();
    const input = event.target.elements.questionInput.value;
    const currentType = questions[currentQuestion].typeof;

    if (questions[currentQuestion].typeof === "object") {
        let key = questions[currentQuestion].key
        let arr = []
        for (let i=0; i<input; i++) {
            arr.push(formData[key][0]);
        }
        console.log(arr)
        console.log(input)
        console.log(formData[key][0])
        console.log(typeof(formData[key][0]))
        console.log(formData[key])
        console.log(typeof(formData[key]))
        console.log(questions[currentQuestion])
        let cpy = formData;
        cpy[key] = arr;
        setFormData(formData)
    }

    // Validate the input based on the 'typeof' field
    else if (!validateAnswer(input, currentType)) {
      setError(`Invalid input! Expected a ${currentType}.`);
      return;
    }

    setError("");

    // Update the form data
    setFormData({
      ...formData,
      [questions[currentQuestion].key]: input
    });

    // Move to the next question
    setCurrentQuestion(currentQuestion + 1);
  };

  return (
    <div>
      {currentQuestion < questions.length ? (
        <form onSubmit={handleSubmit}>
          <label>
            What is {questions[currentQuestion].query}?
          </label>
          <input
            type="text"
            name="questionInput"
            required
          />
          <button type="submit">Next</button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
      ) : (
        <div>
          <h3>Thank you! Here is the filled JSON:</h3>
          <pre>{JSON.stringify(unflattenJson(formData), null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

// Usage of QuestionForm with nested JSON and the validator file
const Sample = () => {
  const initialJson = {
    "one":"",
    "two":"",
    "three": {
        "t-one": "",
        "t-two": ""
    },
    "four": [
        {
            "f-one": "",
            "f-two": ""
        }
    ]
};

  const validatorFile = {
    "one": {
      typeof: "string",
      query: "value of one"
    },
    "two": {
      typeof: "string",
      query: "value of two"
    },
    "t-one": {
      typeof: "string",
      query: "value of t-one"
    },
    "t-two": {
      typeof: "string",
      query: "value of t-two"
    },
    "four": {
        "typeof": "object",
        "query": "number of fours"
    },
    "f-one": {
        "typeof": "string",
        "query": "value of f-one"
    },
    "f-two": {
        "typeof": "string",
        "query": "value of f-two"
    }
  };

  return (
    <div>
      <h1>Dynamic JSON Validator Questionnaire</h1>
      <QuestionForm initialJson={initialJson} validatorFile={validatorFile} />
    </div>
  );
};

export default Sample;
