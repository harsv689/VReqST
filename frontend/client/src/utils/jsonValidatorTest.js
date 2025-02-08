const jsonValidator = (grammar, validating) => {

  const keys = Object.keys(grammar);


  const grammarArray = Object.keys(grammar).filter(
    (value) => !Object.keys(validating).includes(value)
  );

  const extraEntries = Object.keys(validating).filter(
    (value) => !Object.keys(grammar).includes(value)
  );

  extraEntries.map((en) => {

    errors.push(`"${en}" is invalid key in the JSON`);
  });

  grammarArray.map((en) => {
    if (grammar[en].req === "mandatory" && grammar[en].root === "null") {
      errors.push(
        `"${en}" is a mandatory field! Please add the field with ${grammar[en].typeof} type`
      );
    }
  });

  //const keys = Object.keys(grammar);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    // If optional key is not present
    // we check the root

    
      if('repeat' in grammar[key] && grammar[key].repeat=="allow")
      {
        var a=grammar[key].root;
        var obje=Object.keys(validating);
        var found=obje.indexOf(a);
        //alert(a);
        
        if(typeof validating[a]==="object")
        {
          for(let i=0; i<validating[a].length; i++)
          {
            //alert(validating[a][i][key])
            if(typeof validating[a][i][key]===grammar[key].typeof ||(typeof validating[a][i][key]==="object"&&grammar[key].typeof==="array"))
            {
              alert("Sucess");
            }
            else
            {
              alert("FAILURE");
              errors.push(
                ` "${key}" has an invalid type of '${typeof validating[
                key
                ]}'. Expected type of ${grammar[key].typeof}`
              );

              //errors.push(`JSON SYNTAX NOT CORRECT`);
            }
          }
        
        }
        
      }
      else
      {
    
    if ('root' in grammar[key] && grammar[key].root === "null" ) {
      if (typeof validating[key] === "undefined") {
        continue;
      }

      // Handling nested objects recursively
      if (
        typeof validating[key] === "object" &&
        grammar[key].typeof === "object"
      ) {
        jsonValidator(grammar[key], validating[key]);
        continue;
      }

      if (typeof validating[key] !== grammar[key].typeof) {
        errors.push(
          ` "${key}" has an invalid type of '${typeof validating[
          key
          ]}'. Expected type of ${grammar[key].typeof}`
        );
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
      if(true){
      var a = grammar[key].root;
      var b = validating[a];
      var c = Object.keys(b);
      var found = c.indexOf(key)
      if (typeof validating[a][c[found]] === grammar[key].typeof|| (typeof validating[a][c[found]]==="object"&&grammar[key].typeof==="array")) {
        alert("Sucess!!!!!!");
      }
      else {
        errors.push(` "${key}" Check the json syntax, its not correct`);
      }
    }
  }
  }
  }

  if (errors.length > 0) return true;

  return false;
};
