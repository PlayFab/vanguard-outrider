import React from "react";
import { RouteComponentProps } from "react-router";
import { MessageBar, MessageBarType, TextField, PrimaryButton, ProgressIndicator } from "office-ui-fabric-react";

import { Page } from "../components/page";
import { is } from "../shared/is";
import styled, { DivConfirm, DivField, SpinnerLeft } from "../styles";
import { routes } from "../routes";
import { PROGRESS_STAGES, CATALOG_VERSION, TITLE_DATA_STORES } from "../shared/types";
import { PlayFabHelper } from "../shared/playfab";
import { IWithAppStateProps, withAppState } from "../containers/with-app-state";
import { withPage, IWithPageProps } from "../containers/with-page";
import { utilities } from "../shared/utilities";
import { BackLink } from "../components/back-link";
import { Grid } from "../components/grid";

const DivDownloadGrid = styled.div`
    margin-top: ${s => s.theme.size.spacer};
`;

const MessageBarSuccess = styled(MessageBar)`
    margin: ${s => s.theme.size.spacer} 0;
`;

interface IState {
    secretKey: string;
    hasSecretKey: boolean;
    downloadProgress: number;
    storeCounter: number;
    titleDataCounter: number;
    downloadContent: IDownloadContent[];
}

interface IDownloadContent {
    title: string;
    content: string;
}

type Props = RouteComponentProps & IWithAppStateProps & IWithPageProps;

class DownloadPageBase extends React.PureComponent<Props, IState> {
    private storeCount = 0;
    private storeContent: any[] = [];

    constructor(props: Props) {
        super(props);

        this.state = {
            secretKey: null,
            hasSecretKey: false,
            downloadProgress: 0,
            storeCounter: 0,
            titleDataCounter: 0,
            downloadContent: [],
        };
    }

    public componentDidUpdate(_: Props, prevState: IState): void {
        if(this.state.downloadProgress !== prevState.downloadProgress) {
            this.runDownload();
        }
    }

    public render(): React.ReactNode {
        if(!this.props.appState.hasTitleId) {
            return null;
        }

        return (
            <Page {...this.props} title="Download Data">
                {this.state.hasSecretKey
                    ? this.renderDownload()
                    : this.renderSecretKey()}
            </Page>
        );
    }

    private renderSecretKey(): React.ReactNode {
        return (
            <form onSubmit={this.startDownload}>
                <BackLink to={routes.MainMenu(this.props.appState.cloud, this.props.appState.titleId)} label="Back to main menu" />
                <h2>About</h2>
                <p>This page will download data from your title to make it easier to re-upload using our <a href="https://github.com/PlayFab/vanguard-outrider">GitHub repository</a>.</p>
                <p>Get the secret key for your title from <a href={utilities.createPlayFabLink(this.props.appState.cloud, this.props.appState.titleId, "settings/secret-keys", true)} target="_blank">Settings &gt; Secret Keys</a>.</p>
                <p>This page does not store nor transmit your secret key to anyone except PlayFab.</p>
                <DivField>
                    <TextField type="password" label="Secret key" value={this.state.secretKey} onChange={this.onChangeSecretKey} autoFocus />
                </DivField>
                <DivConfirm>
                    <PrimaryButton text="Begin download" onClick={this.startDownload} />
                </DivConfirm>
            </form>
        );
    }

    private renderDownload(): React.ReactNode {
        const percentComplete = Math.min(1, (this.state.downloadProgress / PROGRESS_STAGES.length) + 0.1);
        const title = percentComplete < 1
            ? "Download in progress"
            : "Download complete";
        const spinnerLabel = `Downloading ${this.getProgressTitle()}...`;

        return (
            <React.Fragment>
                <BackLink to={routes.MainMenu(this.props.appState.cloud, this.props.appState.titleId)} label="Back to main menu" />
                <h2>{title}</h2>
                {percentComplete < 1
                ? (
                    <React.Fragment>
                        <SpinnerLeft label={spinnerLabel} labelPosition="right" />
                        <ProgressIndicator percentComplete={percentComplete} />
                    </React.Fragment>
                )
                : (
                    <MessageBarSuccess messageBarType={MessageBarType.success}>Save these text fields to the JSON files inside the <code>/source/data</code> folder.</MessageBarSuccess>
                )}
                {this.renderDownloadContent()}
            </React.Fragment>
        );
    }

