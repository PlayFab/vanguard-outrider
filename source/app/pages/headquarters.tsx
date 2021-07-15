import React from "react";
import { Redirect, RouteComponentProps } from "react-router";
import { PrimaryButton, Link, DialogType, DialogFooter, DefaultButton } from "office-ui-fabric-react";

import { is } from "../shared/is";
import { routes } from "../routes";
import { Store } from "../components/store";
import { PlayFabHelper } from "../shared/playfab";
import { Page } from "../components/page";
import styled, { UlInline, SpinnerLeft, ButtonTiny, DlStats, DialogWidthSmall } from "../styles";
import { IWithAppStateProps, withAppState } from "../containers/with-app-state";
import { actionSetInventory, actionSetStores, actionSetPlayerHP, actionSetEquipmentSingle } from "../store/actions";
import { CATALOG_VERSION, STATISTIC_KILLS, ILeaderboardDictionary, STATISTIC_LEVEL, ITitleNewsData } from "../shared/types";
import { IWithPageProps, withPage } from "../containers/with-page";
import { getSlotTypeFromItemClass, EquipmentSlotTypes } from "../store/types";
import { CloudScriptHelper } from "../shared/cloud-script";
import { BackLink } from "../components/back-link";
import { Grid } from "../components/grid";
import { Leaderboard } from "../components/leaderboard";
import { utilities } from "../shared/utilities";

const DivLeaderboards = styled.div`
    margin-top: ${s => s.theme.size.spacer2};
    padding-top: ${s => s.theme.size.spacer};
    border-top: 1px solid ${s => s.theme.color.border200};
`;

const DivNewsAndLeaderboardWrapper = styled.div`
    margin-top: ${s => s.theme.size.spacer};
`;

const H2WithButton = styled.h2`
    display: flex;
    align-items: center;
`;

interface IState {
    selectedStore: string;
    isBuyingSomething: boolean;
    isRestoringHealth: boolean;
    leaderboards: ILeaderboardDictionary;
    news: PlayFabClientModels.TitleNewsItem[];
    readNewsId: string;
    isLoadingLeaderboards: boolean;
    isLoadingNews: boolean;
}

type Props = RouteComponentProps & IWithAppStateProps & IWithPageProps;

class HeadquartersPageBase extends React.Component<Props, IState> {
    private readonly leaderboardStatistics = [STATISTIC_KILLS, STATISTIC_LEVEL];
    private readonly leaderboardCount = 10;
    private readonly titleNewsCount = 10;

    constructor(props: Props) {
        super(props);

        this.state = {
            selectedStore: null,
            isBuyingSomething: false,
            isRestoringHealth: true,
            leaderboards: null,
            news: null,
            readNewsId: null,
            isLoadingLeaderboards: true,
            isLoadingNews: true,
        };
    }

    public componentDidMount(): void {
        if(!this.isValid()) {
            return;
        }

        this.getStores();
        this.restorePlayerHP();
        this.getLeaderboards();
        this.getNews();
    }

    public render(): React.ReactNode {
        if(!this.props.appState.hasTitleId) {
            return null;
        }
        
        if(!this.props.appState.hasPlayerId) {
            return (<Redirect to={routes.MainMenu(this.props.appState.cloud, this.props.appState.titleId)} />);
        }

        const store = this.getStore();

        return (
            <Page
                {...this.props}
                title={is.null(store)
                    ? "Headquarters"
                    : store.MarketingData.DisplayName}
                shouldShowPlayerInfo
            >
                {this.renderPage()}
            </Page>
        );
    }

    public renderPage(): React.ReactNode {
        if(is.null(this.state.selectedStore)) {
            return (
                <React.Fragment>
                    <BackLink to={routes.Guide(this.props.appState.cloud, this.props.appState.titleId)} label="Back to guide" />
                    <Grid grid6x6>
                        <React.Fragment>
                            <h2>Welcome</h2>
                            {this.state.isRestoringHealth
                                ? <SpinnerLeft label="Restoring health..." labelPosition="right" />
                                : <p>Your health has been restored.</p>}
                            {this.renderNews()}
                        </React.Fragment>
                        {this.renderStores()}
                    </Grid>
                    {this.renderLeaderboards()}
                </React.Fragment>
                
            );
        }

        const store = this.getStore();

        return (
            <Store
                titleId={this.props.appState.titleId}
                store={store}
                onBuy={this.onBuyFromStore}
                catalogItems={this.props.appState.catalog}
                playerWallet={this.props.appState.inventory.VirtualCurrency}
                onLeaveStore={this.onLeaveStore}
                storeName={this.getStore().MarketingData.DisplayName}
                inventory={this.props.appState.inventory.Inventory}
                isBuyingSomething={this.state.isBuyingSomething}
            />
        );
    }

