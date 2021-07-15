import React from "react";

import styled from "../styles";
import logo from "../../../static/img/logo.png";
import { is } from "../shared/is";

const logoWidth = "256px";
const logoHeight = "101px";

const DivHeaderWrapper = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
`;

const DivLogo = styled.div`
    padding: ${s => s.theme.size.spacer};
    flex-basis: ${logoWidth};
`;

const DivTitle = styled.div`
    flex-grow: 1;

    @media ${s => s.theme.breakpoint.small} {
        padding: 0 ${s => s.theme.size.spacer} 0 ${s => s.theme.size.spacer2};
    }
`;

const H1Title = styled.h1`
    font-size: ${s => s.theme.fontSize.h2};
    margin: 0 ${s => s.theme.size.spacer} ${s => s.theme.size.spacer} ${s => s.theme.size.spacer};

    @media ${s => s.theme.breakpoint.small} {
        font-size: ${s => s.theme.fontSize.h1};
        margin: 0;
    }
`;

const ImgLogo = styled.img`
    width: ${logoWidth};
    height: ${logoHeight};
`;

interface IProps {
    title?: string;
}

export class Header extends React.PureComponent<IProps> {
    public render(): React.ReactNode {
        return (
            <header>
                <DivHeaderWrapper>
                    <DivLogo><ImgLogo src={logo} alt="Vanguard Outrider" /></DivLogo>
                    {!is.null(this.props.title) && (
                        <DivTitle>
                            <H1Title>{this.props.title}</H1Title>
                        </DivTitle>
                    )}
                </DivHeaderWrapper>
            </header>
        );
    }
}