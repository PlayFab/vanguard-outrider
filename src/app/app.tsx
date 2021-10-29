import React from "react";
import { Store } from "redux";
import { Provider } from "react-redux";

import { Router } from "./router";
import { GlobalStyle, defaultTheme, ThemeProvider } from "./styles";
import { reduxStore } from "./store/store";

interface IProps {
	store?: Store;
}

type Props = IProps;

export const App: React.FunctionComponent<Props> = React.memo(props => {
	const { store } = props;

	return (
		<ThemeProvider theme={defaultTheme}>
			<Provider store={store}>
				<GlobalStyle />
				<Router />
			</Provider>
		</ThemeProvider>
	);
});

App.defaultProps = {
	store: reduxStore,
};