    private renderStores(): React.ReactNode  {
        if(is.null(this.props.appState.stores)) {
            return (
                <React.Fragment>
                    <h2>Stores</h2>
                    <SpinnerLeft label="Loading stores..." labelPosition="right" />
                </React.Fragment>
            );
        }

        return (
            <React.Fragment>
                <h2>Stores</h2>
                <UlInline>
                    {this.props.appState.stores.map((store, index) => (
                        <li key={index}><PrimaryButton text={store.MarketingData.DisplayName} onClick={this.openStore.bind(this, store.StoreId)} /></li>
                    ))}
                </UlInline>
            </React.Fragment>
        );
    }

    private renderLeaderboards(): React.ReactNode {
        let leaderboardNames: string[] = [];

        if(!is.null(this.state.leaderboards) && !is.null(Object.keys(this.state.leaderboards))) {
            leaderboardNames = Object.keys(this.state.leaderboards).sort();
        }

        if(this.state.isLoadingLeaderboards) {
            return (
                <DivLeaderboards>
                    <H2WithButton>Leaderboards</H2WithButton>
                    <SpinnerLeft label="Loading leaderboards..." labelPosition="right" />
                </DivLeaderboards>
            );
        }

        return (
            <DivLeaderboards>
                <H2WithButton>Leaderboards <ButtonTiny text="Refresh" onClick={this.getLeaderboards} /></H2WithButton>
                <DivNewsAndLeaderboardWrapper>
                    <Grid grid6x6>
                        {leaderboardNames.map(boardName => (
                            <Leaderboard cloud={this.props.appState.cloud} titleId={this.props.appState.titleId} key={boardName} name={boardName} leaderboard={this.state.leaderboards[boardName]} />
                        ))}
                    </Grid>
                </DivNewsAndLeaderboardWrapper>
            </DivLeaderboards>
        );
    }

    private renderNews(): React.ReactNode {
        const isReadingNews = !is.null(this.state.readNewsId);
        let newsTitle: string;
        let newsArticle: string;
        let newsDate: string;

        if(isReadingNews) {
            const newsItem = this.state.news.find(n => n.NewsId === this.state.readNewsId);

            if(!is.null(newsItem)) {
                // This reeeeaaally shouldn't be null, but just in case
                newsTitle = newsItem.Title;
                newsDate = utilities.parseTitleNewsDate(newsItem.Timestamp);

                const newsArticleTemporary = JSON.parse(newsItem.Body) as ITitleNewsData;
                newsArticle = is.null(newsArticleTemporary.html)
                    ? newsItem.Body
                    : utilities.htmlDecode(newsArticleTemporary.html);
            }
        }

        if(this.state.isLoadingNews) {
            return (
                <DivNewsAndLeaderboardWrapper>
                    <H2WithButton>News</H2WithButton>
                    <SpinnerLeft label="Loading news..." labelPosition="right" />
                </DivNewsAndLeaderboardWrapper>
            );
        }

        return (
            <DivNewsAndLeaderboardWrapper>
                <H2WithButton>News <ButtonTiny text="Refresh" onClick={this.getNews} /></H2WithButton>
                {is.null(this.state.news)
                    ? <p>No news yet</p>
                    : (
                        <DlStats>
                            {this.state.news.map(news => (
                                <React.Fragment key={news.NewsId}>
                                    <dt><Link onClick={this.readNews.bind(this, news.NewsId)}>{news.Title}</Link></dt>
                                    <dd>{utilities.parseTitleNewsDate(news.Timestamp)}</dd>
                                </React.Fragment>
                            ))}
                        </DlStats>
                    )}
                
                <DialogWidthSmall
                    dialogContentProps={{
                        type: DialogType.largeHeader,
                        title: newsTitle,
                        subText: newsDate
                    }}
                    hidden={!isReadingNews}
                    onDismiss={this.clearNews}
                >
                    <div dangerouslySetInnerHTML={{__html: newsArticle}}></div>
                    <DialogFooter>
                        <DefaultButton onClick={this.clearNews} text="Close" />
                    </DialogFooter>
                </DialogWidthSmall>
            </DivNewsAndLeaderboardWrapper>
        );
    }

    private readNews = (newsId: string): void => {
        this.setState({
            readNewsId: newsId,
        });
    }

    private clearNews = (): void => {
        this.setState({
            readNewsId: null,
        });
    }

    private onLeaveStore = (): void => {
        this.openStore(null);
    }

