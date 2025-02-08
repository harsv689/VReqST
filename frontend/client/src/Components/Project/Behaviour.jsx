import React from "react";
import { Text, Button } from "@chakra-ui/react";
import { useDrag } from "react-dnd";

function Behaviour({ obj, reorder }) {
	const [{ isDragging }, drag] = useDrag(() => ({
		type: "behaviour",
		item: { obj: obj },
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	}));

	return (
		<Button
			backgroundColor='blue.200'
			height={10}
			width='auto'
			disabled={reorder}
		>
			<Text
				ref={drag}
				fontSize='lg'
			>
				{obj.rulename}
			</Text>
		</Button>
	);
}

export default Behaviour;