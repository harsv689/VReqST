import React from "react";
import { Box, Text, Flex } from "@chakra-ui/react";
import NavItem from "./NavItem";
import { BsFiles } from "react-icons/bs";
import { FaProjectDiagram, FaRegUser, FaSignInAlt } from "react-icons/fa";
import { MdHelp, MdHome } from "react-icons/md";
import { VscFiles } from "react-icons/vsc";
import { connect } from "react-redux";
import { logoutUser } from "../../redux/actions/authActions";

const SidebarContent = (props) => (
  <Box
    as="nav"
    pos="fixed"
    top="0"
    left="0"
    zIndex="sticky"
    h="full"
    pb="10"
    overflowX="hidden"
    overflowY="auto"
    bg="#1C1C1C"
    borderColor="black"
    borderRightWidth="1px"
    w="60"
    {...props}
  >
    <Flex px="4" py="5" align="center">
      <Text fontSize="2xl" ml="2" color="white" fontWeight="semibold">
        VReqST
      </Text>
    </Flex>
    <Flex
      direction="column"
      as="nav"
      fontSize="md"
      color="white"
      aria-label="Main Navigation"
    >
      {props.auth.isAuthenticated ? (
        <>
          <NavItem icon={MdHome} to="/dashboard" color="white">
            Home
          </NavItem>
          <NavItem icon={FaProjectDiagram} to="/projects" color="white">
            Projects
          </NavItem>
          <NavItem icon={BsFiles} to="/myfiles" color="white">
            My Validators
          </NavItem>
          <NavItem icon={VscFiles} to="/allfiles" color="white">
            All Validators
          </NavItem>
        </>
      ) : (
        <>
          <NavItem icon={FaSignInAlt} to="/login" color="white">
            Login
          </NavItem>
          <NavItem icon={FaRegUser} to="/register" color="white">
            Register
          </NavItem>
        </>
      )}
      <NavItem icon={MdHelp} to="/help" color="white">
        Documentation
      </NavItem>
    </Flex>
  </Box>
);

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, { logoutUser })(SidebarContent);
