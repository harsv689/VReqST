/* trial code - file not in use */

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

const validateConstruct = () => {

}

const validateTokens2 = (tokensAndLine) => {

    if(tokens.length == 0) 
        return [true,0];

    var n = tokens.length;
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
                j = evaluate(order[0], construct, tokens, i+1);
                
                if(j[0]==-1) return [false, j[1]];
                i = j[0]-1;
            }
            
            if(orderLen == 2){
               var k = evaluate(order[1], construct, tokens, j[0]);
               if(k[0]==-1) return [false, k[1]];
               i = k[0]-1;
            }            
        }
    }

    return [true, -1];
}