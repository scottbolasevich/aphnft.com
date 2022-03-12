/* eslint-disable no-console */
'use strict'

import * as React from 'react'
import { ChangeEvent, useEffect, useState } from 'react'
import { useHistory, useParams, useLocation } from 'react-router-dom'
import { getListings } from './lib/algorand'
import { ListingCard } from './ListingCard'
import { Wallet } from 'algorand-session-wallet'
import {
    Grid,
    Center,
    Container,
    Select,
    Text,
    Stack,
    NumberInputField,
    NumberInput,
    FormLabel,
    HStack
  } from "@chakra-ui/react";
  import {
    Table,
    Thead,
    Tbody,
    Button,
    Heading,
    Tr,
    Th,
    Td,
    TableCaption,
    Spinner,
    useToast
  } from "@chakra-ui/react";
  import Pagination from "@choc-ui/paginator";

type BrowserProps = {
    history: any
    wallet: Wallet 
    acct: string
};

export default function Browser(props: BrowserProps) {

    ////START



    ////END
    const {tag} = useParams()
    const filters = new URLSearchParams(useLocation().search)
    const history = useHistory()

    const [listings, setListings] = React.useState([]);
    const [loaded, setLoaded] = React.useState(false)

    let max=0
    if(filters.has('max-price')){ max = parseInt(filters.get("max-price")) }
    let min=0
    if(filters.has('min-price')){ min = parseInt(filters.get("min-price")) }

    const [maxPrice, setMaxPrice] = React.useState(max)
    const [minPrice, setMinPrice] = React.useState(min)
    const [filtersChanged, setFiltersChanged] = React.useState(true)


    React.useEffect(()=>{
        let subscribed = true
        if(!loaded && filtersChanged)
            getListings(tag, minPrice, maxPrice).then((l)=>{ 
                if(!subscribed) return
                console.log("getListings", l)
                setLoaded(true)
                setListings(l) 
                setFiltersChanged(false)
            })

        return ()=>{subscribed = false}
    }, [filtersChanged])

    function updateMaxPrice(val){ setMaxPrice(val) }
    function updateMinPrice(val){ setMinPrice(val) }

    function filterListings() { 
        const tagPath = tag?"tag/"+tag:""

        history.push("/explore/"+tagPath+"?min-price="+minPrice+"&max-price="+maxPrice) 
        setLoaded(false)
        setFiltersChanged(true)
    }

    let l = listings.map((l) => { return (<ListingCard key={l.contract_addr} listing={l} />) }) 

    if(!loaded){
        l = [<h3 key='none' >Searching for listings...</h3>]
    }

    if(loaded && listings.length == 0){
        l = [<h3 key='none' >No Listings... <a href='/mint'>mint</a> one?</h3>]
    }

    // Only allow filtering by price if no tag is chosen
    const priceFilter = tag===undefined?(
        <Container p={2} maxW='container.xl'>
            <Center>
                <HStack>
                    <FormLabel>Minimum Price</FormLabel>
                    <NumberInput size='s' defaultValue={minPrice} maxW={150} min={0} max={999999999} onChange={updateMinPrice}>
                        <NumberInputField placeholder={"Minimum Price"} />
                    </NumberInput>
                    <FormLabel>Maximum price</FormLabel>
                    <NumberInput size='s' defaultValue={maxPrice} maxW={150} min={0} max={999999999} onChange={updateMaxPrice}>
                        <NumberInputField placeholder={"Maximum Price"} />
                    </NumberInput>
                    <Button colorScheme='blue' onClick={filterListings}>Filter</Button>
                </HStack>
            </Center>
        </Container>
    ):<Container></Container>

    return (
        <Stack spacing={3}>
            {priceFilter}
            <Grid
            gap={3}
            mt={20}
            px={20}
            templateColumns="repeat(5, 1fr)"
            templateRows="repeat(2, 1fr)"
            >
                { l }
            </Grid>
        </Stack>
    )
}