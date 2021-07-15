import * as React from "react";
import { RouteComponentProps, withRouter } from "react-router";

type Props = RouteComponentProps<any>;

// This component exists solely to track changes in the React route so we can mark
// user's as having consented to cookies. It does not render anything.
class CookieBannerBase extends React.Component<Props> {
    public render(): React.ReactNode {
        return null;
    }

    public componentDidUpdate(prevProps: Props): void {
        // If we browse to a different location, that is considered user consent so
        // we manually set the consent. We need to do this because the mscc library
        // only knows about non-React navigation, so in order for it to work correctly
        // with React we need to give it a shove.
        if (this.props.location !== prevProps.location) {
            // mscc is loaded in via an external JS library, so we need to make sure
            // it was actually loaded before trying to use it.
            if (typeof(mscc) !== "undefined") {
                mscc.setConsent();
            }
        }
    }
}

export const CookieBanner = withRouter(CookieBannerBase);
