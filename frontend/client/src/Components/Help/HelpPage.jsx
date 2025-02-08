import { Grid } from "@chakra-ui/react";
import React from "react";

import HelpItem from "./HelpItem";

const HelpPage = () => {
  return (
    <Grid
      bgColor={"gray.200"}
      minH="85vh"
      templateColumns="repeat(2, 1fr)"
      gap={4}
    >
      <HelpItem
        number={1}
        title="Login"
        subtitle="Enter your email and super secret password to authenticate yourself."
      />
      <HelpItem
        number={2}
        title="Add Model Template File"
        subtitle="In My Files tab in the left sidebar, press the button Add Files, you will be redirected to the page where you can input the template and make sure you give your file a unique name."
      />
      <HelpItem
        number={3}
        title="Create a project"
        subtitle="Create a project, you can validate three types of model template files in each project. Scene File, Asset File, as well as Action File."
      />
      <HelpItem
        number={4}
        title="Choose a Project"
        subtitle="Click on any project, you will be redirect to the project page where you need to follow three steps (Not necessarily in sequence). You need to select the template file from the options given."
      />
      <HelpItem
        number={5}
        title="Validate Model Template"
        subtitle="Upon selecting a template file, its keys as well as its types are shown on the left panel of the page. Create a model template file, you data as well as it's will be validated against the template and errors will be shown on the right panel of the page."
      />
      <HelpItem
        number={6}
        title="Complete"
        subtitle="Complete all the 5 steps to complete the project. Tadaa, you have just got all your model template files validated."
      />
      <HelpItem
        number={7}
        title="For More Help Visit"
        subtitle = "https://saianirudh-karri.gitbook.io/vreqst"
      />
      <HelpItem
        number={8}
        title="Happy Development"
        subtitle= " We hope you have a great time using those files in your development ahead 😀"
      />
    </Grid>
  );
};

export default HelpPage;
