import React from "react";
import { RouteComponentProps, Link } from "react-router-dom";

import { Page } from "../components/page";
import { IWithAppStateProps, withAppState } from "../containers/with-app-state";
import { BackLink } from "../components/back-link";
import { routes } from "../routes";
import styled from "../styles";

import ImgStep1a from "../../../static/img/instructions/step1a.png";
import ImgStep2a from "../../../static/img/instructions/step2a.png";
import ImgStep2b from "../../../static/img/instructions/step2b.png";
import ImgStep3a from "../../../static/img/instructions/step3a.png";
import ImgStep4a from "../../../static/img/instructions/step4a.png";
import ImgStep5a from "../../../static/img/instructions/step5a.png";
import ImgStep5b from "../../../static/img/instructions/step5b.png";
import ImgStep5c from "../../../static/img/instructions/step5c.png";
import ImgStep6a from "../../../static/img/instructions/step6a.png";
import ImgStep6b from "../../../static/img/instructions/step6b.png";
import ImgStep7a from "../../../static/img/instructions/step7a.png";
import ImgStep8a from "../../../static/img/instructions/step8a.png";
import ImgStep8b from "../../../static/img/instructions/step8b.png";
import ImgStep9a from "../../../static/img/instructions/step9a.png";
import ImgStep9b from "../../../static/img/instructions/step9b.png";
import ImgStep9c from "../../../static/img/instructions/step9c.png";
import ImgStep10a from "../../../static/img/instructions/step10a.png";
import ImgStep10b from "../../../static/img/instructions/step10b.png";
import ImgStep10c from "../../../static/img/instructions/step10c.png";
import ImgStep11a from "../../../static/img/instructions/step11a.png";
import ImgStep11b from "../../../static/img/instructions/step11b.png";
import ImgStep11c from "../../../static/img/instructions/step11c.png";
import ImgStep12a from "../../../static/img/instructions/step12a.png";
import ImgStep12b from "../../../static/img/instructions/step12b.png";
import ImgStep12c from "../../../static/img/instructions/step12c.png";
import ImgStep13a from "../../../static/img/instructions/step13a.png";
import ImgStep13b from "../../../static/img/instructions/step13b.png";
import ImgStep13c from "../../../static/img/instructions/step13c.png";
import ImgStep14a from "../../../static/img/instructions/step14a.png";
import { Grid } from "../components/grid";

const OlInstructions = styled.ol`
    margin: ${s => s.theme.size.spacer2} ${s => s.theme.size.spacer} ${s => s.theme.size.spacer} 0;
    padding: 0;
    list-style: none;

    > li {
        padding: 0 ${s => s.theme.size.spacer2} ${s => s.theme.size.spacer2} 0;
        margin: 0 0 ${s => s.theme.size.spacer2} 0;
        border-bottom: 2px solid ${s => s.theme.color.border200};
        
        &:last-child {
            margin-bottom: 0;
            border-bottom: 0;
        }
    }
`;

const UlImages = styled.ul`
    margin: 0;
    padding: 0;
    list-style: none;

    > li {
        margin-bottom: ${s => s.theme.size.spacer};

        &:last-child {
            margin-bottom: 0;
        }
    }

    img {
        max-width: 100%;
        border: 2px solid ${s => s.theme.color.border200};
    }
`;

type Props = RouteComponentProps & IWithAppStateProps;

