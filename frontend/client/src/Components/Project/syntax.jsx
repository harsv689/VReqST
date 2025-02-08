let jsonData = JSON.stringify({
    types: [
      {
        type: "if",
        order: [["condition"], ["scope"]],
      },

      {
        type: "else",
        prev: ["If", "EIf"],
        order: [["scope"]],
      },

      {
        type: "else-if",
        prev: ["If", "EIf"],
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
        next: ["Do-While"],
      },

      {
        type: "do-while",
        order: [["condition"]],
        prev: ["Do"],
      },
    ],
    constructs: [
      {
        name: "If",
        type: "if",
        conditionStart: "#",
        conditionEnd: "#",
        scopeStart: ":",
        scopeEnd: "!",
      },

      {
        name: "EIf",
        type: "else-if",
        conditionStart: "#",
        conditionEnd: "#",
        scopeStart: ":",
        scopeEnd: "!",
        pre: ["If", "EIf"],
      },

      {
        name: "E",
        type: "else",
        scopeStart: ":",
        scopeEnd: "!",
        pre: ["If", "EIf"],
      },

      {
        name: "Switch",
        type: "switch",
        conditionStart: "#",
        conditionEnd: "#",
        body: "Case",
        scopeStart: ":",
        scopeEnd: "!",
        "end-body": "default",
      },

      {
        name: "Case",
        type: "switch-case",
        conditionStart: "#",
        conditionEnd: "#",
        scopeStart: ":",
        scopeEnd: "!",
        parent: "Switch",
      },

      {
        name: "Default",
        type: "switch-case-default",
        scopeStart: ":",
        scopeEnd: "!",
        parent: "Switch",
      },

      {
        name: "For",
        type: "for",
        conditionStart: "#",
        conditionEnd: "#",
        conditionSeparator: "/",
        scopeStart: ":",
        scopeEnd: "!",
      },

      {
        name: "While",
        type: "while",
        conditionStart: "#",
        conditionEnd: "#",
        scopeStart: ":",
        scopeEnd: "!",
      },

      {
        name: "Do",
        type: "do",
        scopeStart: ":",
        scopeEnd: "!",
        next: "Do-While",
      },

      {
        name: "Do-While",
        type: "do-while",
        conditionStart: "#",
        conditionEnd: "#",
      },
    ],
    specialSymbols: ["#", ":", "!", "/"],
  });