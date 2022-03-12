'use strict'

import * as React from 'react'
import { Button, Container } from '@chakra-ui/react';
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
                        return <Button 
                            key={t.id} 
                            variant='outlined'
                            href={'/tag/'+ t.name} 
                        >{t.name}</Button>
                    })
                } 
            </Container>
        </Container> 
    )
}