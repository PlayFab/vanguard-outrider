import React from "react";
import { RouteComponentProps } from "react-router";
import { Page } from "../components/page";
import { is } from "../shared/is";
import { MessageBar, MessageBarType, TextField, PrimaryButton, ProgressIndicator } from "office-ui-fabric-react";
import styled, { DivConfirm, DivField, SpinnerLeft, DialogWidthSmall, ButtonTiny } from "../styles";
import { PlayFabHelper } from "../shared/playfab";
import { routes } from "../routes";
import { IStringDictionary, PROGRESS_STAGES, CATALOG_VERSION, ITitleNewsData } from "../shared/types";

import VirtualCurrencies from "../../data/virtual-currency.json";
import Catalogs from "../../data/catalogs.json";
import Stores from "../../data/stores.json";
import TitleData from "../../data/title-data.json";
import CloudScript from "../../data/cloud-script.json";
import DropTables from "../../data/drop-tables.json";
import { IWithAppStateProps, withAppState } from "../containers/with-app-state";
import { IWithPageProps, withPage } from "../containers/with-page";
import { Grid } from "../components/grid";
import { BackLink } from "../components/back-link";
import { utilities } from "../shared/utilities";
import { Link } from "react-router-dom";

const DivUploadComplete = styled.div`
    margin-top: ${s => s.theme.size.spacer};
`;

interface IState {
    secretKey: string;
    hasSecretKey: boolean;
    uploadProgress: number;
    storeCounter: number;
    titleDataCounter: number;
    shouldShowTitleNewsFormat: boolean;
}

type Props = RouteComponentProps & IWithAppStateProps & IWithPageProps;

class UploadPageBase extends React.Component<Props, IState> {
    private readonly uploadDelayMilliseconds = 2000;

    constructor(props: Props) {
        super(props);

        this.state = {
            secretKey: null,
            hasSecretKey: false,
            uploadProgress: 0,
            storeCounter: 0,
            titleDataCounter: 0,
            shouldShowTitleNewsFormat: false,
        };
    }

    public componentDidUpdate(_: Props, prevState: IState): void {
        if(this.state.uploadProgress !== prevState.uploadProgress) {
            this.runUpload();
        }
    }

    public render(): React.ReactNode {
        if(!this.props.appState.hasTitleId) {
            return null;
        }

        const titleId = this.props.appState.titleId;

        const sampleTitleNewsItem: ITitleNewsData = {
            "html": "&lt;p&gt;Your news content here (this is a paragraph tag)&lt;p&gt;"
        };

        return (
            <Page {...this.props} title="Upload Data">
                <Grid grid8x4>
                    {this.state.hasSecretKey
                        ? this.renderUpload()
                        : this.renderForm()}
                    <React.Fragment>
                        <h2>What this creates</h2>
                        <ul>
                            <li><a href={utilities.createPlayFabLink(this.props.appState.cloud, titleId, "economy/currency", true)} target="_blank">Currencies</a></li>
                            <li><a href={utilities.createPlayFabLink(this.props.appState.cloud, titleId, "economy/catalogs/TWFpbg%3d%3d/items", false)} target="_blank">Catalog items</a></li>
                            <li><a href={utilities.createPlayFabLink(this.props.appState.cloud, titleId, "economy/catalogs/TWFpbg%3d%3d/drop-tables", false)} target="_blank">Drop tables</a></li>
                            <li><a href={utilities.createPlayFabLink(this.props.appState.cloud, titleId, "economy/catalogs/TWFpbg%3d%3d/stores", false)} target="_blank">Stores</a></li>
                            <li><a href={utilities.createPlayFabLink(this.props.appState.cloud, titleId, "content/title-data", true)} target="_blank">Title data</a></li>
                            <li><a href={utilities.createPlayFabLink(this.props.appState.cloud, titleId, "automation/cloud-script/revisions", true)} target="_blank">Cloud Script</a></li>
                        </ul>
                        <h2>Title news</h2>
                        <p>This page can't upload title news automatically. Here's how to get started:</p>
                        <ol>
                            <li>Go to <a href={utilities.createPlayFabLink(this.props.appState.cloud, this.props.appState.titleId, "settings/general", true)} target="_blank">Settings &gt; General</a></li>
                            <li>Set your <strong>default language</strong> and click <strong>Save</strong></li>
                            <li>Go to <a href={utilities.createPlayFabLink(this.props.appState.cloud, this.props.appState.titleId, "content/news", true)} target="_blank">Content &gt; Title News</a></li>
                            <li>Click <strong>New title news</strong></li>
                            <li>The <strong>body</strong> field should be JSON with <Link to={routes.Generator(this.props.appState.cloud, this.props.appState.titleId)}>escaped HTML</Link> in this format:</li>
                        </ol>
                        <ButtonTiny text="Show title news format" onClick={this.showTitleNewsSample} />
                        <DialogWidthSmall
                            hidden={!this.state.shouldShowTitleNewsFormat}
                            onDismiss={this.hideTitleNewsSample}
                            dialogContentProps={{
                                title: "Sample title news body format"
                            }}
                        >
                            <pre>{JSON.stringify(sampleTitleNewsItem, null, 4)}</pre>
                        </DialogWidthSmall>
                    </React.Fragment>
                </Grid>
            </Page>
        );
    }