    private renderDownloadContent(): React.ReactNode {
        if(is.null(this.state.downloadContent)) {
            return null;
        }

        return (
            <React.Fragment>
                {!is.null(this.props.pageError) && (
                    <MessageBar messageBarType={MessageBarType.error}>{this.props.pageError}</MessageBar>
                )}
                <DivDownloadGrid>
                    <Grid grid6x6>
                        {this.state.downloadContent.map((d, index) => (
                            <React.Fragment key={index}>
                                <h3>{d.title}</h3>
                                <TextField multiline value={d.content} rows={10} />
                            </React.Fragment>
                        ))}
                    </Grid>
                </DivDownloadGrid>
            </React.Fragment>
        )
    }

    private getProgressTitle(): string {
        if(this.state.downloadProgress > PROGRESS_STAGES.length - 1) {
            return null;
        }

        return PROGRESS_STAGES[this.state.downloadProgress].title;
    }

    private getProgressFilename(): string {
        if(this.state.downloadProgress > PROGRESS_STAGES.length - 1) {
            return null;
        }

        return PROGRESS_STAGES[this.state.downloadProgress].filename;
    }

    private runDownload(): void {
        if(!this.state.hasSecretKey || this.state.downloadProgress > PROGRESS_STAGES.length - 1) {
            return;
        }

        const filename = this.getProgressFilename();

        switch(PROGRESS_STAGES[this.state.downloadProgress].key) {
            case "currency":
                PlayFabHelper.AdminAPIListVirtualCurrencyTypes(this.state.secretKey, (data) => {
                    this.advanceDownload(filename, data);
                }, this.props.onPageError);
                break;
            case "catalog":
                PlayFabHelper.AdminAPIGetCatalogItems(this.state.secretKey, CATALOG_VERSION, (data) => {
                    this.advanceDownload(filename, data);
                }, this.props.onPageError);
                break;
            case "droptable":
                PlayFabHelper.AdminAPIGetRandomResultTables(this.state.secretKey, CATALOG_VERSION, (data) => {
                    this.advanceDownload(filename, data);
                }, this.props.onPageError);
                break;
            case "store":
                PlayFabHelper.AdminAPIGetTitleData(this.state.secretKey, [TITLE_DATA_STORES], (titleData) => {
                    const storeNames = (JSON.parse(titleData.Data[TITLE_DATA_STORES]) as string[]);
                    this.storeCount = storeNames.length;

                    storeNames.forEach(name => {
                        PlayFabHelper.AdminAPIGetStoreItems(this.state.secretKey, CATALOG_VERSION, name, (storeData) => {
                            this.storeContent.push(storeData);
                            this.advanceStoreCounter();
                        }, this.props.onPageError);
                    })
                }, this.props.onPageError);
                break;
            case "titledata":
                PlayFabHelper.AdminAPIGetTitleData(this.state.secretKey, null, (data) => {
                    this.advanceDownload(filename, data);
                }, this.props.onPageError)
                break;
            case "cloudscript":
                PlayFabHelper.AdminAPIGetCloudScriptRevision(this.state.secretKey, null, null, (data) => {
                    this.advanceDownload(filename, data);
                }, this.props.onPageError);
                break;
        }
    }

    private onChangeSecretKey = (_: any, newValue: string): void => {
        this.setState({
            secretKey: newValue,
        });
    }

    private startDownload = (e: React.SyntheticEvent<any>): void => {
        if(!is.null(e)) {
            e.preventDefault();
        }

        this.setState({
            hasSecretKey: true,
        }, this.runDownload);
    }

    private advanceDownload = (title: string, data: any): void => {
        this.props.onPageClearError();

        this.setState((prevState) => {
            return {
                downloadProgress: prevState.downloadProgress + 1,
                downloadContent: prevState.downloadContent.concat([{
                    title,
                    content: JSON.stringify(data, null, 4),
                }])
            }
        });
    }

    private advanceStoreCounter = (): void => {
        this.setState((prevState) => {
            return {
                storeCounter: prevState.storeCounter + 1,
            }
        }, () => {
            if(this.state.storeCounter >= this.storeCount) {
                this.advanceDownload(this.getProgressFilename(), {
                    "data": this.storeContent
                });
            }
        });
    }
}

export const DownloadPage = withAppState(withPage(DownloadPageBase));