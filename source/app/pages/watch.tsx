import React from "react";
import { RouteComponentProps } from "react-router-dom";

import { Page } from "../components/page";
import { IWithAppStateProps, withAppState } from "../containers/with-app-state";
import { BackLink } from "../components/back-link";
import { routes } from "../routes";
import { Grid } from "../components/grid";
import { utilities } from "../shared/utilities";

type Props = RouteComponentProps & IWithAppStateProps;

class WatchPageBase extends React.Component<Props> {
    public render(): React.ReactNode {
        return (
            <Page {...this.props} title="Watch PlayFab Work">
                <BackLink to={routes.MainMenu(this.props.appState.cloud, this.props.appState.titleId)} label="Back to main menu" />
                <h2>Watch PlayFab Work</h2>
                <Grid grid6x6>
                    <React.Fragment>
                        <p><strong>In browser:</strong> Open the developer tools in your browser and navigate to the network tab. All requests to PlayFab will be visible.</p>
                        <ul>
                            <li><strong>Windows:</strong> Press F12</li>
                            <li><strong>Macintosh:</strong> Press Command-Option-i</li>
                        </ul>
                    </React.Fragment>
                    <React.Fragment>
                        <p><strong>In PlayFab:</strong> Keep the <a href={utilities.createPlayFabLink(this.props.appState.cloud, this.props.appState.titleId, "dashboard/monitoring/playstream", false)} target="_blank">Dashboard &gt; PlayStream Monitor</a> page open to see all game activity as it happens.</p>
                    </React.Fragment>
                </Grid>
            </Page>
        );
    }
}

export const WatchPage = withAppState(WatchPageBase);