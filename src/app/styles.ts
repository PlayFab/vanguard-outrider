import * as styledComponents from "styled-components";
import { ThemedStyledComponentsModule, ThemeProps, DefaultTheme } from "styled-components";
import { FontSizes } from "@uifabric/styling";
import { Spinner, DefaultButton, Dialog } from "@fluentui/react";

export interface ITheme extends DefaultTheme {
	color: IThemeColor;
	font: IThemeFont;
	fontSize: IThemeFontSize;
	size: IThemeSize;
	breakpoint: IThemeBreakpoint;
	breakpointUnits: IThemeBreakpoint;
}

interface IThemeColor {
	background000: string;
	background100: string;
	background500: string;

	backgroundEnemy500: string;
	backgroundPlayer500: string;

	border200: string;

	error100: string;
	error500: string;

	text000: string;
	text700: string;
	text900: string;

	link500: string;
	linkVisited500: string;
}

interface IThemeFont {
	normal: string;
}

interface IThemeFontSize {
	h1: string;
	h2: string;
	h3: string;
	h4: string;
	h5: string;
	h6: string;
}

interface IThemeSize {
	spacerD6: string;
	spacerD4: string;
	spacerD3: string;
	spacerD2: string;
	spacerD1p5: string;
	spacerD1p2: string;
	spacerP75: string;
	spacer: string;
	spacer1p5: string;
	spacer2: string;
	spacer3: string;
	spacer4: string;
	spacer5: string;
	spacer6: string;
	spacer7: string;
	spacer8: string;
	spacer9: string;
	unit: string;
}

interface IThemeBreakpoint {
	tiny: string;
	small: string;
	medium: string;
	large: string;
	huge: string;
}

const breakpoints: IThemeBreakpoint = {
	tiny: "320px",
	small: "480px",
	medium: "768px",
	large: "1024px",
	huge: "1280px",
};

const colors = {
	white: "#fff",

	grey100: "#f5f5f5",
	grey150: "#eaeaea",
	grey200: "#d9d9d9",
	grey300: "#afafaf",
	grey600: "#5c5c5c",
	grey650: "#747b8e",
	grey700: "#5d6372",
	grey800: "#464a56",
	grey900: "#2f323a",

	transparent: "rgba(0,0,0,0)",
	shadow100: "rgba(0,0,0,0.18)",

	blue400: "#7caee8",
	blue500: "rgb(0, 120, 212)",
	blue600: "#2578d9",
	blue700: "#1a5498",
	blue900: "#323a44",

	purple500: "#7a3a88",

	orange500: "#ff6d21",
	orange600: "#cd602a",

	red150: "#fdeded",
	red200: "#fdf5f5",
	red300: "#eccfcf",
	yellow150: "#FFE6C2",
	yellow600: "#FA9D2D",
	red500: "#c6405f",
	red550: "#FA2D2D",
	red600: "#997574",

	redPink500: "#c6405f",

	green100: "#DFF9D8",
	green050: "#E9F9EF",
	green150: "#d8f5e8",
	green200: "#8ECC97",
	green300: "#d1ecdd",
	green500: "#378130",
	green600: "#678b7c",

	yellow100: "#fff4ce",
	yellow300: "#f3e5b3",
	yellow500: "#fba841",

	translucent100: "rgba(217, 217, 217, 0.75)",
};

const spacer = 1;
const unit = "rem";

const defaultTheme: ITheme = {
	color: {
		background000: colors.white,
		background100: colors.grey100,
		background500: colors.grey600,

		backgroundEnemy500: colors.red500,
		backgroundPlayer500: colors.green500,

		border200: colors.grey200,

		error100: colors.red150,
		error500: colors.red500,

		text000: colors.white,
		text700: "rgb(96, 94, 92)",
		text900: colors.grey900,

		link500: colors.blue500,
		linkVisited500: colors.purple500,
	},
	font: {
		normal: `"Segoe UI Web (West European)", Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, sans-serif;`,
	},
	fontSize: {
		h1: FontSizes.xxLargePlus,
		h2: FontSizes.xLarge,
		h3: FontSizes.large,
		h4: FontSizes.large,
		h5: FontSizes.mediumPlus,
		h6: FontSizes.mediumPlus,
	},
	size: {
		spacerD6: `${spacer / 6 + unit}`,
		spacerD4: `${spacer / 4 + unit}`,
		spacerD3: `${spacer / 3 + unit}`,
		spacerD2: `${spacer / 2 + unit}`,
		spacerD1p2: `${spacer / 1.2 + unit}`,
		spacerD1p5: `${spacer / 1.5 + unit}`,
		spacerP75: `${spacer * 0.75 + unit}`,
		spacer: `${spacer + unit}`,
		spacer1p5: `${spacer * 1.5 + unit}`,
		spacer2: `${spacer * 2 + unit}`,
		spacer3: `${spacer * 3 + unit}`,
		spacer4: `${spacer * 4 + unit}`,
		spacer5: `${spacer * 5 + unit}`,
		spacer6: `${spacer * 6 + unit}`,
		spacer7: `${spacer * 7 + unit}`,
		spacer8: `${spacer * 8 + unit}`,
		spacer9: `${spacer * 9 + unit}`,
		unit,
	},
	breakpoint: {
		tiny: `(min-width: ${breakpoints.tiny})`,
		small: `(min-width: ${breakpoints.small})`,
		medium: `(min-width: ${breakpoints.medium})`,
		large: `(min-width: ${breakpoints.large})`,
		huge: `(min-width: ${breakpoints.huge})`,
	},
	breakpointUnits: breakpoints,
};

