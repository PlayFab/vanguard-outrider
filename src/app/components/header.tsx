import React from "react";

import styled from "../styles";
import logo from "../../static/logo-wide.png";
import { is } from "../shared/is";

const logoWidth = "256px";
const logoHeight = "48px";

const HeaderTag = styled.header`
	padding: 0 ${s => s.theme.size.spacer};

	@media ${s => s.theme.breakpoint.large} {
		max-width: ${s => s.theme.breakpointUnits.large};
	}
`;

const DivHeaderWrapper = styled.div`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
`;

const DivLogo = styled.div`
	padding: ${s => s.theme.size.spacer} 0;
	flex-basis: 100%;
	display: flex;
	justify-content: center;

	@media ${s => s.theme.breakpoint.medium} {
		justify-content: flex-start;
	}
`;

const DivTitle = styled.div`
	flex-grow: 1;
`;

const H1Title = styled.h1`
	font-size: ${s => s.theme.fontSize.h1};
	font-weight: lighter;
	margin: 0;
	text-align: center;

	@media ${s => s.theme.breakpoint.medium} {
		text-align: left;
	}
`;

const ImgLogo = styled.img`
	width: ${logoWidth};
	height: ${logoHeight};
`;

interface IProps {
	title?: string;
}

export const Header: React.FunctionComponent<IProps> = props => {
	const { title } = props;

	return (
		<HeaderTag>
			<DivHeaderWrapper>
				<DivLogo>
					<ImgLogo src={logo} alt="Vanguard Outrider" />
				</DivLogo>
				{!is.null(title) && (
					<DivTitle>
						<H1Title>{title}</H1Title>
					</DivTitle>
				)}
			</DivHeaderWrapper>
		</HeaderTag>
	);
};
