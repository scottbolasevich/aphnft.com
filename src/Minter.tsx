/* eslint-disable no-console */
'use strict'

import * as React from 'react'
import { storeNFT  } from './lib/ipfs'
import IPFS from 'ipfs-core'
import { FileInput } from "@blueprintjs/core"
import { Box, Button, Container, Center, FormControl, Input, Text, Textarea, Stack, Image } from '@chakra-ui/react'
import { NFT, NFTMetadata, emptyMetadata } from './lib/nft'
import { platform_settings as ps } from './lib/platform-conf'
import { showErrorToaster, showInfo } from './Toaster'
import { Wallet } from 'algorand-session-wallet'

type MinterProps = {
    history: any 
    wallet: Wallet
    acct: string
};

export default function Minter(props: MinterProps){
    const [meta, setMeta] = React.useState(emptyMetadata())
    const [loading, setLoading] = React.useState(false)
    const [imgSrc, setImgSrc] = React.useState(undefined);
    const [fileObj, setFileObj] = React.useState(undefined)

    function setFile(file: File) {

        setFileObj(file)

        const reader = new FileReader();
        reader.onload = (e) => { setImgSrc(e.target.result) }
        reader.readAsDataURL(file);

        console.log(file)
        setMeta(meta=>({
            ...meta,
            ["properties"]:{
                ...meta.properties, 
                "file":{
                    "name": file.name,
                    "size": file.size, 
                    "type": file.type 
                }
            }
        }))
    }

    function mintNFT(event) {
        event.stopPropagation()
        event.preventDefault()

        setLoading(true) 

        const metadata = captureMetadata()

        showInfo("Uploading to IPFS")

        storeNFT(fileObj, metadata).then((result) => {
            const nft = new NFT(metadata);
            nft.url = "ipfs://"+result.ipnft+"/metadata.json"

            showInfo("Creating token")
            nft.createToken(props.wallet).then((res) => {
                if ('asset-index' in res) 
                    props.history.push("/nft/" + res['asset-index'])
            }).catch((err)=>{ 
                showErrorToaster("Failed to create token: "+ err)
                setLoading(false)
            })

        }).catch((err) => { 
            showErrorToaster("Failed to Create NFT: " + err)
            setLoading(false)
        })

    }

    function handleChangeMeta(event) {
        const target = event.target

        const value = target.type == 'checkbox' ? target.checked : target.value

        const name = target.name
        if (name == "artist"){ //TODO: lol 
            setMeta(meta=>({ ...meta, ["properties"]:{...meta.properties, "artist":value} }))
        }else{
            setMeta(meta=>({ ...meta, [name]: value }))
        }
    }

    function captureMetadata(): NFTMetadata {
        return {
            name:       meta.name,
            description: meta.description,
            properties:{
                file:{
                    name: meta.properties.file.name,
                    size: meta.properties.file.size,
                    type: meta.properties.file.type,
                },
                artist: meta.properties.artist,
            }
        } as NFTMetadata
    }

    return (
        <Container p={4}>
            <Center>
                <Text fontSize='xl'>Upload your Image to Mint Your NFT</Text>
            </Center>
            <Box p={4}>
                <FormControl as='fieldset'>
                        <Stack spacing={4}>
                            <Uploader
                            imgSrc={imgSrc}
                            setFile={setFile}
                            {...meta} />
                            <Input
                                name='name'
                                placeholder='Title...'
                                onChange={handleChangeMeta}
                                id='name'
                                value={meta.name} />
                            <Input
                                name='artist'
                                placeholder='Artist...'
                                onChange={handleChangeMeta}
                                id='artist'
                                value={meta.properties.artist} />
                            <Textarea 
                                placeholder='Description...'
                                onChange={handleChangeMeta}
                                name='description'
                                id='description'
                                value={meta.description} />
                        </Stack>
                        <Box pt={4}>
                            <Button
                                colorScheme='blue'
                                onClick={mintNFT}>Mint</Button>
                        </Box>
                </FormControl>
            </Box>
        </Container>
    )

}

type UploaderProps = {
    imgSrc: string
    setFile(f: File)
};

function Uploader(props: UploaderProps) {
    const [cid, setCID] = React.useState(undefined)

    function captureFile(event) {
        event.stopPropagation()
        event.preventDefault()


        props.setFile(event.target.files.item(0))
    }

    if (props.imgSrc === undefined || props.imgSrc == "" ) return (
        <Container>
           <FileInput large={true} disabled={false} text="..." onInputChange={captureFile} />
        </Container>
    )


    return (
        <Container>
           <Image id="gateway-link" src={props.imgSrc} />
        </Container>
    )
}