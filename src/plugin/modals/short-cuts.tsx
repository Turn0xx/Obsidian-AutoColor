import * as React from "react";
import { ExtentedApp } from "../main";
import { ObsidianColorManager } from "../core/color-managing/color-manager.obsidian";
import { Color } from "../core/color.value-object";

type ShortCutsComponentProps = {
	handleKeyDown: (event: KeyboardEvent) => void;
	colors: Color[];
};

const ShortCutsComponent = ({
	handleKeyDown,
	colors,
}: ShortCutsComponentProps) => {
	document.addEventListener("keydown", handleKeyDown);

	return (
		<div>
			<div
				style={{
					display: "flex",
					justifyContent: "space-around",
					marginLeft: "20px",
					marginRight: "20px",
				}}
			>
				{colors.map((c, index) => (
					<div
						key={index}
						style={{
							textAlign: "center",
						}}
					>
						<div>{index + 1}</div>
						<div
							style={{
								backgroundColor: c.unpack(),
								borderRadius: "50%",
								width: "60px",
								height: "60px",
								margin: "auto",
							}}
						/>
					</div>
				))}
			</div>
		</div>
	);
};

export default ShortCutsComponent;
