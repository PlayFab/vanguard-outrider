import React from "react";
import { Link } from "react-router-dom";
import styled from "../styles";
import { is } from "../shared/is";

interface IProps {
	to?: string;
	label: string;
	onClick?: () => void;
}

const PBackLink = styled.p`
	margin: 0 0 ${s => s.theme.size.spacer} 0;
`;

const LinkBackLink = styled(Link)`
	&,
	&:visited {
		color: ${s => s.theme.color.link500};
		cursor: pointer;
	}
`;

export const BackLink: React.FunctionComponent<IProps> = React.memo(props => {
	if (!is.null(props.onClick)) {
		const localOnClick = (e: React.SyntheticEvent): void => {
			e.preventDefault();
			props.onClick();
		};

		return (
			<PBackLink>
				<LinkBackLink onClick={localOnClick} to={props.to || "/"}>
					<strong>&laquo; {props.label}</strong>
				</LinkBackLink>
			</PBackLink>
		);
	}

	return (
		<PBackLink>
			<LinkBackLink to={props.to}>
				<strong>&laquo; {props.label}</strong>
			</LinkBackLink>
		</PBackLink>
	);
});
