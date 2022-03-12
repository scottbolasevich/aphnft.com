/* eslint-disable no-console */
'use strict'

import * as React from 'react'

import {Transaction} from 'algosdk'
import { useParams, useHistory } from 'react-router-dom'
import { NumericInput } from '@blueprintjs/core'
import { Button, Box, Container, Image, Text, HStack } from '@chakra-ui/react';

import { 
    getListing, 
    getSuggested, 
    isOptedIntoAsset, 
    sendWait 
} from './lib/algorand'
import {
get_asa_optin_txn
} from './lib/transactions'
import {platform_settings as ps} from './lib/platform-conf'
import {Wallet} from 'algorand-session-wallet'
import {TagToken} from './lib/tags'
import { MAX_LISTING_TAGS, Tagger} from './Tagger'
import { showErrorToaster } from './Toaster'

type ListingViewerProps = {
    history: any
    acct: string
    wallet: Wallet
};


function ListingViewer(props: ListingViewerProps) {

    const history = useHistory();

    const {addr} = useParams();
    const [listing, setListing] = React.useState(undefined);
    const [loading, setLoading] = React.useState(false);
    const [price, setPrice]     = React.useState(0);
    const [updateable, setUpdateable] = React.useState(false)

    React.useEffect(()=>{ getListing(addr).then((listing)=>{ setListing(listing) }) }, [])

    async function handleCancelListing(){
        setLoading(true)
        if(await listing.doDelete(props.wallet)) {
            return history.push("/nft/"+listing.asset_id)
        }
        showErrorToaster("Couldn't cancel listing") 
        setLoading(false)
    }


    async function handleOptIntoAsset(){

        if(props.wallet === undefined) return 

        const addr = props.wallet.getDefaultAccount()

        if(await isOptedIntoAsset(addr, listing.asset_id)) return

        const suggested = await getSuggested(10)
        const optin = new Transaction(get_asa_optin_txn(suggested, addr, listing.asset_id))

        const [signed] = await props.wallet.signTxn([optin])

        const result = await sendWait([signed])
    }

    async function handleBuy(){
        setLoading(true)
        await handleOptIntoAsset()

        if(await listing.doPurchase(props.wallet)){
            return history.push("/nft/"+listing.asset_id)
        }

        showErrorToaster("Failed to complete purchase")
        setLoading(false)
    }

    async function handleAddTag(tag: TagToken){
        setLoading(true)

        if(listing.tags.length<MAX_LISTING_TAGS) {
            await listing.doTag(props.wallet, tag)
            setListing(listing)
        }else{
            showErrorToaster("Can't apply > " + MAX_LISTING_TAGS + " tags")
        }

        setLoading(false)
    }

    async function handleRemoveTag(tag: TagToken){
        setLoading(true)
        await listing.doUntag(props.wallet, tag)
        setListing(listing)
        setLoading(false)
    }

    async function checkSetPrice(price: number){
        setPrice(price)

        if(price==listing.price) setUpdateable(false)
        else setUpdateable(true)
    }

    async function handleUpdatePrice(){
        setLoading(true)

        if (price == 0){ 
            showErrorToaster("Price not changed")
            setLoading(false)
            return
        }

        await listing.doPriceChange(props.wallet, price)
        setListing(listing)
        setLoading(false)
    }


    if(listing !== undefined) {
        let tagsComponent = <div className='container listing-card-tags'>
            {
                listing.tags.map((t)=>{
                    return <Button 
                        key={t.id} 
                        variant='outlined'
                        href={'/tag/'+ t.name}>{t.name}</Button>
                })
            } 
        </div>

        let buttons = <Button loading={loading} disabled={props.wallet===undefined} onClick={handleBuy}>Buy</Button>

        let priceComponent = (
            <Container>
                <p>{listing.price} μAlgos</p>
            </Container>
        )

        if (props.wallet !== undefined && listing.creator_addr == props.wallet.getDefaultAccount()){
            tagsComponent = (
                <Tagger 
                    tagOpts={ps.application.tags} 
                    tags={listing.tags} 
                    handleAddTag={handleAddTag}
                    handleRemoveTag={handleRemoveTag}
                    renderProps={{"fill": false, "disabled":false}}
                    />
            )

            priceComponent = (
                <HStack sx={{ '.bp3-input': { color: 'gray.700' } }}>
                    <NumericInput 
                        onValueChange={checkSetPrice}
                        defaultValue={listing.price} 
                        min={1} 
                        max={10000} 
                    />
                    <Button 
                        onClick={handleUpdatePrice} 
                        disabled={!updateable}>Reprice</Button>
                </HStack>
            )

            buttons = (<Button onClick={handleCancelListing}>Cancel Listing</Button>)
        }

        const deets = listing.nft.metadata
        return (
            <Box>
                <Container className='nft-image'>
                    <Image alt='' src={listing.nft.imgSrc()} />
                </Container>
                <Container pt={4} className='nft-details'>
                    <div className='nft-name'>
                        <p><b>{deets.name}</b> - <i>{deets.properties.artist}</i></p>
                    </div>
                    <div className='nft-id' >
                        <p><a href={listing.nft.explorerSrc()}><b>{listing.asset_id}</b></a></p>
                    </div>
                </Container>
                <Container pt={4} className='listing-description'>
                    <Text>{deets.description}</Text>
                </Container>
                <Container pt={4} className='listing-actions' >
                    <Container p={4} className='listing-tags'>
                        { tagsComponent }
                    </Container>
                    <Container className='listing-buy'>
                        {priceComponent}
                        <div className='listing-buttons'>
                            { buttons }
                        </div>
                    </Container>
                </Container>
            </Box>

        )
    }

    return ( <Container></Container> )
}

export default ListingViewer;