    private hideTitleNewsSample = (): void => {
        this.setState({
            shouldShowTitleNewsFormat: false,
        });
    }

    private showTitleNewsSample = (): void => {
        this.setState({
            shouldShowTitleNewsFormat: true,
        });
    }

    private renderForm(): React.ReactNode {
        return (
            <React.Fragment>
                <BackLink to={routes.MainMenu(this.props.appState.cloud, this.props.appState.titleId)} label="Back to main menu" />
                <h2>About</h2>
                <p>This page will populate your title with everything you need to play.</p>
                <p>Get the secret key for your title from <a href={utilities.createPlayFabLink(this.props.appState.cloud, this.props.appState.titleId, "settings/secret-keys", true)} target="_blank">Settings &gt; Secret Keys</a>.</p>
                <p>This page does not store nor transmit your secret key to anyone except PlayFab.</p>
                <form onSubmit={this.startUpload}>
                    <DivField>
                        <TextField type="password" label="Secret key" value={this.state.secretKey} onChange={this.onChangeSecretKey} autoFocus />
                    </DivField>
                    <DivConfirm>
                        <PrimaryButton text="Begin upload" onClick={this.startUpload} />
                    </DivConfirm>
                </form>
            </React.Fragment>
        );
    }

    private renderUpload(): React.ReactNode {
        if(this.state.uploadProgress >= PROGRESS_STAGES.length - 1) {
            return (
                <React.Fragment>
                    <BackLink to={routes.MainMenu(this.props.appState.cloud, this.props.appState.titleId)} label="Back to main menu" />
                    <h2>Upload complete</h2>
                    <DivUploadComplete>
                        <PrimaryButton text="Play game" onClick={this.goToPage.bind(this, routes.Login(this.props.appState.cloud, this.props.appState.titleId))} />
                    </DivUploadComplete>
                </React.Fragment>
            );
        }

        const spinnerTitle = `Creating ${this.getProgressTitle()}...`;

        return (
            <React.Fragment>
                <h2>Upload in progress</h2>
                {!is.null(this.props.pageError) && (
                    <MessageBar messageBarType={MessageBarType.error}>{this.props.pageError}</MessageBar>
                )}
                <SpinnerLeft label={spinnerTitle} labelPosition="right" />
                <ProgressIndicator percentComplete={Math.min(1, (this.state.uploadProgress / PROGRESS_STAGES.length) + 0.1)} />
            </React.Fragment>
        );
    }

    private goToPage = (page: string): void => {
        this.props.history.push(page);
    }

    private onChangeSecretKey = (_: any, newValue: string): void => {
        this.setState({
            secretKey: newValue,
        });
    }

