/* eslint-disable no-console */
'use strict'

import * as React from 'react'
import { forwardRef } from "react"
import { useHistory, useParams, useLocation } from 'react-router-dom'
import { getListings } from './lib/algorand'
import { ListingCard } from './ListingCard'
import { Wallet } from 'algorand-session-wallet'
import {
    Box,
    Button,
    Grid,
    GridItem,
    Center,
    Container,
    Select,
    Text,
    Flex,
    Stack,
    NumberInputField,
    NumberInput,
    FormLabel,
    HStack,
    Table,
    Thead,
    Tbody,
    Heading,
    Tr,
    Th,
    Td,
    TableCaption,
    Spinner,
    useToast,
    useBreakpointValue
  } from "@chakra-ui/react";
  import Pagination from "@choc-ui/paginator";

type BrowserProps = {
    history: any
    wallet: Wallet 
    acct: string
};

export default function Browser(props: BrowserProps) {

    const {tag} = useParams()
    const filters = new URLSearchParams(useLocation().search)
    const history = useHistory()
    const colSpan = useBreakpointValue({ base: 5, md: 1})
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
                setLoading(false)
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
    ////START
    const toast = useToast();
    //const [data, setData] = React.useState([]);
    
    const [loading, setLoading] = React.useState(true);
    const [current, setCurrent] = React.useState(1);
    const pageSize = 10;
    const offset = (current - 1) * pageSize;
    //const posts = data.slice(offset, offset + pageSize);
    console.log("nftlising",listings);
    const posts = listings.slice(offset, offset + pageSize);
     
    /* React.useEffect(() => {
      fetch("https://jsonplaceholder.typicode.com/posts")
        .then((response) => response.json())
        .then((json) => {
          console.log("jsondata",json);
          setData(json);
          setLoading(false);
        });
    }, []);  */
  /* 
    React.useEffect(() => {
        setData(l);
        setLoading(false);
      }, []); */
     const Prev = React.forwardRef<HTMLInputElement>(
        (props, ref) => {
          return (
            <Button ref={ref} {...props}>
                Prev
            </Button>
          );
        }
      );
    /* const Prev = forwardRef((props, ref) => (
      <Button ref={ref} {...props}>
        Prev
      </Button>
    )); */
    
    const Next = React.forwardRef<HTMLInputElement>(
        (props, ref) => {
          return (
            <Button ref={ref} {...props}>
                Next
            </Button>
          );
        }
      );
    /* const Next = forwardRef((props, ref) => (
      <Button ref={ref} {...props}>
        Next
      </Button>
    )); */
  
    const itemRender = (_, type) => {
      if (type === "prev") {
        return Prev;
      }
      if (type === "next") {
        return Next;
      }
    };
    ////END
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

    return loading ? (
        <Container><Spinner /></Container>
      ) : (
        <>
        <Box>
        {priceFilter}
        <Container centerContent={true} h={{ base: 50}}>
        <Pagination
                current={current}
                onChange={(page) => {
                    setCurrent(page);
                    toast({
                        title: "Pagination.",
                        description: `You changed to page ${page}`,
                        variant: "solid",
                        duration: 9000,
                        isClosable: true,
                        position: "top-right"
                    });
                }}
                pageSize={pageSize}
                total={listings.length}
                itemRender={itemRender}
                paginationProps={{
                display: "flex",
                pos: "absolute",
                left: "50%",
                transform: "translateX(-50%)"
                }}
                colorScheme="red"
                focusRing="green"
            />
            </Container>
        </Box>
            <Grid
                templateRows="repeat(2, 1fr)"
                templateColumns="repeat(5, 1fr)"
                gap={5}
                px={{ base: 0, md: 5}}
                mt={{ base: 0, md: 5}}
            > 
                {posts.map((post) => (
                    <GridItem colSpan={colSpan} key={post.contract_addr}><ListingCard key={post.contract_addr} listing={post} /></GridItem>
                ))}
            </Grid>
        <Container centerContent={true}>
            <Text p={[0,5,10]}>
                Page {current}{" "}
            </Text>
        </Container>
    </>
  );
}