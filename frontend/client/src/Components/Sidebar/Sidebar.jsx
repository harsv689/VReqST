import React, { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Center,
  Container,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Flex,
  IconButton,
  Image,
  InputGroup,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { FaInstagram, FaLinkedin, FaTwitter, FaYoutube } from "react-icons/fa";
import { FaSignOutAlt, FaUser } from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import SidebarContent from "./SidebarContent";
import { logoutUser } from "../../redux/actions/authActions";
import SocialButton from "./SocialButton";

const Sidebar = ({ children, auth, logoutUser }) => {
  const [year, setYear] = useState('')
  const sidebar = useDisclosure();

  useEffect(() => {
    const currentYear = new Date().getFullYear()
    setYear(currentYear)
  }, []);

  return (
    <Box
      as="section"
      bg="whitesmoke"
      _dark={{
        bg: "gray.800",
      }}
      minH="100vh"
    >
      <SidebarContent
        display={{
          base: "none",
          md: "unset",
        }}
      />
      <Drawer
        isOpen={sidebar.isOpen}
        onClose={sidebar.onClose}
        placement="left"
      >
        <DrawerOverlay />
        <DrawerContent>
          <SidebarContent w="full" borderRight="none" />
        </DrawerContent>
      </Drawer>
      <Box
        ml={{
          base: 0,
          md: 60,
        }}
        transition=".3s ease"
      >
        <Flex
          as="header"
          align="center"
          justify="space-between"
          w="full"
          px="4"
          bg="white"
          _dark={{
            bg: "gray.800",
          }}
          borderBottomWidth="1px"
          borderColor="whitesmoke"
          h="14"
        >
          <IconButton
            aria-label="Menu"
            display={{
              base: "inline-flex",
              md: "none",
            }}
            onClick={sidebar.onOpen}
            icon={<FiMenu />}
            size="sm"
          />
          <InputGroup
            w="96"
            display={{
              base: "none",
              md: "flex",
            }}
          ></InputGroup>
          {auth.isAuthenticated && (
            <Flex align="center">
              <Menu>
                <MenuButton>
                  <Avatar
                    ml="4"
                    size="sm"
                    name={auth.user.name}
                    cursor="pointer"
                  />
                </MenuButton>
                <MenuList>
                  <Link to="/profile">
                    <MenuItem icon={<FaUser />}>Profile</MenuItem>
                  </Link>
                  <MenuItem icon={<FaSignOutAlt />} onClick={logoutUser}>
                    Logout
                  </MenuItem>
                </MenuList>
              </Menu>
            </Flex>
          )}
        </Flex>

        <Box as="main">{children}</Box>
      </Box>
      <Box
        bg={useColorModeValue("gray.50", "gray.900")}
        color={useColorModeValue("gray.700", "gray.200")}
      >
        {/* <Container
          as={Stack}
          maxW={"6xl"}
          py={4}
          spacing={4}
          justify={"center"}
          align={"center"}
        >
          <Image
            src='/assets/iiithlogo.png'
            bgColor={"gray.300"}
            maxW='20%'
            borderRadius={"10px"}
          />
        </Container> */}

        <Box
          bgColor={"grey.300"}
          borderTopWidth={1}
          borderStyle={"solid"}
          borderColor={useColorModeValue("whitesmoke", "gray.700")}
        >
          <Container
            as={Stack}
            maxW={"6xl"}
            py={4}
            direction={{ base: "column", md: "row" }}
            spacing={4}
            justify={{ base: "center", md: "space-between" }}
            align={{ base: "center", md: "center" }}
          >
            <center>
              <Flex pl={{ base: "90px", md: "180px" }}>
                ©{year} Software Engineering Research Center, IIIT Hyderabad. All rights reserved
              </Flex>
            </center>
            <Stack direction={"row"} spacing={6} justify="flex-end">
              <SocialButton
                label={"Twitter"}
                href={"https://twitter.com/serc_iiith"}
              >
                <FaTwitter />
              </SocialButton>
              <SocialButton
                label={"YouTube"}
                href={
                  "https://www.youtube.com/watch?v=051kkAC6eqs"
                }
              >
                <FaYoutube />
              </SocialButton>
              <SocialButton
                label={"Linkedin"}
                href={"https://www.linkedin.com/company/serciiith"}
              >
                <FaLinkedin />
              </SocialButton>
            </Stack>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};
const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, { logoutUser })(Sidebar);
