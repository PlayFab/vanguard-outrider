import * as React from "react";

import styled from "../styles";
import { is } from "../shared/is";

interface IDivGridProps {
    gridType: GridType;
    reduce?: boolean;
    breakpoint1?: string;
    breakpoint2?: string;
    columnGap?: string;
}

const DivGrid = styled.div<IDivGridProps>`
    display: grid;
    grid-gap: ${(props) => props.theme.size.spacer2};

    ${(props) => {
        switch (props.gridType) {
            case GridType.Grid4x4x4:
                return `
                    width: 100%;
                    ${props.reduce
                        ? `
                            @media ${is.null(props.breakpoint2)
                                ? props.theme.breakpoint.small
                                : props.breakpoint2} {
                                grid-template-columns: 1fr 1fr;
                            }
                        `
                        : ``}

                    @media ${is.null(props.breakpoint1)
                        ? props.theme.breakpoint.medium
                        : props.breakpoint1} {
                        grid-template-columns: 1fr 1fr 1fr;
                    }
                    ${is.null(props.columnGap)
                        ? ``
                        : `grid-column-gap: ${props.columnGap};`}
                `;
            case GridType.Grid3x3x6:
                return `
                    ${props.reduce
                        ? `
                            @media ${is.null(props.breakpoint2)
                                ? props.theme.breakpoint.small
                                : props.breakpoint2} {
                                grid-template-columns: 1fr 1fr;
                            }
                        `
                        : ``}

                    @media ${is.null(props.breakpoint1)
                        ? props.theme.breakpoint.medium
                        : props.breakpoint1} {
                        grid-template-columns: 1fr 1fr 2fr;
                    }
                    ${is.null(props.columnGap)
                        ? ``
                        : `grid-column-gap: ${props.columnGap};`}
                `;
            case GridType.Grid3x3x3x3:
                return `
                    width: 100%;
                    ${props.reduce
                        ? `
                            @media ${is.null(props.breakpoint2)
                                ? props.theme.breakpoint.small
                                : props.breakpoint2} {
                                grid-template-columns: 1fr 1fr;
                            }
                        `
                        : ``}

                    @media ${is.null(props.breakpoint1)
                        ? props.theme.breakpoint.medium
                        : props.breakpoint1} {
                        grid-template-columns: 1fr 1fr 1fr 1fr;
                    }
                    ${is.null(props.columnGap)
                        ? ``
                        : `grid-column-gap: ${props.columnGap};`}
                `;
            case GridType.Grid2x2x2x2x2x2:
                return `
                    width: 100%;
                    ${props.reduce
                        ? `
                            @media ${is.null(props.breakpoint2)
                                ? props.theme.breakpoint.small
                                : props.breakpoint2} {
                                grid-template-columns: 1fr 1fr;
                            }
                        `
                        : ``}

                    @media ${is.null(props.breakpoint1)
                        ? props.theme.breakpoint.medium
                        : props.breakpoint1} {
                        grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
                    }
                    ${is.null(props.columnGap)
                        ? ``
                        : `grid-column-gap: ${props.columnGap};`}
                `;
            case GridType.Grid4x8:
                return `
                    width: 100%;
                    ${props.reduce
                        ? `
                            @media ${is.null(props.breakpoint2)
                                ? props.theme.breakpoint.small
                                : props.breakpoint2} {
                                grid-template-columns: 1fr 1fr;
                            }
                        `
                        : ``}

                    @media ${is.null(props.breakpoint1)
                        ? props.theme.breakpoint.medium
                        : props.breakpoint1} {
                        grid-template-columns: 1fr 2fr;
                    }
                    ${is.null(props.columnGap)
                        ? ``
                        : `grid-column-gap: ${props.columnGap};`}
                `;
            case GridType.Grid8x4:
                return `
                    width: 100%;
                    ${props.reduce
                        ? `
                            @media ${is.null(props.breakpoint2)
                                ? props.theme.breakpoint.small
                                : props.breakpoint2} {
                                grid-template-columns: 1fr 1fr;
                            }
                        `
                        : ``}

                    @media ${is.null(props.breakpoint1)
                        ? props.theme.breakpoint.medium
                        : props.breakpoint1} {
                        grid-template-columns: 2fr 1fr;
                    }
                    ${is.null(props.columnGap)
                        ? ``
                        : `grid-column-gap: ${props.columnGap};`}
                `;
            case GridType.Grid3x9:
                return `
                    width: 100%;
                    ${props.reduce
                        ? `
                            @media ${is.null(props.breakpoint2)
                                ? props.theme.breakpoint.small
                                : props.breakpoint2} {
                                grid-template-columns: 1fr 1fr;
                            }
                        `
                        : ``}

                    @media ${is.null(props.breakpoint1)
                        ? props.theme.breakpoint.medium
                        : props.breakpoint1} {
                        grid-template-columns: 1fr 3fr;
                    }
                    ${is.null(props.columnGap)
                        ? ``
                        : `grid-column-gap: ${props.columnGap};`}
                `;
            case GridType.Grid9x3:
                return `
                    width: 100%;
                    ${props.reduce
                        ? `
                            @media ${is.null(props.breakpoint2)
                                ? props.theme.breakpoint.small
                                : props.breakpoint2} {
                                grid-template-columns: 1fr 1fr;
                            }
                        `
                        : ``}

                    @media ${is.null(props.breakpoint1)
                        ? props.theme.breakpoint.medium
                        : props.breakpoint1} {
                        grid-template-columns: 3fr 1fr;
                    }
                    ${is.null(props.columnGap)
                        ? ``
                        : `grid-column-gap: ${props.columnGap};`}
                `;
            case GridType.Grid2x10:
                return `
                    width: 100%;
                    ${props.reduce
                        ? `
                            @media ${is.null(props.breakpoint2)
                                ? props.theme.breakpoint.small
                                : props.breakpoint2} {
                                grid-template-columns: 1fr 1fr;
                            }
                        `
                        : ``}

                    @media ${is.null(props.breakpoint1)
                        ? props.theme.breakpoint.medium
                        : props.breakpoint1} {
                        grid-template-columns: 1fr 4fr;
                    }
                    ${is.null(props.columnGap)
                        ? ``
                        : `grid-column-gap: ${props.columnGap};`}
                `;
            case GridType.Grid10x2:
                return `
                    width: 100%;
                    ${props.reduce
                        ? `
                            @media ${is.null(props.breakpoint2)
                                ? props.theme.breakpoint.small
                                : props.breakpoint2} {
                                grid-template-columns: 1fr 1fr;
                            }
                        `
                        : ``}

                    @media ${is.null(props.breakpoint1)
                        ? props.theme.breakpoint.medium
                        : props.breakpoint1} {
                        grid-template-columns: 4fr 1fr;
                    }
                    ${is.null(props.columnGap)
                        ? ``
                        : `grid-column-gap: ${props.columnGap};`}
                `;
            case GridType.Grid12:
                return `
                    grid-template-columns: 1fr;
                `;
            case GridType.Grid6x6:
            default:
                return `
                    width: 100%;
                    @media ${is.null(props.breakpoint1)
                        ? props.theme.breakpoint.medium
                        : props.breakpoint1} {
                        grid-template-columns: 1fr 1fr;
                    }
                    ${is.null(props.columnGap)
                        ? ``
                        : `grid-column-gap: ${props.columnGap};`}
                `;
        }
    }}
`;

