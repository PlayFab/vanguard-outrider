import React from "react";
import { RouteComponentProps, Link } from "react-router-dom";

import { Page } from "../components/page";
import { IWithAppStateProps, withAppState } from "../containers/with-app-state";
import styled, { DlStats } from "../styles";
import { BackLink } from "../components/back-link";
import { routes } from "../routes";
import { utilities } from "../shared/utilities";
import { Grid } from "../components/grid";

const DivWrapper = styled.div`
    margin-top: ${s => s.theme.size.spacer2};
`;

type Props = RouteComponentProps & IWithAppStateProps;

class TipsPageBase extends React.Component<Props> {
    public render(): React.ReactNode {
        const { titleId, cloud } = this.props.appState;
        return (
            <Page {...this.props} title="LiveOps Tips">
                <BackLink to={routes.MainMenu(this.props.appState.cloud, this.props.appState.titleId)} label="Back to main menu" />
                <h2>Use of CustomID</h2>
                <Grid grid6x6>
                    <React.Fragment>
                        <p>This game uses <a href="https://api.playfab.com/documentation/client/method/LoginWithCustomID">LoginWithCustomID</a> for its authentication, where players can type the CustomID they want to use to login. This allows anyone to login as anyone else! It's not a secure way to do logins on the web.</p>
                        <p>As you make a real game with PlayFab, you should consider our alternate methods. We have a <a href="https://api.playfab.com/documentation/client#Authentication">wide range of authentication options</a> for all console and mobile platforms.</p>
                        <p>We recommend using the console or mobile-specific login native to the player's device so you get the full suite of data when they login.</p>
                    </React.Fragment>
                    <React.Fragment>
                        <h3>Platform-specific authentication options</h3>
                        <ul>
                            <li><a href="https://api.playfab.com/documentation/client/method/LoginWithGoogleAccount">LoginWithGoogleAccount</a> (Android)</li>
                            <li><a href="https://api.playfab.com/documentation/client/method/LoginWithGameCenter">LoginWithGameCenter</a> (iOS)</li>
                            <li><a href="https://api.playfab.com/documentation/client/method/LoginWithNintendoSwitchDeviceId">LoginWithNintendoSwitchDeviceId</a></li>
                            <li><a href="https://api.playfab.com/documentation/client/method/LoginWithPSN">LoginWithPSN</a></li>
                            <li><a href="https://api.playfab.com/documentation/client/method/LoginWithSteam">LoginWithSteam</a></li>
                            <li><a href="https://api.playfab.com/documentation/client/method/LoginWithWindowsHello">LoginWithWindowsHello</a></li>
                            <li><a href="https://api.playfab.com/documentation/client/method/LoginWithXbox">LoginWithXbox</a></li>
                            <li><a href="https://api.playfab.com/documentation/client#Authentication"><strong>All authentication options &raquo;</strong></a></li>
                        </ul>
                    </React.Fragment>
                </Grid>
                <DivWrapper>
                    <h2>Data locations</h2>
                    <p>Where to find the data that drives this game. Any changes to title data, catalogs, or store names will require the user to login again.</p>
                    <Grid grid6x6>
                        <DlStats>
                            <dt>Planets and areas</dt>
                            <dd><a href={utilities.createPlayFabLink(cloud, titleId, "content/title-data", true)} aria-label="View planets and areas in title data under the 'planets' key">Title data</a> under the "Planets" key</dd>
                            
                            <dt>Enemies</dt>
                            <dd><a href={utilities.createPlayFabLink(cloud, titleId, "content/title-data", true)} aria-label="View enemies in title data under the 'enemies' key">Title data</a> under the "Enemies" key</dd>
                            
                            <dt>Weapons and armor</dt>
                            <dd><a href={utilities.createPlayFabLink(cloud, titleId, "economy/catalogs/TWFpbg%3d%3d/items", false)}>Main catalog &gt; Items</a></dd>
                            
                            <dt>Weapons and armor prices</dt>
                            <dd><a href={utilities.createPlayFabLink(cloud, titleId, "economy/catalogs/TWFpbg%3d%3d/stores", false)}>Main catalog &gt; Stores</a> can be used to set prices for each item in each store</dd>
                            
                            <dt>Available stores</dt>
                            <dd>Creating a store in the catalog doesn't make it visible. Add its ID to <a href={utilities.createPlayFabLink(cloud, titleId, "content/title-data", true)} aria-label="View available stores in title data under the 'stores' key">title data</a> under the "Stores" key, for it to show up in the list at Headquarters.</dd>
                            
                            <dt>Combat reward item chances</dt>
                            <dd><a href={utilities.createPlayFabLink(cloud, titleId, "economy/catalogs/TWFpbg%3d%3d/drop-tables", false)}>Main catalog &gt; Drop tables</a>, whose table IDs will match the "droptable" field in a planet area</dd>
                        </DlStats>
                        <DlStats>
                            <dt>Combat reward credit amounts</dt>
                            <dd><a href={utilities.createPlayFabLink(cloud, titleId, "economy/catalogs/TWFpbg%3d%3d/bundles", false)}>Main catalog &gt; Bundles</a>, where you can adjust the quantity of credits given out in each pack</dd>
                            
                            <dt>Starting credits</dt>
                            <dd><a href={utilities.createPlayFabLink(cloud, titleId, "economy/currency", true)}>Currencies</a>, the "initial deposit" field</dd>
                            
                            <dt>News articles</dt>
                            <dd><a href={utilities.createPlayFabLink(cloud, titleId, "content/news", true)}>Title news</a>, use the <Link to={routes.Generator(cloud, titleId)}>generator</Link> to make valid news entries</dd>
                            
                            <dt>Level curve</dt>
                            <dd>Use the level editor on the <Link to={routes.Generator(cloud, titleId)}>generator</Link> page or edit the JSON directly and place it in <a href={utilities.createPlayFabLink(cloud, titleId, "content/title-data", true)} aria-label="View level curve settings in title data under the 'levels' key">title data</a> under the "Levels" key</dd>
                            
                            <dt>Login event, combat finished event, return to Headquarters event</dt>
                            <dd><a href={utilities.createPlayFabLink(cloud, titleId, "automation/cloud-script/revisions", true)}>Cloud Script</a>, though you should try and <a href="https://github.com/PlayFab/vanguard-outrider/blob/master/source/cloud-script/main.ts">build the original source</a> rather than editing JavaScript directly. See the readme.md file for <a href="https://github.com/PlayFab/vanguard-outrider/blob/master/README.md">instructions on how to build Cloud Script from this repository</a>.</dd>
                        </DlStats>
                    </Grid>
                </DivWrapper>
                <DivWrapper>
                    <h2>What happens when</h2>
                    <p>These are the events which cause data to be sent to PlayFab.</p>
                    <Grid grid6x6>
                        <DlStats>
                            <dt>Player logs in</dt>
                            <dd>1. Happens in <a href="https://github.com/PlayFab/vanguard-outrider/blob/master/source/app/pages/login.tsx#L83">login.tsx</a></dd>
                            <dd>2. Calls <a href="https://api.playfab.com/documentation/client/method/LoginWithCustomID">LoginWithCustomID</a></dd>
                            <dd>3. If a new player, calls <a href="https://api.playfab.com/documentation/Client/method/UpdateUserTitleDisplayName">UpdateUserTitleDisplayName</a></dd>
                            <dd>4. Runs <a href="https://github.com/PlayFab/vanguard-outrider/blob/master/source/cloud-script/main.ts#L315">playerLogin</a> Cloud Script function, which returns player HP, XP, level, inventory, and equipped items</dd>
                            <dd>5. Calls <a href="https://api.playfab.com/documentation/Client/method/GetTitleData">GetTitleData</a> to load planets, enemies, and stores</dd>
                            <dd>6. Calls <a href="https://api.playfab.com/documentation/Client/method/GetCatalogItems">GetCatalogItems</a> to load all items in the catalog, necessary for determining weapon and armor stats</dd> 

                            <dt>Equip an item</dt>
                            <dd>1. Happens in <a href="https://github.com/PlayFab/vanguard-outrider/blob/master/source/app/components/player.tsx#L216">player.tsx</a> and <a href="https://github.com/PlayFab/vanguard-outrider/blob/master/source/app/pages/headquarters.tsx#L307">headquarters.tsx</a></dd>
                            <dd>2. Runs <a href="https://github.com/PlayFab/vanguard-outrider/blob/master/source/cloud-script/main.ts#L426">equipItem</a> Cloud Script function</dd>

                            <dt>Goes to Headquarters</dt>
                            <dd>1. Happens in <a href="https://github.com/PlayFab/vanguard-outrider/blob/master/source/app/pages/headquarters.tsx#L75">headquarters.tsx</a></dd>
                            <dd>2. Calls <a href="https://api.playfab.com/documentation/Client/method/GetStoreItems">GetStoreItems</a> to retrieve the store inventories</dd>
                            <dd>3. Runs <a href="https://github.com/PlayFab/vanguard-outrider/blob/master/source/cloud-script/main.ts#L395">returnToHomeBase</a> Cloud Script function</dd>
                            <dd>4. Calls <a href="https://api.playfab.com/documentation/Client/method/GetLeaderboard">GetLeaderboard</a></dd>
                            <dd>5. Calls <a href="https://api.playfab.com/documentation/Client/method/GetTitleNews">GetTitleNews</a></dd>
                        </DlStats>
                        <DlStats>
                            <dt>Buys an item from a store</dt>
                            <dd>1. Happens in <a href="https://github.com/PlayFab/vanguard-outrider/blob/master/source/app/pages/headquarters.tsx#L281">headquarters.tsx</a></dd>
                            <dd>2. Calls <a href="https://api.playfab.com/documentation/Client/method/PurchaseItem">PurchaseItem</a> to buy the item using the Credits virtual currency at the store price</dd>
                            <dd>3. If successful, calls <a href="https://api.playfab.com/documentation/Client/method/GetUserInventory">GetUserInventory</a></dd>
                            <dd>4. Attempts to equip the weapon or armor if it's the only weapon or armor the player owns</dd>

                            <dt>Wins combat</dt>
                            <dd>1. Happens in <a href="https://github.com/PlayFab/vanguard-outrider/blob/master/source/app/pages/planet.tsx#L170">planet.tsx</a></dd>
                            <dd>2. Runs <a href="https://github.com/PlayFab/vanguard-outrider/blob/master/source/cloud-script/main.ts#L183">killedEnemyGroup</a> Cloud Script function, which returns the updated player HP, XP, and level</dd>
                            <dd>3. If items were granted from combat, calls <a href="https://api.playfab.com/documentation/Client/method/GetUserInventory">GetUserInventory</a></dd>
                        </DlStats>
                    </Grid>
                </DivWrapper>
                <DivWrapper>
                    <h2>LiveOps ideas</h2>
                    <p>This game was designed to be populated and run directly from data sent to the PlayFab Admin API. It's possible to add more functionality via <a href={utilities.createPlayFabLink(cloud, titleId, "dashboard", false)}>Game Manager</a>.</p>
                    <Grid grid6x6>
                        <DlStats>
                            <dt>Higher-level stores</dt>
                            <dd>
                                <a href={utilities.createPlayFabLink(cloud, titleId, "segments", true)}>Segments</a> can be used to grant access to hidden stores based on player statistics.
                                <ol>
                                    <li>Create a segment called "Level 5+ Players", set the first filter to "[Statistic value] [level] [is greater than or equal to] 5 [latest version]".</li>
                                    <li>Go to <a href={utilities.createPlayFabLink(cloud, titleId, "economy/catalogs/TWFpbg%3d%3d/stores", false)}>stores</a>, and create a new store with whatever items or prices you like.</li>
                                    <li>Go to the Weapons store, scroll down to <strong>Segment overrides</strong>, find the "Level 5+ Players" segment, and select your new store in the dropdown.</li>
                                    <li>Drag that override to the top of the segment override list, then click <strong>Save store</strong>.</li>
                                    <li>When a level 5 (or above) player goes to Headquarters and opens the Weapons store, they will see this new store you created.</li>
                                    <li>Congratulations, you're now using player segmentation!</li>
                                </ol>
                            </dd>
                        </DlStats>
                        <DlStats>
                            <dt>Grant weapons and armor after combat</dt>
                            <dd>Adding an item to a catalog doesn't mean the user will see it. You can make special weapons that drop after boss encounters.
                                <ol>
                                    <li><a href={utilities.createPlayFabLink(cloud, titleId, "economy/catalogs/TWFpbg%3d%3d/items/new", false)}>Create a new item</a>, give it the "weapon" class and put some damage stats in its custom data field, e.g. <code>{`{"damage":25}`}</code></li>
                                    <li><a href={utilities.createPlayFabLink(cloud, titleId, "economy/catalogs/TWFpbg%3d%3d/bundles", false)}>Open an existing bundle</a> and use the <strong>Add to bundle</strong> item to add your new weapon</li>
                                    <li>That weapon will be granted to the player when they defeat an enemy group whose drop table includes that bundle</li>
                                </ol>
                            </dd>
                        </DlStats>
                    </Grid>
                </DivWrapper>
            </Page>
        );
    }
}

export const TipsPage = withAppState(TipsPageBase);