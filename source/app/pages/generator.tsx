import React from "react";
import { RouteComponentProps } from "react-router";

import { IWithAppStateProps, withAppState } from "../containers/with-app-state";
import { IWithPageProps, withPage } from "../containers/with-page";
import { Page } from "../components/page";
import { BackLink } from "../components/back-link";
import { routes } from "../routes";
import { IGeneratorLevelProps, LevelEditor } from "../components/generator/level-editor";
import { TitleNewsEditor } from "../components/generator/title-news";

interface IState {
    levels: IGeneratorLevelProps;
}

type Props = RouteComponentProps & IWithAppStateProps & IWithPageProps;

class GeneratorPageBase extends React.Component<Props, IState> {
    constructor(props: Props) {
        super(props);

        this.state = {
            levels: {
                max: 50,
                xpToLevel1: 100,
                xpToLevelMax: 10000,
                xpPerLevelMultiplier: 1.15,
                hpPerLevelMultiplier: 5.75,
            },
        };
    }

    public render(): React.ReactNode {
        return (
            <Page
                {...this.props}
                title="Generator"
            >
                <BackLink to={routes.MainMenu(this.props.appState.cloud, this.props.appState.titleId)} label="Back to main menu" />
                <LevelEditor
                    {...this.state.levels}
                    onChange={this.onChangeLevelData}
                />
                <TitleNewsEditor />
            </Page>
        );
    }

    private onChangeLevelData = (data: IGeneratorLevelProps): void => {
        this.setState({
            levels: data,
        });
    }
}

export const GeneratorPage = withAppState(withPage(GeneratorPageBase));