interface IGridProps {
    grid6x6?: boolean;
    grid4x4x4?: boolean;
    grid3x3x6?: boolean;
    grid3x3x3x3?: boolean;
    grid2x2x2x2x2x2?: boolean;
    grid4x8?: boolean;
    grid8x4?: boolean;
    grid3x9?: boolean;
    grid9x3?: boolean;
    grid2x10?: boolean;
    grid10x2?: boolean;
    grid12?: boolean;

    reduce?: boolean;
    breakpoint1?: string;
    breakpoint2?: string;
    columnGap?: string;
}

enum GridType {
    Grid6x6,
    Grid4x4x4,
    Grid3x3x6,
    Grid3x3x3x3,
    Grid2x2x2x2x2x2,
    Grid4x8,
    Grid8x4,
    Grid3x9,
    Grid9x3,
    Grid2x10,
    Grid10x2,
    Grid12,
}

export const Grid: React.SFC<IGridProps> = (props): JSX.Element => {
    const getGridType = (): GridType => {
        if (props.grid6x6) {
            return GridType.Grid6x6;
        }
        if (props.grid4x4x4) {
            return GridType.Grid4x4x4;
        }
        if (props.grid3x3x6) {
            return GridType.Grid3x3x6;
        }
        if (props.grid3x3x3x3) {
            return GridType.Grid3x3x3x3;
        }
        if (props.grid2x2x2x2x2x2) {
            return GridType.Grid2x2x2x2x2x2;
        }
        if (props.grid4x8) {
            return GridType.Grid4x8;
        }
        if (props.grid8x4) {
            return GridType.Grid8x4;
        }
        if (props.grid3x9) {
            return GridType.Grid3x9;
        }
        if (props.grid9x3) {
            return GridType.Grid9x3;
        }
        if (props.grid2x10) {
            return GridType.Grid2x10;
        }
        if (props.grid10x2) {
            return GridType.Grid10x2;
        }
        if (props.grid12) {
            return GridType.Grid12;
        }

        return GridType.Grid6x6;
    };

    return (
        <DivGrid
            gridType={getGridType()}
            reduce={props.reduce}
            breakpoint1={props.breakpoint1}
            breakpoint2={props.breakpoint2}
            columnGap={props.columnGap}
        >
            {React.Children.map(props.children, (child) => (
                <div>{child}</div>
            ))}
        </DivGrid>
    );
};
