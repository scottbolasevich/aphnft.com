'use strict'

import * as React from 'react'
import { Button, Container, Link, List, ListItem } from '@chakra-ui/react';
import { Listing } from './lib/listing'


type ListingCardProps = { key: string, listing: Listing; };

export function ListingCard(props: ListingCardProps) {

    const l  = props.listing
    const md = l.nft.metadata

    return (
        <Container>
            <Container>
                <Link href={'/listing/'+l.contract_addr}>
                    <img src={l.nft.imgSrc()}></img>
                </Link>
            </Container>
            <Container>
                <Link href={'/listing/'+l.contract_addr}> 
                    <b>{md.name}</b> - <i>{md.properties.artist}</i> ({l.price} μAlgos)
                </Link>
            </Container>
            <Container>
                <List spacing={3}>
                {
                    l.tags.map((t)=>{
                        return <ListItem key={t.id}><Link href={'/tag/'+ t.name}>{t.name}</Link></ListItem>
                    })
                } 
                </List>
            </Container>
        </Container> 
    )
}