    private startUpload = (e: React.SyntheticEvent<any>): void => {
        if(!is.null(e)) {
            e.preventDefault();
        }

        this.setState({
            hasSecretKey: true,
        }, this.runUpload);
    }

    private getProgressTitle(): string {
        if(this.state.uploadProgress > PROGRESS_STAGES.length - 1) {
            return null;
        }

        return PROGRESS_STAGES[this.state.uploadProgress].title;
    }

    private runUpload(): void {
        if(!this.state.hasSecretKey || this.state.uploadProgress > PROGRESS_STAGES.length - 1) {
            return;
        }

        switch(PROGRESS_STAGES[this.state.uploadProgress].key) {
            case "currency":
                PlayFabHelper.AdminAPIAddVirtualCurrencyTypes(this.state.secretKey, VirtualCurrencies.VirtualCurrencies, this.advanceUpload, this.props.onPageError);
                
                this.advanceUpload();
                break;
            case "catalog":
                PlayFabHelper.AdminAPISetCatalogItems(this.state.secretKey, Catalogs.Catalog, CATALOG_VERSION, true, this.advanceUpload, this.props.onPageError);
                this.advanceUpload();
                break;
            case "droptable":
                PlayFabHelper.AdminAPIUpdateRandomResultTables(this.state.secretKey, this.mapDropTable(DropTables as any), CATALOG_VERSION, this.advanceUpload, this.props.onPageError);
                this.advanceUpload();
                break;
            case "store":
                Stores.data.forEach((s, index) => {
                    window.setTimeout(() => {
                        PlayFabHelper.AdminAPISetStoreItems(this.state.secretKey, s.StoreId, s.Store, s.MarketingData, CATALOG_VERSION, this.advanceStoreCounter, this.props.onPageError);
                        this.advanceStoreCounter();
                    }, index * this.uploadDelayMilliseconds);
                });
                break;
            case "titledata":
                Object.keys(TitleData.Data).forEach((key, index) => {
                    window.setTimeout(() => {
                        PlayFabHelper.AdminAPISetTitleData(this.state.secretKey, key, (TitleData.Data as IStringDictionary)[key], this.advanceTitleDataCounter, this.props.onPageError);
                        this.advanceTitleDataCounter();
                    }, index * this.uploadDelayMilliseconds);
                });
                break;
            case "cloudscript":
                PlayFabHelper.AdminAPIUpdateCloudScript(this.state.secretKey, CloudScript.Files[0].FileContents, true, this.advanceUpload, this.props.onPageError);
                this.advanceUpload();
                break;
        }
    }

    private mapDropTable(tableData: PlayFabAdminModels.GetRandomResultTablesResult): PlayFabAdminModels.RandomResultTable[] {
        return Object.keys(tableData.Tables).map(key => {
            return {
                TableId: tableData.Tables[key].TableId,
                Nodes: tableData.Tables[key].Nodes,
            }
        });
    }

    private advanceUpload = (): void => {
        // Can't let the system go too fast
        window.setTimeout(() => {
            if(!is.null(this.props.pageError)) {
                return;
            }

            this.props.onPageClearError();

            this.setState((prevState) => {
                return {
                    uploadProgress: prevState.uploadProgress + 1,
                }
            });
        }, this.uploadDelayMilliseconds);
    }

    private advanceStoreCounter = (): void => {
        this.setState((prevState) => {
            return {
                storeCounter: prevState.storeCounter + 1,
            }
        }, () => {
            if(this.state.storeCounter >= Stores.data.length) {
                this.advanceUpload();
            }
        });
    }

    private advanceTitleDataCounter = (): void => {
        this.setState((prevState) => {
            return {
                titleDataCounter: prevState.titleDataCounter + 1,
            }
        }, () => {
            if(this.state.titleDataCounter >= Object.keys(TitleData.Data).length) {
                this.advanceUpload();
            }
        });
    }
}

export const UploadPage = withAppState(withPage(UploadPageBase));