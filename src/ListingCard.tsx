'use strict'

import * as React from 'react'
import { Button, Container, Link } from '@chakra-ui/react';
import { Listing } from './lib/listing'


type ListingCardProps = { key: string, listing: Listing; };

export function ListingCard(props: ListingCardProps) {

    const l  = props.listing
    const md = l.nft.metadata

    return (
        <Container>
            <Container>
                <a href={'/listing/'+l.contract_addr}>
                    <img src={l.nft.imgSrc()}></img>
                </a>
            </Container>
            <Container>
                <a href={'/listing/'+l.contract_addr}> 
                    <b>{md.name}</b> - <i>{md.properties.artist}</i> ({l.price} μAlgos)
                </a>
            </Container>
            <Container>
                {
                    l.tags.map((t)=>{
                        return <Link href={'/tag/'+ t.name}><Button as="a">{t.name}</Button></Link>
                    })
                } 
            </Container>
        </Container> 
    )
}