const {
	default: styled,
	css,
	createGlobalStyle,
	keyframes,
	withTheme,
	ThemeProvider,
} = styledComponents as unknown as ThemedStyledComponentsModule<ITheme>;

export interface IWithTheme extends ThemeProps<ITheme> {}

const GlobalStyle = createGlobalStyle`
    html {
        font-family: ${s => s.theme.font.normal};
        margin: 0;
        padding: 0;
    	background: ${s => s.theme.color.background100};
    }

    body {
        margin: 0;
        padding: 0;
    }

    h1, h2, h3, h4, h5, h6 {
        margin: 0;
        font-weight: normal;
        color: ${s => s.theme.color.text700};
    }

    p {
        margin: ${s => s.theme.size.spacerP75} 0 0 0;
    }

    h1 {
        font-size: ${s => s.theme.fontSize.h1};
        margin: 0;
    }

    h2 {
        font-size: ${s => s.theme.fontSize.h2};
    }

    h3 {
        font-size: ${s => s.theme.fontSize.h3};
    }

    h4 {
        font-size: ${s => s.theme.fontSize.h4};
    }

    h5 {
        font-size: ${s => s.theme.fontSize.h5};
    }

    h6 {
        font-size: ${s => s.theme.fontSize.h6};
    }

    form {
        margin: 0;
        padding: 0;
    }

    img {
        max-width: 100%;
    }

    a, a:visited {
        color: ${s => s.theme.color.link500};
        text-decoration: none;
    }

	div, section, main, header, p {
		box-sizing: border-box;
	}
`;

const DivConfirm = styled.div`
	margin-top: 1em;
`;

const UlNull = styled.ul`
	margin: 0;
	padding: 0;
	list-style: none;
`;

const UlInline = styled(UlNull)`
	> li {
		margin-right: ${s => s.theme.size.spacer};
		margin-top: ${s => s.theme.size.spacer};
		display: inline-block;
	}
`;

const SpinnerLeft = styled(Spinner)`
	justify-content: flex-start;
	margin-top: ${s => s.theme.size.spacer2};
`;

const DivField = styled.div`
	margin-top: ${s => s.theme.size.spacer};
	max-width: ${s => s.theme.breakpointUnits.medium};
`;

const DivDocumentCardInterior = styled.div`
	padding: ${s => s.theme.size.spacer};
`;

const DlStats = styled.dl`
	dt {
		font-weight: bold;
		margin-top: ${s => s.theme.size.spacerD2};

		&:first-child {
			margin-top: 0;
		}
	}

	dd {
		margin-left: ${s => s.theme.size.spacerD2};
	}
`;

const ButtonTiny = styled(DefaultButton)`
	font-size: 0.8rem;
	padding: ${s => s.theme.size.spacerD4};
	min-width: none;
	height: auto;
`;

const ButtonAsLink = styled.button`
	font-family: ${s => s.theme.font.normal};
	font-size: ${s => s.theme.fontSize.h6};
	background: none;
	border: 0;
	color: ${s => s.theme.color.link500};
	padding: 0;
	margin: 0;
	cursor: pointer;
`;

const DialogWidthSmall = styled(Dialog)`
	.ms-Dialog-main {
		@media ${s => s.theme.breakpoint.small} {
			min-width: ${s => s.theme.breakpointUnits.small};
			max-width: ${s => s.theme.breakpointUnits.small};
		}
	}
`;

const UlAlternatingIndented = styled(UlNull)`
	> li {
		margin-top: ${s => s.theme.size.spacer};
		margin-left: ${s => s.theme.size.spacerD2};
		padding-left: ${s => s.theme.size.spacerD2};
		border-left: 4px solid ${colors.grey200};

		&:nth-child(even) {
			border-left-color: ${colors.grey300};
		}
	}
`;

const PNone = styled.p`
	font-style: italic;
`;

export {
	css,
	keyframes,
	ThemeProvider,
	defaultTheme,
	withTheme,
	createGlobalStyle,
	GlobalStyle,
	DivConfirm,
	UlNull,
	UlInline,
	DivField,
	SpinnerLeft,
	DivDocumentCardInterior,
	DlStats,
	ButtonTiny,
	ButtonAsLink,
	DialogWidthSmall,
	UlAlternatingIndented,
	PNone,
};
export default styled;