class InstructionsPageBase extends React.Component<Props> {
    public render(): React.ReactNode {
        return (
            <Page {...this.props} title="Instructions">
                <BackLink to={routes.Index("")} label="Back to home page" />
                <h2>How To Use This Website</h2>
                <p>This website lets you populate an empty PlayFab title with data.</p>
                <p>It also lets you create players and play a simulation of a shooter game to test PlayFab's LiveOps features.</p>

                <OlInstructions>
                    <li>
                        <Grid grid6x6>
                            <React.Fragment>
                                <h3>1. Sign up for PlayFab</h3>
                                <p><a href="https://developer.playfab.com/" target="_blank">Sign up for a PlayFab account</a>. You will need to verify your email address.</p>
                                <p>If you already have a PlayFab account, <a href="https://developer.playfab.com/en-US/login" target="_blank">log in</a> and create an empty title on your studio.</p></React.Fragment>
                            <React.Fragment>
                                <UlImages>
                                    <li><a href={ImgStep1a}><img src={ImgStep1a} alt="PlayFab's My Studios and Titles page, showing how to create a new title by clicking the three dots to the right of a studio header" /></a></li>
                                </UlImages>
                            </React.Fragment>
                        </Grid>
                    </li>
                    <li>
                        <Grid grid6x6>
                            <React.Fragment>
                                <h3>2. Find your title ID</h3>
                                <p>Your title ID is a 4+ alphanumeric code that uniquely identifies your title.</p>
                                <p>It appears below the name on the My Studios and Titles page, as well as the browser's address bar.</p></React.Fragment>
                            <React.Fragment>
                                <UlImages>
                                    <li><a href={ImgStep2a}><img src={ImgStep2a} alt="PlayFab's My Studios and Titles page, showing a title and its ID" /></a></li>
                                    <li><a href={ImgStep2b}><img src={ImgStep2b} alt="A browser's address bar, showing the title ID" /></a></li>
                                </UlImages>
                            </React.Fragment>
                        </Grid>
                    </li>
                    <li>
                        <Grid grid6x6>
                            <React.Fragment>
                                <h3>3. Enter your title ID on the Vanguard Outrider home page</h3>
                                <p>Go to the <Link to={routes.Index("")}>Vanguard Outrider home page</Link> and enter your title ID in the text field, then click <strong>Continue</strong>.</p>
                            </React.Fragment>
                            <React.Fragment>
                                <UlImages>
                                    <li><a href={ImgStep3a}><img src={ImgStep3a} alt="The Vanguard Outrider home page, showing title ID 2D8C6 in the title ID text field" /></a></li>
                                </UlImages>
                            </React.Fragment>
                        </Grid>
                    </li>
                    <li>
                        <Grid grid6x6>
                            <React.Fragment>
                                <h3>4. Go to the upload data page</h3>
                                <p>If this is a new title, click the <strong>Upload data</strong> button.</p>
                                <p>Otherwise, proceed to step 7.</p>
                            </React.Fragment>
                            <React.Fragment>
                                <UlImages>
                                    <li><a href={ImgStep4a}><img src={ImgStep4a} alt="The Vanguard Outrider main menu, showing the First time header and the Upload data button" /></a></li>
                                </UlImages>
                            </React.Fragment>
                        </Grid>
                    </li>
                    <li>
                        <Grid grid6x6>
                            <React.Fragment>
                                <h3>5. Enter your secret key</h3>
                                <p>Use the <strong>Settings &gt; Secret Keys</strong> link on this page to go to your title's Secret Keys page.</p>
                                <p>Copy the default secret key.</p>
                                <p>Go back to Vanguard Outrider and paste the secret key into the text field, then click the <strong>Begin upload</strong> button.</p>
                            </React.Fragment>
                            <React.Fragment>
                                <UlImages>
                                    <li><a href={ImgStep5a}><img src={ImgStep5a} alt="The Vanguard Outrider Upload Data page, showing the instructions and highlighting the Settings > Secret Keys link" /></a></li>
                                    <li><a href={ImgStep5b}><img src={ImgStep5b} alt="The PlayFab Secret Keys page, showing the table and highlighting the secret key in the fourth column" /></a></li>
                                    <li><a href={ImgStep5c}><img src={ImgStep5c} alt="The Vanguard Outrider Upload Data page, showing the secret key pasted into the text field" /></a></li>
                                </UlImages>
                            </React.Fragment>
                        </Grid>
                    </li>
                    <li>
                        <Grid grid6x6>
                            <React.Fragment>
                                <h3>6. Wait while the title is populated with data</h3>
                                <p>It should take less than 10 seconds to populate your title.</p>
                                <p>If you encounter an error, reload the page and try again. It's safe to run the upload multiple times.</p>
                                <p>When it's done, click the <strong>Play game</strong> button.</p>
                            </React.Fragment>
                            <React.Fragment>
                                <UlImages>
                                    <li><a href={ImgStep6a}><img src={ImgStep6a} alt="The Vanguard Outrider Upload Data page, showing the instructions and highlighting the Settings > Secret Keys link" /></a></li>
                                    <li><a href={ImgStep6b}><img src={ImgStep6b} alt="The PlayFab Secret Keys page, showing the table and highlighting the secret key in the fourth column" /></a></li>
                                </UlImages>
                            </React.Fragment>
                        </Grid>
                    </li>
                    <li>
                        <Grid grid6x6>
                            <React.Fragment>
                                <h3>7. Create a player</h3>
                                <p>Enter a name to create a player, then click <strong>Login</strong>.</p>
                                <p>If you enter a name that's been used before on this title, you will resume their game.</p>
                            </React.Fragment>
                            <React.Fragment>
                                <UlImages>
                                    <li><a href={ImgStep7a}><img src={ImgStep7a} alt="The Vanguard Outrider Login page, showing the sample player name of 'Master Chief'" /></a></li>
                                </UlImages>
                            </React.Fragment>
                        </Grid>
                    </li>
                    <li>
                        <Grid grid6x6>
                            <React.Fragment>
                                <h3>8. Go to headquarters</h3>
                                <p>The game loop of Vanguard Outrider is: shoot bad guys &gt; get money &gt; buy better weapons and armor &gt; use weapons and armor to shoot more bad guys.</p>
                                <p>You may click the name of your player (here, "Master Chief") to go directly to that player's Overview page in PlayFab. From there you can watch the player's actions in the PlayStream tab.</p>
                                <p>If this is a new player, you will need to begin by buying a weapon.</p>
                                <p>Click on the <strong>Headquarters</strong> button.</p>
                            </React.Fragment>
                            <React.Fragment>
                                <UlImages>
                                    <li><a href={ImgStep8a}><img src={ImgStep8a} alt="The Vanguard Outrider Destiantions page, showing the Headquarters button" /></a></li>
                                    <li><a href={ImgStep8b}><img src={ImgStep8b} alt="The PlayFab Player PlayStream page for the Master Chief player" /></a></li>
                                </UlImages>
                            </React.Fragment>
                        </Grid>
                    </li>
                    <li>
                        <Grid grid6x6>
                            <React.Fragment>
                                <h3>9. Buy a weapon</h3>
                                <p>Click on the <strong>Weapons for Warriors</strong> shop. The only weapon you can buy is a <strong>Laser Sword</strong>, so buy that.</p>
                                <p>The game automatically equips the weapon you bought.</p>
                                <p>Don't forget to check out your player's PlayStream page to see these events happen in real time.</p>
                            </React.Fragment>
                            <React.Fragment>
                                <UlImages>
                                    <li><a href={ImgStep9a}><img src={ImgStep9a} alt="The Vanguard Outrider headquarters page, highlighting the Weapons for Warriors store" /></a></li>
                                    <li><a href={ImgStep9b}><img src={ImgStep9b} alt="The Weapons for Warriors store, with the Laser Sword weapon highlighted for 50 credits" /></a></li>
                                    <li><a href={ImgStep9c}><img src={ImgStep9c} alt="The PlayFab Player PlayStream page for the Master Chief player showing the purchase of an item" /></a></li>
                                </UlImages>
                            </React.Fragment>
                        </Grid>
                    </li>
                    <li>
                        <Grid grid6x6>
                            <React.Fragment>
                                <h3>10. Leave headquarters and go to Earth</h3>
                                <p>Click <strong>Leave store</strong> once you've bought a weapon, then <strong>Back to guide</strong> to see the list of destinations.</p>
                                <p>The battles are harder on planets further to the right. Choose <strong>Earth</strong> for a safe start.</p>
                            </React.Fragment>
                            <React.Fragment>
                                <UlImages>
                                    <li><a href={ImgStep10a}><img src={ImgStep10a} alt="The Vanguard Outrider headquarters page, highlighting the Weapons for Warriors store" /></a></li>
                                    <li><a href={ImgStep10b}><img src={ImgStep10b} alt="The Weapons for Warriors store, with the Laser Sword weapon highlighted for 50 credits" /></a></li>
                                    <li><a href={ImgStep10c}><img src={ImgStep10c} alt="The PlayFab Player PlayStream page for the Master Chief player showing the purchase of an item" /></a></li>
                                </UlImages>
                            </React.Fragment>
                        </Grid>
                    </li>
                    <li>
                        <Grid grid6x6>
                            <React.Fragment>
                                <h3>11. Select a region, then fight</h3>
                                <p>The enemies you face are randomized every time you click on a region. Try retreating until you see an encounter with 2 enemies.</p>
                                <p>Click <strong>Fire!</strong> under an enemy to attack them with your equipped weapon.</p>
                                <p>It's best to focus on one enemy at a time.</p>
                            </React.Fragment>
                            <React.Fragment>
                                <UlImages>
                                    <li><a href={ImgStep11a}><img src={ImgStep11a} alt="The Vanguard Outrider headquarters page, highlighting the Weapons for Warriors store" /></a></li>
                                    <li><a href={ImgStep11b}><img src={ImgStep11b} alt="The Weapons for Warriors store, with the Laser Sword weapon highlighted for 50 credits" /></a></li>
                                    <li><a href={ImgStep11c}><img src={ImgStep11c} alt="The PlayFab Player PlayStream page for the Master Chief player showing the purchase of an item" /></a></li>
                                </UlImages>
                            </React.Fragment>
                        </Grid>
                    </li>
                    <li>
                        <Grid grid6x6>
                            <React.Fragment>
                                <h3>12. Win the battle</h3>
                                <p>If you focus on one enemy at a time, you should win the battle.</p>
                                <p>You will receive some credits and experience points. Once you reach a certain number of experience points you will gain a level, which refills and increases your hit points (HP). Having more HP will let you fight tougher enemies that hit harder and have greater rewards.</p>
                                <p>Click the <strong>Return to Earth</strong> button if you'd like to continue fighting on Earth or go back to headquarters.</p>
                                <p>Be sure to check the player's PlayStream page to see the battle events appear.</p>
                            </React.Fragment>
                            <React.Fragment>
                                <UlImages>
                                    <li><a href={ImgStep12a}><img src={ImgStep12a} alt="The Vanguard Outrider battle page, showing a fight with two Cyberbirds" /></a></li>
                                    <li><a href={ImgStep12b}><img src={ImgStep12b} alt="The Vanguard Outrider victory page, showing the 50 XP gained and the player's reward of a 'Big credit pack'" /></a></li>
                                    <li><a href={ImgStep12c}><img src={ImgStep12c} alt="The PlayFab Player PlayStream page for the Master Chief player showing the five events that happened after the battle" /></a></li>
                                </UlImages>
                            </React.Fragment>
                        </Grid>
                    </li>
                    <li>
                        <Grid grid6x6>
                            <React.Fragment>
                                <h3>13. Rest at headquarters, then go back out into the solar system</h3>
                                <p>It's best to go back to headquarters after every fight. That will restore your HP to full.</p>
                                <p>Continue to defeat enemies and you will be able to afford better weapons and armor. After buying multiple types of items you may equip them using the inventory button at the top right. Click on an item to equip it.</p>
                                <p>You should see your player on the leaderboards in headquarters.</p>
                            </React.Fragment>
                            <React.Fragment>
                                <UlImages>
                                    <li><a href={ImgStep13b}><img src={ImgStep13b} alt="The Vanguard Outrider headquarters page, showing the inventory button" /></a></li>
                                    <li><a href={ImgStep13c}><img src={ImgStep13c} alt="The Vanguard Outrider equipment popup, showing the player with a Laser Sword equipped and a Plasma Rifle available" /></a></li>
                                    <li><a href={ImgStep13a}><img src={ImgStep13a} alt="The Vanguard Outrider headquarters page, showing the 'Master Chief' player at the top of the 'kills' leaderboard" /></a></li>
                                </UlImages>
                            </React.Fragment>
                        </Grid>
                        
                    </li>
                    <li>
                        <Grid grid6x6>
                            <React.Fragment>
                                <h3>More ideas</h3>
                                <p><Link to={routes.Index("")}>Enter a title ID</Link> and check our LiveOps Tips page for ideas on how to modify your title and see those changes reflected in the game.</p>
                                <p>You can also create Title News articles for players to read.</p>
                                <p>Have fun, and thanks for using <a href="https://www.playfab.com/">PlayFab</a>!</p>
                            </React.Fragment>
                            <React.Fragment>
                                <UlImages>
                                    <li><a href={ImgStep14a}><img src={ImgStep14a} alt="The Vanguard Outrider main menu, highlighting the LiveOps tips page button" /></a></li>
                                </UlImages>
                            </React.Fragment>
                        </Grid>
                    </li>
                </OlInstructions>
            </Page>
        );
    }
}

export const InstructionsPage = withAppState(InstructionsPageBase);