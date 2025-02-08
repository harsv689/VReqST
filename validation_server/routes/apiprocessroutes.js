const express = require('express');
const router = express.Router()

const map_constructs = new Map();
const map_types = new Map();
var specialSymbols = []


function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

const processUploadedFile = (upData) => {

    for (var i=0; i<upData.constructs.length; ++i) {
        map_constructs.set(upData.constructs[i].type, upData.constructs[i]);
    }
        
    for (var i=0; i<upData.types.length; ++i) {
        map_types.set(upData.types[i].type, upData.types[i]);
    }

    specialSymbols = upData.specialSymbols;

    var responseJson = new Object();
    responseJson.statements = [];
    
    map_constructs.forEach((value, key) => {
        var constructResponse = new Object();
        constructResponse.title = key;
        code = "";
        code+=key;
        type = value.type;
        typeDetails = map_types.get(type);
        // console.log('value: ', value)
        // console.log('key: ', key)

        // console.log('type: ', type)
        // console.log('typeDetails: ', typeDetails)
        var cond_delimit_str;
        var cons_st;
        var cons_ed;
        var scope_end;
        var scope_start;

        
        for(var j=0; j<typeDetails.order.length; ++j){
            // console.log('typeDetails.order[j].length: ', typeDetails.order[j].length)
            for(var k=0; k<typeDetails.order[j].length; ++k){
                // console.log('typeDetails.order[j][k]:  ', typeDetails.order[j][k])
                // console.log('typeDetails.order[j][k].length: ', typeDetails.order[j][k].length);
                if(typeDetails.order[j][k]=='condition'){
                    cond_delimit_str="<cond>"
                    if(map_constructs.get(key)['conditionStart'] != 'undefined'){
                        cons_st=map_constructs.get(key)['conditionStart']
                    }
                    if(map_constructs.get(key)['conditionEnd'] != 'undefined'){
                        cons_ed=map_constructs.get(key)['conditionEnd']
                    }
                }else if(typeDetails.order[j][k] == 'scope'){
                    if(map_constructs.get(key)['scopeStart'] != undefined){
                        scope_start = map_constructs.get(key)['scopeStart'];
                    }
                    if(map_constructs.get(key)['scopeEnd'] != undefined){
                        scope_end = map_constructs.get(key)['scopeEnd'];
                    }
                }else if(typeDetails.order[j][k]=='Case'){
                    if(map_constructs.get(key)['scopeStart'] != undefined){
                        scope_start = map_constructs.get(key)['scopeStart'];
                    }
                    if(map_constructs.get(key)['scopeEnd'] != undefined){
                        scope_end = map_constructs.get(key)['scopeEnd'];
                    }
                }else if(typeDetails.order[j][k]=='Default'){
                    if(map_constructs.get(key)['scopeStart'] != undefined){
                        scope_start = map_constructs.get(key)['scopeStart'];
                    }
                    if(map_constructs.get(key)['scopeEnd'] != undefined){
                        scope_end = map_constructs.get(key)['scopeEnd'];
                    }
                }else if(typeDetails.order[j][k].length>1){
                    console.log('typeDetails.order[j][k].length: ', typeDetails.order[j][k].length);
                    for(var l=0; l<typeDetails.order[j][k].length; ++l){
                        cond_delimit_str = cond_delimit_str + map_constructs.get(key)['conditionSeparator']+ '<cond>' ;
                    }
                }
            }
        }

        code=replaceAll(code +cons_st+cond_delimit_str+cons_ed+scope_start+'<code here>'+scope_end,'undefined','');

        var obj = new Object();
        obj.title = key;
        obj.code = code;

        responseJson.statements.push(obj);

    })
    // console.log('responseJson: ', responseJson);
    return responseJson;

}

