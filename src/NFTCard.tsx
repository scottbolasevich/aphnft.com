
/* eslint-disable no-console */
'use strict'

import * as React from 'react'
import { Box, Container, Text, Link, Image } from '@chakra-ui/react'
import { NFT } from './lib/nft'

type NFTCardState = {};
type NFTCardProps = {
    nft: NFT;
};

export function NFTCard(props: NFTCardProps) {
    return (
        <Box margin={5} borderWidth='1px' borderRadius='lg'>
            <Container p={4}>
                <Link href={'/nft/'+props.nft.asset_id}>
                    <Image src={props.nft.imgSrc()} />
                </Link>
            </Container>
            <Container p={4}>
                <Text>
                    <Link href={'/nft/'+props.nft.asset_id}>
                        <b>{props.nft.metadata.name}</b> - <i>{props.nft.metadata.properties.artist}</i>
                    </Link>
                </Text>
            </Container>
            <Container p={4}>
                <Text>{props.nft.metadata.description}</Text>
            </Container>
        </Box> 
    )

}