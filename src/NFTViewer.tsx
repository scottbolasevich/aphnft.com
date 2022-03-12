/* eslint-disable no-console */
'use strict'

import * as React from 'react'
import {useParams, useHistory} from 'react-router-dom'
import { tryGetNFT, isOptedIntoApp, getListingAddr } from './lib/algorand'
import { Button, Box, Container, Flex, FormLabel, FormControl, HStack, Image, NumberInput, NumberInputField, Tag, Text} from '@chakra-ui/react';
import { Step, Steps, useSteps } from 'chakra-ui-steps';
import Listing from './lib/listing'
import {Wallet} from 'algorand-session-wallet'
import {NFT} from './lib/nft'
import  {Tagger, MAX_LISTING_TAGS } from './Tagger'
import {Application} from './lib/application'
import {platform_settings as ps} from './lib/platform-conf'
import { ErrorToaster, showErrorToaster, showInfo } from './Toaster'

type NFTViewerProps = {
    history: any
    wallet: Wallet
    acct: string
}

export default function NFTViewer(props: NFTViewerProps) {
    let {id} = useParams();
    let history = useHistory();

    const [nft, setNFT]                = React.useState(NFT.emptyNFT())
    const [waiting_for_tx, setWaiting]        = React.useState(false)
    const [price, setPrice]                   = React.useState(0)
    const [listingVisible, setListingVisible] = React.useState(false)
    const [tags, setTags]                     = React.useState([])
    const [optedIn, setOptedIn]               = React.useState(false)
    const [listingAddr, setListingAddr]       = React.useState("")
    
    React.useEffect(()=>{
        let subscribed = true
        tryGetNFT(parseInt(id))
            .then((nft)=>{  
                if(subscribed) setNFT(nft) 
            })
            .catch((err)=>{ showErrorToaster("Couldn't find that asset") })
        return ()=>{subscribed=false}
    }, []);

    React.useEffect(()=>{
        let subscribed = true
        getListingAddr(parseInt(id))
            .then((addr)=>{  
                if(subscribed) setListingAddr(addr) 
            })
            .catch((err)=>{ console.error("Couldn't check to see if this NFT is listed") })
        return ()=>{subscribed=false}
    }, []);

    React.useEffect(()=>{
        if(props.wallet === undefined) return

        let subscribed = true
        isOptedIntoApp(props.acct)
            .then((oi)=>{ 
                if(subscribed) setOptedIn(oi) 
            }).catch((err)=>{ console.error(err) })
        return ()=>{subscribed=false}

    }, [props.acct])


    function handleCreateListing(){ setListingVisible(true) }
    function handleCancelListing(){ setListingVisible(false) }

    async function deleteToken(e){
        setWaiting(true)

        try {
            await nft.destroyToken(props.wallet)
            history.push("/")
        } catch (error) { showErrorToaster("Couldn't destroy token") }

        setWaiting(false)
    }

    async function handlePriceChange(price){ setPrice(price) }


    async function handleOptIn(): Promise<boolean> {
        if(props.wallet === undefined || optedIn) return false

        showInfo("Creating Transaction to Opt-In to application")

        const app = new Application(ps.application)
        try {
            await app.optIn(props.wallet) 
            return true
        }catch(error){
            showErrorToaster("Failed to opt into Application: "+error.toString())
        }
        return false 
    }

    async function handleSubmitListing(){
        setWaiting(true); 

        try{
            await handleOptIn()

            showInfo("Creating listing transaction")
            console.log("price",price)
            //console.log(" parseInt(id)", parseInt(id))
            //console.log("props.acct",props.acct)
            let priceInt:number=Number(price);
            console.log("priceInt",priceInt)
            const lst = new Listing(priceInt, parseInt(id), props.acct)

            // Trigger popup to get event for signing 
            await lst.doCreate(props.wallet)

            if(tags.length > 0 ){
                showInfo("Adding tags")
                await lst.doTags(props.wallet, tags)
            }
            
            console.log("lst.contract_addr",lst.contract_addr)    
            history.push("/listing/"+lst.contract_addr)

        }catch(error){ 
            showErrorToaster("Failed to create listing: "+error.toString())
        }

        setWaiting(false);
    }

    let editButtons = <div />

    if(listingAddr == "" && props.wallet !== undefined && nft !== undefined && nft.manager === props.wallet.getDefaultAccount()){
        editButtons = (
            <Container>
                <HStack pt={22}>
                    <Button colorScheme='blue' onClick={handleCreateListing}>Create Listing</Button>
                    <Button colorScheme='red' p={2} onClick={deleteToken}>Delete token</Button>
                </HStack>
            </Container>
        )
    }

    const listing_link = listingAddr !== ""?(
        <p>This NFT is listed <a href={ps.domain+"listing/"+listingAddr}><b>here</b></a></p>
    ):<p></p>
    
    const content = (
        <Flex py={4}>
        </Flex>
    );
    const steps = [
        { label: 'Price', content },
        { label: 'Tags', content },
    ];
    const { nextStep, prevStep, reset, activeStep } = useSteps({
        initialStep: 0,
    });
    //const onSubmit = async () => {
    const onSubmit = (data) => {
      handleSubmitListing();
      //console.log("onSubmit");
      //console.log(data);
    };
    return (
        <Container>
            <Box className='nft-card'>
                <Container className='nft-image'>
                    <Image alt='' src={nft.imgSrc()} />
                </Container>
                <Container p={0} pt={4} className='nft-details'>
                    <Container className='nft-name'>
                        <Text><b>{nft.metadata.name}</b> - <i>{nft.metadata.properties.artist}</i></Text>
                    </Container>
                    <Container pt={4} className='nft-token-id'>
                        <Text>ASA: <a href={nft.explorerSrc()}><b>{nft.asset_id}</b></a></Text>
                    </Container>
                </Container>
                <Container pt={4} className='nft-description'>
                    <Text>{ nft.metadata.description }</Text>
                </Container>
                    { editButtons }
                <Container pt={4}>
                    { listing_link }
                </Container>
            </Box>
            {listingVisible == true ? (
            <Container p={8}>
                <Flex flexDir="column" width="100%">
                    <Steps activeStep={activeStep}>
                        {steps.map(({ label }) => (
                        <Step label={label} key={label}>
                            {label === "Price" ? (
                                <ListingDetails tokenId={nft.asset_id} price={price} onPriceChange={handlePriceChange} />
                            ) : (
                                <Container>
                                    <Tagger 
                                        renderProps={{"fill":true}} 
                                        tags={tags} 
                                        tagOpts={ps.application.tags} 
                                        setTags={setTags}
                                        maxTags={MAX_LISTING_TAGS}
                                        />
                                </Container>
                            )}
                        </Step>
                        ))}
                    </Steps>
                    {activeStep === steps.length ? (
                        <Flex p={4}>
                            <ConfirmListingDetails tokenId={nft.asset_id} price={price} tags={tags} />
                            <Button mx="auto" size="sm" onClick={onSubmit}>
                                Submit
                            </Button>
                            <Button mx="auto" size="sm" onClick={reset}>
                                Reset
                            </Button>
                        </Flex>
                    ) : (
                        <Flex width="100%" justify="flex-end">
                        <Button
                            isDisabled={activeStep === 0}
                            mr={4}
                            onClick={prevStep}
                            size="sm"
                            variant="ghost"
                        >
                            Prev
                        </Button>
                        <Button size="sm" onClick={nextStep}>
                            {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                        </Button>
                        </Flex>
                    )}
                </Flex>
            </Container>
            ) : (<Container></Container>)}
        </Container>
    )
}


function ListingDetails(props){
    function handlePriceChange(vnum) {
        props.onPriceChange(vnum)
    }

    return (
        <Container>
            <FormControl>
                <FormLabel htmlFor="input-price">Price in Algos</FormLabel>
                <NumberInput size='s' id='input-price' inputMode={"numeric"} placeholder={"Maximum Price"} defaultValue={props.price} maxW={150} onChange={handlePriceChange}>
                    <NumberInputField />
                </NumberInput>
            </FormControl>
        </Container>
    )
}

function ConfirmListingDetails(props){
    return (
        <Container>
            <h3>Listing:</h3>
            <p><b>Token:</b> {props.tokenId} </p>
            <p><b>Price:</b> {props.price} μAlgos</p> 
            <p><b>Tags:</b> {props.tags.map(t=>{return <Tag key={t.id} round={true} intent='primary'>{t.name}</Tag>})}</p>
        </Container>
    )
}
