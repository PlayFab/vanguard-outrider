import React from "react";
import { Link } from "react-router-dom";
import styled, { ButtonAsLink } from "../styles";
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
    &, &:visited {
        color: ${s => s.theme.color.link500};
        cursor: pointer;
    }
`;

export const BackLink = React.memo((props: IProps): React.ReactElement => {
    if(!is.null(props.onClick)) {
        return (
            <PBackLink><ButtonAsLink onClick={props.onClick}><strong>&laquo; {props.label}</strong></ButtonAsLink></PBackLink>
        );
    }

    return (
        <PBackLink><LinkBackLink to={props.to}><strong>&laquo; {props.label}</strong></LinkBackLink></PBackLink>
    );
});