const tokenizeCode = (code) => {

    console.log(code);
    var n = code.length;
    var lineNumber = 1;
    var tokens = [];
    var tokensAndLine = [];
    currWord = "";
    for(var i=0; i<n; i++) {
        var specialChar = false;
        if(code[i] == " " || code[i] == "\n") {
            if(code[i] == "\n") lineNumber++;
            continue;
        }
        for(const j in specialSymbols){
            var c = specialSymbols[j];
            if(code[i] == c){
                tokensAndLine.push([code[i], lineNumber]);
                tokens.push(code[i]);
                specialChar = true;
                break;
            }
        }

        if(!specialChar){
            currWord+=code[i];
            if(map_constructs.has(currWord)){
                console.log("yo");
                if(i+1 == n){
                    tokensAndLine.push([currWord, lineNumber]);
                    tokens.push(currWord);
                    currWord = "";
                }else{
                    if(code[i+1] == " " || code[i+1] == "\n"){
                        tokens.push(currWord);
                        tokensAndLine.push([currWord, lineNumber]);
                        currWord = "";
                    } 
                    else{
                        for(const j in specialSymbols){
                            var c = specialSymbols[j];
                            if(code[i+1] == c){
                                tokensAndLine.push([currWord, lineNumber]);
                                tokens.push(currWord);
                                currWord = "";
                                break;
                            }
                        }
                    }
                }
            }else{
                if(i+1 < n){
                    if(code[i+1] == " " || code[i+1] == "\n") {
                        currWord = "";
                    }
                    else{
                        for(const j in specialSymbols){
                            var c = specialSymbols[j];
                            if(code[i+1] == c){
                                currWord = "";
                                break;
                            }
                        }
                    }
                }
            }
        }

    }
    // console.log(tokensAndLine);
    // return tokens;
    return tokensAndLine;
}

const tokenizeCode2 = (code) => {

    var n = code.length;
    var lineNumber = 1;
    var tokens = [];
    var tokensAndLine = [];
    var currWord = "";

    for(var i=0; i<n; i++) 
    {
        if(code[i] == " ")
        {
            if(currWord != "")
            {
                tokens.push(currWord);
                tokensAndLine.push([currWord, lineNumber]);
                currWord = "";
            }
            
            if(code[i] == '\n')
                lineNumber++;

            continue;
        }

        if(code[i] == '(' || code[i] == ')' || code[i] == ':')
        {
            if(currWord != "")
            {
                tokens.push(currWord);
                tokensAndLine.push([currWord, lineNumber]);
                currWord = "";
            }
            tokens.push(code[i]);
            tokensAndLine.push([code[i], lineNumber]);
        }
        
        else
        {
            currWord += code[i];
        }

    }

    return tokensAndLine;
}

function evaluate(order, construct, tokens, index){
    var typeToEvaluate = order[0];
    console.log(typeToEvaluate);
    if(typeToEvaluate == "condition"){
        var children = [];
        if(order.length == 2){
            children = order[1];
        }
        var condSt = construct.conditionStart;
        var condEnd = construct.conditionEnd;
        var expect = []
        expect.push(condSt);
        for(var i=0; i<children.length; i++){
            expect.push(construct[children[i]]);
        }
        expect.push(condEnd);

        var i = index;
        var j = 0;
        var cnt = 0;

        for(; (i<tokens.length && j<expect.length) ; i++, j++){
            cnt++;
            // console.log(tokens[i][0]);
            // console.log("comparing with");
            // console.log(expect[j]);
            if(tokens[i][0] != expect[j]) return [-1, tokens[i][1]];
        }

        if(cnt != expect.length) return [-1, tokens[i][1]];

        return [i, -1]; 
    }else if(typeToEvaluate == "scope"){
        
        var children = [];
        if(order.length == 2){
            children = order[1];
        }else if(order.length == 3){
            children = [...order[1], ...order[2]];
        }
        var scopeSt = construct.scopeStart;
        var scopeEnd = construct.scopeEnd;
        var st = [];
        
        if(index >= tokens.length || tokens[index][0] != scopeSt) {
            if(index-1 < tokens.length) return [-1, tokens[index-1][1]];
            return [-1, tokens[index][1]];
        }

        st.push(scopeSt);
        var childTokens = [];
        var i = index+1;

        for(; i<tokens.length; i++){
            if(tokens[i][0] == scopeEnd) st.pop();
            else if(tokens[i][0] == scopeSt) st.push([scopeSt, tokens[i][1]]);
            if(st.length == 0) break;
            if(tokens[i][0].length > 1){
                var c = 0;
                for( ; c<children.length; c++){
                    if(children[c] == tokens[i][0]) break;
                }
                if(c < children.length) childTokens.push(tokens[i]);
                else break;
            }
            else childTokens.push(tokens[i]);
        }


        if(st.length > 0) {
            if(i<tokens.length) return [-1, tokens[i][1]];
            return [-1, tokens[tokens.length-1][1]];
        }


        if(children.length > 0){
            var k = 0;
            for(var j=0; j<children.length; j++){
                var child = children[j];
                for( ; k<childTokens.length; k++){
                    if(child == childTokens[k][0]){
                        break;
                    }
                }
                if(k == childTokens.length && j<children.length) return [-1, tokens[i][1]];
            }
        }
        
        if(validateTokens(childTokens)) return [i+1, -1];
        return [-1, tokens[i][1]];

    }
}