    private openStore = (selectedStore: string): void => {
        this.setState({
            selectedStore,
        });
    }

    private onBuyFromStore = (itemId: string, currency: string, price: number): void => {
        this.setState({
            isBuyingSomething: true,
        });

        PlayFabHelper.PurchaseItem(CATALOG_VERSION, this.state.selectedStore, itemId, currency, price, (data) => {
            if(!is.null(data.errorMessage)) {
                this.setState({
                    isBuyingSomething: false,
                });

                this.props.onPageError(data.errorMessage);
                return;
            }

            PlayFabHelper.GetUserInventory(inventory => {
                this.props.dispatch(actionSetInventory(inventory));
                this.checkForEquipItem(inventory, data.Items[0].ItemInstanceId);

                this.setState({
                    isBuyingSomething: false,
                });
            }, this.props.onPageError);
        }, this.props.onPageError);
    }

    private checkForEquipItem(inventory: PlayFabClientModels.GetUserInventoryResult, itemInstanceId: string): void {
        const item = inventory.Inventory.find(i => i.ItemInstanceId === itemInstanceId);

        if(is.null(item)) {
            // TODO: Should be impossible
            return;
        }

        const slot = getSlotTypeFromItemClass(item.ItemClass);

        if(is.null(slot)) {
            // No worries, it's not equippable.
            return;
        }

        // Do you have no equipment at all? If so, you're equipping this.
        if(is.null(this.props.appState.equipment)) {
            this.equipItem(item, slot);
            return;
        }

        // Do you already have something in this slot?
        if(!is.null(this.props.appState.equipment[slot])) {
            // You do! No worries.
            return;
        }

        // You don't! Equip this thing.
        this.equipItem(item, slot);
    }

    private equipItem(item: PlayFabClientModels.ItemInstance, slot: EquipmentSlotTypes): void {
        this.props.dispatch(actionSetEquipmentSingle(item, slot));

        CloudScriptHelper.equipItem([{
            itemInstanceId: item.ItemInstanceId,
            slot
        }], this.props.onPageNothing, this.props.onPageError);
    }

    private isValid(): boolean {
        return this.props.appState.hasTitleId && this.props.appState.hasPlayerId;
    }

    private getStore(): PlayFabClientModels.GetStoreItemsResult {
        return is.null(this.state.selectedStore)
            ? null
            : this.props.appState.stores.find(s => s.StoreId === this.state.selectedStore);
    }

    private getStores(): void {
        let stores: PlayFabClientModels.GetStoreItemsResult[] = [];

        this.props.appState.storeNames.forEach(storeId => {
            PlayFabHelper.GetStoreItems(CATALOG_VERSION, storeId, (data) => {
                stores.push(data);

                if(stores.length === this.props.appState.storeNames.length) {
                    stores = stores.sort((a, b) => {
                        if(a.MarketingData.DisplayName < b.MarketingData.DisplayName) {
                            return -1;
                        }
                        else if(a.MarketingData.DisplayName > b.MarketingData.DisplayName) {
                            return 1;
                        }
                        return 0;
                    })
                    this.props.dispatch(actionSetStores(stores));
                }
            }, this.props.onPageError);
        });
    }

    private restorePlayerHP(): void {
        CloudScriptHelper.returnToHomeBase((response) => {
            this.props.dispatch(actionSetPlayerHP(response.maxHP));
            this.setState({
                isRestoringHealth: false,
            });
        }, this.props.onPageError);
    }

    private getLeaderboards = (): void => {
        this.setState({
            leaderboards: null,
            isLoadingLeaderboards: true,
        });

        this.leaderboardStatistics.forEach(statistic => {
            PlayFabHelper.GetLeaderboard(statistic, 0, this.leaderboardCount, (data) => {
                this.setState((prevState) => {
                    if(is.null(prevState.leaderboards)) {
                        return {
                            ...prevState,
                            isLoadingLeaderboards: false,
                            leaderboards: {
                                [statistic]: data
                            }
                        };
                    }

                    return {
                        ...prevState,
                        isLoadingLeaderboards: false,
                        leaderboards: {
                            ...prevState.leaderboards,
                            [statistic]: data,
                        }
                    };
                })
            }, this.props.onPageError);
        });
    }

    private getNews = (): void => {
        this.setState({
            news: null,
            isLoadingNews: true,
        });

        PlayFabHelper.GetTitleNews(this.titleNewsCount, (data) => {
            this.setState({
                news: data,
                isLoadingNews: false,
            });
        }, this.props.onPageError);
    }
}

export const HeadquartersPage = withAppState(withPage(HeadquartersPageBase));
