import React from "react";
import { RouteComponentProps } from "react-router-dom";

import { Page } from "../components/page";
import { IWithAppStateProps, withAppState } from "../containers/with-app-state";
import { DlStats } from "../styles";
import { BackLink } from "../components/back-link";
import { routes } from "../routes";

type Props = RouteComponentProps & IWithAppStateProps;

class CreditsPageBase extends React.Component<Props> {
    public render(): React.ReactNode {
        return (
            <Page {...this.props} title="Credits">
                <BackLink to={routes.MainMenu(this.props.appState.cloud, this.props.appState.titleId)} label="Back to main menu" />
                <h2>Credits</h2>
                <p>This game was created at the 2019 Microsoft Hackathon.</p>
                <DlStats>
                    <dt>Development</dt>
                    <dd><a href="mailto:jordan.roher@microsoft.com">Jordan Roher</a></dd>
                
                    <dt>Logo</dt>
                    <dd><a href="https://www.linkedin.com/in/jasmineaye">Jasmine Aye</a></dd>
                    
                    <dt>Azure build</dt>
                    <dd>Julio Colon</dd>
                    
                    <dt>Initial data &amp; concept</dt>
                    <dd>Ashton Summers, Aaron Lai</dd>
                </DlStats>
            </Page>
        );
    }
}

export const CreditsPage = withAppState(CreditsPageBase);