const validateTokens2 = (tokensAndLine) => {

    if(tokensAndLine.length == 0) 
        return [true,0];

    var n = tokensAndLine.length;
    var prevToken = "";
    var expectNext = [];
    var constructs_nest = [];

    for(var i=0; i<n; i++)
    {
        var currTokenandLine = tokensAndLine[i]
        var currToken = currTokenandLine[0];
        var construct_index = 0;

        if(map_constructs.has(currToken))
        {
            var construct = map_constructs.get(currToken);
            constructs_nest.push(construct);
            construct_index++;

            var typeDetails = map_types.get(type);

            if(typeDetails.hasOwnProperty("prev") )
            {
                if(!typeDetails.prev.includes(constructs_nest[construct_index-1]))
                {
                    return [false, currTokenandLine[1]];
                }
            }

            var order = typeDetails.order;
            var orderLen = order.length;
            var j = [];

            if(orderLen >= 1){
                j = evaluate(order[0], construct, tokensAndLine, i+1);
                
                if(j[0]==-1) return [false, j[1]];
                i = j[0]-1;
            }
            
            if(orderLen == 2){
               var k = evaluate(order[1], construct, tokensAndLine, j[0]);
               if(k[0]==-1) return [false, k[1]];
               i = k[0]-1;
            }            
        }
    }

    return [true, -1];
}

const validateTokens = (tokens) => {

    if(tokens.length == 0) 
        return [true,0];

    var n = tokens.length;
    prevToken = "";
    expectNext = [];
    for(var i=0; i<n; i++){
        var currTokenandLine = tokens[i]
        var currToken = currTokenandLine[0];
        if(expectNext.length != 0){
            var idx=0;
            for( ;idx<expectNext.length; idx++){
                var tkn;
                if(expectNext[idx] == "Do-While"){
                    tkn = "While";
                }
                
                if(currToken == tkn){
                    currToken = expectNext[idx];
                    break;
                }
            }
            if(idx == expectNext.length) return [false, currTokenandLine[1]];
        }

        if(map_constructs.has(currToken)){
            console.log(currToken);
            var construct = map_constructs.get(currToken);
            var type = construct.type;
            var typeDetails = map_types.get(type);
           
            if(typeDetails.hasOwnProperty("prev")){
                prevTokensList = typeDetails.prev;
                var prevPresent = false;
                for(const p in prevTokensList){
                    var pt = prevTokensList[p];
                    if(prevToken == pt || pt == "none"){
                        prevPresent = true;
                        break;
                    }
                }
                if(!prevPresent) return [false, currTokenandLine[1]];
            }
            
            var order = typeDetails.order;
            var orderLen = order.length;
            var j = [];

            if(orderLen >= 1){
                // to evaluate condition
                j = evaluate(order[0], construct, tokens, i+1);
                console.log(j[0]);
                if(j[0]==-1) return [false, j[1]];
                i = j[0]-1;
            }

            // console.log(tokens[j[0]]);
            // if(tokens[j[0]][0] == construct.)
            
            if(orderLen == 2){
                // to evaluate scope
               var k = evaluate(order[1], construct, tokens, j[0]);
               console.log(k[0]);
               if(k[0]==-1) return [false, k[1]];
               i = k[0]-1;
            }

            prevToken = currToken;
            if(typeDetails.hasOwnProperty("next")){
                expectNext = typeDetails["next"];
            }else expectNext = [];

            if(i == n-1 && expectNext.length != 0) return [false, currTokenandLine[1]];

            
        }else{
            return [false, currTokenandLine[1]];
        }
    }

    return [true, -1];
}

//upload conditional construct
//request body contains json data
router.post('/upload', (req, res, next) => {

    console.log("hi uploading from here");
    var stri = JSON.stringify(req.body);
    var upData2 = JSON.parse(stri);
    var upData_string = upData2.jsonData;
    var upData = JSON.parse(upData_string);

    var responseJson = processUploadedFile(upData);
    // console.log(responseJson);
    res.status(200).json(responseJson);
})

//validate file
router.post('/process', (req, res, next) => {
    console.log("hi processing from here");
    // console.log(req.body);
    /* parsing and lexeme logic processing */
    // var trial = tokenizeCode2(req.body.code);
    // console.log(trial);
    var tokens = tokenizeCode(req.body.code);
    console.log(tokens);

    var [valid, lineNumber] = validateTokens(tokens);

    res.status(200).json({
        "valid": valid,
        "lineNumber": lineNumber
    })
})

router.post('/upload-custom-rule', (req, res, next) => {
    console.log(req.body);
    res.status(200).json({
        "body": "hi"
    })
})

module.exports = router
