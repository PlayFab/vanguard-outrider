import React from "react";
import { is } from "../shared/is";
import { VC_CREDITS, INumberDictionary, ITEM_CLASS_WEAPON, IWeaponItemCustomData, ITEM_CLASS_ARMOR, IArmorItemCustomData } from "../shared/types";
import { DocumentCard, PrimaryButton, DefaultButton } from "office-ui-fabric-react";
import { BackLink } from "./back-link";
import styled, { SpinnerLeft, DivDocumentCardInterior, DlStats } from "../styles";
import { Grid } from "./grid";

const DivItemGrid = styled.div`
    margin-top: ${s => s.theme.size.spacer};
`;

interface IStoreProps {
    titleId: string;
    storeName: string;
    store: PlayFabClientModels.GetStoreItemsResult;
    catalogItems: PlayFabClientModels.CatalogItem[];
    inventory: PlayFabClientModels.ItemInstance[];
    playerWallet: INumberDictionary;
    isBuyingSomething: boolean;
    onBuy: (itemID: string, currency: string, price: number) => void;
    onLeaveStore: () => void;
}

export class Store extends React.PureComponent<IStoreProps> {
    public render(): React.ReactNode {
        return (
            <React.Fragment>
                <BackLink onClick={this.props.onLeaveStore} label="Leave store" />
                <h2>{this.props.storeName}</h2>
                <DivItemGrid>
                    <Grid grid4x4x4 reduce>
                        {this.props.store.Store.map((item, index) => {
                            const catalogItem = this.props.catalogItems.find(c => c.ItemId === item.ItemId);

                            const title = is.null(catalogItem.DisplayName)
                                ? catalogItem.ItemId
                                : catalogItem.DisplayName;

                            const price = item.VirtualCurrencyPrices[VC_CREDITS];
                            const priceLabel = `${price} credits`;

                            return (
                                <DocumentCard key={index}>
                                    <DivDocumentCardInterior>
                                        <h3>{title}</h3>
                                        {this.renderItemStats(catalogItem)}
                                        {this.renderItemButton(item.ItemId, price, priceLabel)}
                                    </DivDocumentCardInterior>
                                </DocumentCard>
                            );
                        })}
                    </Grid>
                </DivItemGrid>
            </React.Fragment>
        );
    }

    private renderItemButton(itemId: string, price: number, priceLabel: string): React.ReactNode {
        if(this.props.isBuyingSomething) {
            return <SpinnerLeft label="Buying..." labelPosition="right" />
        }

        const canBuy = !is.null(this.props.playerWallet) && !is.null(this.props.playerWallet[VC_CREDITS])
                                && this.props.playerWallet[VC_CREDITS] >= price;
        const hasAlready = !is.null(this.props.inventory) && !is.null(this.props.inventory.find(i => i.ItemId === itemId));

        if(hasAlready) {
            return <DefaultButton text="Owned" disabled />;
        }

        if(canBuy) {
            return <PrimaryButton onClick={this.props.onBuy.bind(this, itemId, VC_CREDITS, price)} text={priceLabel} />;
        }

        return <DefaultButton text={priceLabel} disabled />;
    }

    private renderItemStats(catalogItem: PlayFabClientModels.CatalogItem): React.ReactNode {
        if(is.null(catalogItem.CustomData)) {
            return null;
        }

        const isWeapon = !is.null(catalogItem.ItemClass) && catalogItem.ItemClass === ITEM_CLASS_WEAPON;
        const isArmor = !is.null(catalogItem.ItemClass) && catalogItem.ItemClass === ITEM_CLASS_ARMOR;

        if(isWeapon) {
            const customData = JSON.parse(catalogItem.CustomData) as IWeaponItemCustomData;

            if(is.null(customData.damage)) {
                return null;
            }

            return (
                <DlStats>
                    <dt>Damage</dt>
                    <dd>{customData.damage}</dd>
                </DlStats>
            );
        }

        if(isArmor) {
            const customData = JSON.parse(catalogItem.CustomData) as IArmorItemCustomData;

            if(is.null(customData.block) || is.null(customData.reduce)) {
                return null;
            }

            return (
                <DlStats>
                    <dt>Block damage</dt>
                    <dd>&lt; {customData.block}</dd>
                    <dt>Reduces damage</dt>
                    <dd>{customData.reduce}%</dd>
                </DlStats>
            );
        }

        return null;
    }
}
