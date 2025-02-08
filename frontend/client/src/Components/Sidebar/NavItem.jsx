import { Flex, Icon } from "@chakra-ui/react";
import React from "react";
import { Link } from "react-router-dom";

const NavItem = (props) => {
  const { icon, children, url, ...rest } = props;
  return (
    <Flex
      as={Link}
      to={url}
      align='center'
      px='4'
      mx='2'
      rounded='md'
      py='3'
      cursor='pointer'
      color='whiteAlpha.700'
      _hover={{
        bg: "whiteAlpha.900",
        color: "blackAlpha.900",
      }}
      role='group'
      fontWeight='semibold'
      transition='.15s ease'
      {...rest}
    >
      {icon && (
        <Icon
          mr='2'
          boxSize='4'
          _groupHover={{
            color: "blackAlpha.3600",
          }}
          as={icon}
        />
      )}
      {children}
    </Flex>
  );
};

export default NavItem;
