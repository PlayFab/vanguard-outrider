import React from "react";

export interface IWithPageProps {
    readonly pageError: string;
    readonly onPageClearError: () => void;
    readonly onPageError: (errorMessage: string) => void;
    readonly onPageNothing: () => void;
}

interface IState {
    error: string;
}

export const withPage = <P extends IWithPageProps>(Component: React.ComponentType<P>) => {
    return class WithAppState extends React.Component<Omit<P, keyof IWithPageProps>, IState> {
        public state: IState = {
			error: null,
		};

        public render(): React.ReactNode {
            return (
                <Component
                    {...this.props as P}
                    pageError={this.state.error}
                    onPageError={this.onError}
                    onPageClearError={this.clearError}
                    onPageNothing={this.onNothing}
                />
            );
        }

        private onError = (errorMessage: string): void => {
            this.setState({
                error: errorMessage,
            });
        }

        private clearError = (): void => {
            this.setState({
                error: null,
            });
        }

        private onNothing = (): void => {
            // TODO: Nothing (done!)
        }
    }
}